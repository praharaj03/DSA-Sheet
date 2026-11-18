import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Progress } from "@/lib/models";
import { apiError } from "@/lib/http";

type Ranking = {
  username: string;
  avatarUrl: string;
  totalSolved: number;
  topicsDone: number;
  badges: string[];
  score: number;
  isMe: boolean;
};

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const rows = await Progress.aggregate<Ranking>([
      {
        $lookup: {
          from: User.collection.name,
          localField: "userId",
          foreignField: "userId",
          as: "profile",
        },
      },
      { $unwind: "$profile" },
      { $sort: { score: -1, totalSolved: -1, userId: 1 } },
      { $limit: 50 },
      {
        $project: {
          _id: 0,
          username: "$profile.username",
          avatarUrl: "$profile.avatarUrl",
          totalSolved: 1,
          topicsDone: 1,
          badges: 1,
          score: 1,
          isMe: { $eq: ["$userId", userId] },
        },
      },
    ]);
    return NextResponse.json({
      rows: rows.map((row, index) => ({ ...row, rank: index + 1 })),
    });
  } catch (error) {
    return apiError(error);
  }
}
