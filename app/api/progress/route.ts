import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Progress } from "@/lib/models";
import { computeStats } from "@/lib/badges";
import { QUESTION_IDS, TOTAL, validQuestionIds } from "@/lib/data";
import { toDateKey, computeStreaks } from "@/lib/streak";
import { apiError, InputError, readBody } from "@/lib/http";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const doc = await Progress.findOne({ userId });
    const activityLog: Record<string, number> = doc?.activityLog
      ? Object.fromEntries(doc.activityLog)
      : {};
    return NextResponse.json({
      done: validQuestionIds(doc?.done ?? []),
      revision: doc?.revision ?? 0,
      activityLog,
      ...computeStreaks(activityLog),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readBody(req, 20_000);
    if (
      !Array.isArray(body.done) ||
      body.done.length > TOTAL ||
      body.done.some((id) => typeof id !== "string" || !QUESTION_IDS.has(id))
    )
      throw new InputError("Progress must contain valid question IDs");
    if (
      typeof body.revision !== "number" ||
      !Number.isSafeInteger(body.revision) ||
      body.revision < 0
    )
      throw new InputError("A valid progress revision is required");
    const done = validQuestionIds(body.done);
    await connectDB();
    // Create once, then use an atomic revision match so concurrent devices cannot overwrite each other.
    await Progress.updateOne(
      { userId },
      { $setOnInsert: { userId } },
      { upsert: true },
    );
    const existing = await Progress.findOne({ userId });
    if (!existing || (existing.revision ?? 0) !== body.revision)
      return NextResponse.json(
        { error: "Progress changed on another device. Refresh and retry." },
        { status: 409 },
      );
    const trackedIds = new Set<string>(
      validQuestionIds([
        ...(existing.trackedIds ?? []),
        ...(existing.done ?? []),
      ]),
    );
    const added = done.filter((id) => !trackedIds.has(id));
    added.forEach((id) => trackedIds.add(id));
    const activityLog: Record<string, number> = existing.activityLog
      ? Object.fromEntries(existing.activityLog)
      : {};
    if (added.length) {
      const today = toDateKey(new Date());
      activityLog[today] = (activityLog[today] ?? 0) + added.length;
    }
    const streaks = computeStreaks(activityLog);
    const stats = computeStats(new Set(done));
    const updated = await Progress.findOneAndUpdate(
      {
        userId,
        $or: [
          { revision: body.revision },
          ...(body.revision === 0 ? [{ revision: { $exists: false } }] : []),
        ],
      },
      {
        $set: {
          done,
          ...stats,
          ...streaks,
          activityLog,
          trackedIds: [...trackedIds],
          updatedAt: new Date(),
        },
        $inc: { revision: 1 },
      },
      { new: true, runValidators: true },
    );
    if (!updated)
      return NextResponse.json(
        { error: "Progress changed. Retry your changes." },
        { status: 409 },
      );
    return NextResponse.json({
      done,
      revision: updated.revision,
      activityLog,
      ...streaks,
    });
  } catch (error) {
    return apiError(error);
  }
}
