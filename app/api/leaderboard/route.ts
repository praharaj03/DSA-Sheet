import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Progress } from "@/lib/models";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const progresses = await Progress.find({}).sort({ score: -1 }).limit(50).lean();
  const userIds = progresses.map((p: any) => p.userId);
  const users = await User.find({ userId: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u: any) => [u.userId, u]));

  const rows = progresses
    .map((p: any, i: number) => {
      const u = userMap.get(p.userId);
      if (!u) return null;
      return {
        rank: i + 1,
        userId: p.userId,
        username: (u as any).username,
        avatarUrl: (u as any).avatarUrl,
        totalSolved: p.totalSolved,
        topicsDone: p.topicsDone,
        badges: p.badges,
        score: p.score,
        isMe: p.userId === userId,
      };
    })
    .filter(Boolean);

  // Return current user's done list for company % calculation
  const myProgress = await Progress.findOne({ userId });
  const myDone: string[] = myProgress?.done ?? [];

  return NextResponse.json({ rows, myDone });
}
