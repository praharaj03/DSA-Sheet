import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function canChange(changedAt: Date | null) {
  if (!changedAt) return { ok: true, daysLeft: 0 };
  const diff = Date.now() - new Date(changedAt).getTime();
  if (diff >= THIRTY_DAYS) return { ok: true, daysLeft: 0 };
  return { ok: false, daysLeft: Math.ceil((THIRTY_DAYS - diff) / 86400000) };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const user = await User.findOne({ userId });
  return NextResponse.json({ user: user ?? null });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await req.json();
  const clean = username?.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!clean || clean.length < 3 || clean.length > 20)
    return NextResponse.json({ error: "Username must be 3–20 chars (letters, numbers, _)" }, { status: 400 });

  await connectDB();
  const existing = await User.findOne({ username: clean });
  if (existing && existing.userId !== userId)
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });

  const clerkUser = await currentUser();
  const avatarUrl = clerkUser?.imageUrl ?? "";

  const user = await User.findOneAndUpdate(
    { userId },
    { userId, username: clean, avatarUrl },
    { upsert: true, new: true }
  );
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();
  const user = await User.findOne({ userId });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const update: Record<string, any> = {};

  // Username change
  if (body.username !== undefined) {
    const { ok, daysLeft } = canChange(user.usernameChangedAt);
    if (!ok) return NextResponse.json({ error: `Username can be changed in ${daysLeft} day(s)` }, { status: 429 });

    const clean = body.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!clean || clean.length < 3 || clean.length > 20)
      return NextResponse.json({ error: "Username must be 3–20 chars" }, { status: 400 });

    const taken = await User.findOne({ username: clean });
    if (taken && taken.userId !== userId)
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });

    update.username = clean;
    update.usernameChangedAt = new Date();
  }

  // Avatar change
  if (body.avatarUrl !== undefined) {
    const { ok, daysLeft } = canChange(user.avatarChangedAt);
    if (!ok) return NextResponse.json({ error: `Avatar can be changed in ${daysLeft} day(s)` }, { status: 429 });
    update.avatarUrl = body.avatarUrl;
    update.avatarChangedAt = new Date();
  }

  // Links (no cooldown)
  if (body.links) {
    update["links.leetcode"] = body.links.leetcode ?? user.links?.leetcode ?? "";
    update["links.linkedin"] = body.links.linkedin ?? user.links?.linkedin ?? "";
    update["links.github"]   = body.links.github   ?? user.links?.github   ?? "";
  }

  const updated = await User.findOneAndUpdate({ userId }, { $set: update }, { new: true });
  return NextResponse.json({ user: updated });
}
