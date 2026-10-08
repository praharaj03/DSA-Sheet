import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

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
