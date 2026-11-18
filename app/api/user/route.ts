import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { apiError, InputError, readBody } from "@/lib/http";
import {
  daysLeft,
  normalizeHandle,
  normalizeUsername,
  validAvatar,
} from "@/lib/profile";

const FIELDS =
  "username avatarUrl joinedAt usernameChangedAt avatarChangedAt links -_id";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    return NextResponse.json({
      user: await User.findOne({ userId }).select(FIELDS).lean(),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readBody(req, 2000);
    const username = normalizeUsername(body.username);
    if (!username)
      throw new InputError(
        "Use 3–20 lowercase letters, numbers, or underscores",
      );
    await connectDB();
    // Setup is idempotent. Renames must pass PATCH's cooldown checks.
    const existing = await User.findOne({ userId }).select(FIELDS).lean();
    if (existing) return NextResponse.json({ user: existing });
    const clerkUser = await currentUser();
    const user = await User.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          username,
          avatarUrl: clerkUser?.imageUrl ?? "",
        },
      },
      { upsert: true, new: true, runValidators: true },
    )
      .select(FIELDS)
      .lean();
    return NextResponse.json({ user });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readBody(req);
    await connectDB();
    const user = await User.findOne({ userId });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    const update: Record<string, unknown> = {};
    const conditions: Record<string, unknown> = { userId };
    if (body.username !== undefined) {
      const username = normalizeUsername(body.username);
      if (!username)
        throw new InputError(
          "Use 3–20 lowercase letters, numbers, or underscores",
        );
      if (username !== user.username) {
        const days = daysLeft(user.usernameChangedAt);
        if (days)
          return NextResponse.json(
            { error: `Username can be changed in ${days} day(s)` },
            { status: 429 },
          );
        update.username = username;
        update.usernameChangedAt = new Date();
        conditions.usernameChangedAt = user.usernameChangedAt ?? null;
      }
    }
    if (body.avatarUrl !== undefined && body.avatarUrl !== user.avatarUrl) {
      if (!validAvatar(body.avatarUrl))
        throw new InputError(
          "Use an HTTPS image URL or a PNG, JPEG, WebP, or GIF under 250 KB",
        );
      const days = daysLeft(user.avatarChangedAt);
      if (days)
        return NextResponse.json(
          { error: `Avatar can be changed in ${days} day(s)` },
          { status: 429 },
        );
      update.avatarUrl = body.avatarUrl;
      update.avatarChangedAt = new Date();
      conditions.avatarChangedAt = user.avatarChangedAt ?? null;
    }
    if (body.links !== undefined) {
      if (
        !body.links ||
        typeof body.links !== "object" ||
        Array.isArray(body.links)
      )
        throw new InputError("Invalid profile links");
      const links = body.links as Record<string, unknown>;
      for (const service of ["leetcode", "linkedin", "github"] as const) {
        if (links[service] === undefined) continue;
        const handle = normalizeHandle(links[service], service);
        if (handle === null)
          throw new InputError(
            `Enter a valid ${service} username or profile URL`,
          );
        update[`links.${service}`] = handle;
      }
    }
    const updated = await User.findOneAndUpdate(
      conditions,
      { $set: update },
      { new: true, runValidators: true },
    )
      .select(FIELDS)
      .lean();
    if (!updated)
      return NextResponse.json(
        { error: "Profile changed in another tab. Reload and try again." },
        { status: 409 },
      );
    return NextResponse.json({ user: updated });
  } catch (error) {
    return apiError(error);
  }
}
