import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Progress } from "@/lib/models";
import { computeStats } from "@/lib/badges";
import { toDateKey, computeStreaks } from "@/lib/streak";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const doc = await Progress.findOne({ userId });
  return NextResponse.json({
    done: doc?.done ?? [],
    activityLog: doc?.activityLog ? Object.fromEntries(doc.activityLog) : {},
    currentStreak: doc?.currentStreak ?? 0,
    maxStreak: doc?.maxStreak ?? 0,
  });
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { done } = await req.json();
  const stats = computeStats(new Set<string>(done));

  await connectDB();
  const existing = await Progress.findOne({ userId });

  // Update activity log: today's count = how many solved today
  const prevDone = new Set<string>(existing?.done ?? []);
  const newDone = new Set<string>(done);
  const addedToday = [...newDone].filter((id) => !prevDone.has(id)).length;

  const activityLog: Record<string, number> = existing?.activityLog
    ? Object.fromEntries(existing.activityLog)
    : {};

  const today = toDateKey(new Date());
  if (addedToday > 0) {
    activityLog[today] = (activityLog[today] ?? 0) + addedToday;
  }

  const { currentStreak, maxStreak } = computeStreaks(activityLog);

  await Progress.findOneAndUpdate(
    { userId },
    { done, ...stats, activityLog, currentStreak, maxStreak, updatedAt: new Date() },
    { upsert: true }
  );
  return NextResponse.json({ ok: true, stats, currentStreak, maxStreak });
}
