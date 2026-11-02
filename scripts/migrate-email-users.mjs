import mongoose from "mongoose";
import { clerkClient } from "@clerk/nextjs/server";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set");

const apply = process.argv.includes("--apply");
const client = await clerkClient();
await mongoose.connect(uri, { autoIndex: false });

try {
  const users = mongoose.connection.collection("users");
  const progress = mongoose.connection.collection("progresses");
  const records = await users.find({}).toArray();
  const usersByEmail = new Map();
  let skipped = 0;

  for (const record of records) {
    let email = record.email;
    if (!email) {
      try {
        const clerkUser = await client.users.getUser(record.userId);
        email = clerkUser.emailAddresses
          .find((address) => address.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress;
      } catch {
        skipped++;
        continue;
      }
    }

    if (!email) {
      skipped++;
      continue;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const group = usersByEmail.get(normalizedEmail) ?? [];
    group.push(record);
    usersByEmail.set(normalizedEmail, group);
  }

  const duplicateGroups = Array.from(usersByEmail.values()).filter(
    (group) => group.length > 1,
  );
  const duplicateCount = duplicateGroups.reduce(
    (total, group) => total + group.length - 1,
    0,
  );

  console.log(
    `${apply ? "Applying" : "Dry run"}: ${usersByEmail.size} email identities, ` +
      `${duplicateGroups.length} duplicate groups, ${duplicateCount} duplicate accounts, ` +
      `${skipped} accounts without an available email.`,
  );

  if (!apply) {
    console.log("Review the counts, then rerun with --apply to merge duplicates.");
    process.exitCode = 0;
  } else {
    const indexes = await users.indexes().catch((error) => {
      if (error.code === 26) return [];
      throw error;
    });
    if (indexes.some((index) => index.name === "username_1")) {
      await users.dropIndex("username_1");
    }

    for (const [email, group] of usersByEmail) {
      group.sort((left, right) => {
        const dateDifference =
          new Date(left.joinedAt ?? 0).getTime() -
          new Date(right.joinedAt ?? 0).getTime();
        return dateDifference || String(left._id).localeCompare(String(right._id));
      });

      const [oldest, ...duplicates] = group;
      const duplicateUserIds = duplicates.map((user) => user.userId);
      if (duplicates.length > 0) {
        await mergeProgress(progress, oldest.userId, duplicateUserIds);
      }

      await users.updateOne(
        { _id: oldest._id },
        { $set: { email }, $unset: { username: "" } },
      );

      if (duplicateUserIds.length > 0) {
        await users.deleteMany({ userId: { $in: duplicateUserIds } });
      }
    }

    await users.createIndex(
      { email: 1 },
      {
        name: "email_1",
        unique: true,
        partialFilterExpression: { email: { $type: "string" } },
      },
    );
    console.log("Email records migrated; duplicates kept the oldest account.");
  }
} finally {
  await mongoose.disconnect();
}

async function mergeProgress(progress, canonicalUserId, duplicateUserIds) {
  const documents = await progress
    .find({ userId: { $in: [canonicalUserId, ...duplicateUserIds] } })
    .toArray();
  if (documents.length === 0) return;

  const done = Array.from(new Set(documents.flatMap((document) => document.done ?? [])));
  const activityLog = {};
  for (const document of documents) {
    for (const [day, count] of Object.entries(document.activityLog ?? {})) {
      activityLog[day] = Math.max(activityLog[day] ?? 0, Number(count));
    }
  }

  const companiesDone = Array.from(
    new Set(documents.flatMap((document) => document.companiesDone ?? [])),
  );
  const badges = Array.from(new Set(documents.flatMap((document) => document.badges ?? [])));
  const highestScore = Math.max(...documents.map((document) => document.score ?? 0));

  await progress.updateOne(
    { userId: canonicalUserId },
    {
      $set: {
        userId: canonicalUserId,
        done,
        totalSolved: done.length,
        topicsDone: Math.max(...documents.map((document) => document.topicsDone ?? 0)),
        companiesDone,
        badges,
        score: Math.max(highestScore, done.length),
        activityLog,
        currentStreak: Math.max(...documents.map((document) => document.currentStreak ?? 0)),
        maxStreak: Math.max(...documents.map((document) => document.maxStreak ?? 0)),
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
  await progress.deleteMany({ userId: { $in: duplicateUserIds } });
}
