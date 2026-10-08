import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Progress } from "@/lib/models";
import { computeStats } from "@/lib/badges";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const doc = await Progress.findOne({ userId });
  return NextResponse.json({ done: doc?.done ?? [] });
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { done } = await req.json();
  const stats = computeStats(new Set<string>(done));

  await connectDB();
  await Progress.findOneAndUpdate(
    { userId },
    { done, ...stats, updatedAt: new Date() },
    { upsert: true }
  );
  return NextResponse.json({ ok: true, stats });
}
