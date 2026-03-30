import Submission from "@/models/submission.model";
import User from "@/models/userModel";

export async function getLeaderboard(limit = null) {
  const leaderboardRows = await Submission.aggregate([
    {
      $project: {
        userId: 1,
        reviewCount: { $size: { $ifNull: ["$reviews", []] } },
        likeCount: { $size: { $ifNull: ["$likedBy", []] } },
      },
    },
    {
      $group: {
        _id: "$userId",
        submissionCount: { $sum: 1 },
        reviewCount: { $sum: "$reviewCount" },
        likeCount: { $sum: "$likeCount" },
      },
    },
    {
      $addFields: {
        score: {
          $add: [
            { $multiply: ["$submissionCount", 5] },
            { $multiply: ["$reviewCount", 3] },
            "$likeCount",
          ],
        },
      },
    },
  ]);

  const scoreMap = new Map(
    leaderboardRows.map((entry) => [
      String(entry._id || ""),
      {
        submissionCount: Number(entry.submissionCount || 0),
        reviewCount: Number(entry.reviewCount || 0),
        likeCount: Number(entry.likeCount || 0),
        score: Number(entry.score || 0),
      },
    ])
  );

  const users = await User.find({}).select("name avatar").lean();

  const merged = users.map((user) => {
    const stats = scoreMap.get(String(user._id)) || {
      submissionCount: 0,
      reviewCount: 0,
      likeCount: 0,
      score: 0,
    };

    return {
      _id: String(user._id || ""),
      name: user?.name || "Peer Reviewer",
      avatar: user?.avatar || "",
      submissionCount: stats.submissionCount,
      reviewCount: stats.reviewCount,
      likeCount: stats.likeCount,
      score: stats.score,
    };
  });

  const sorted = merged.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
    if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount;
    if (b.submissionCount !== a.submissionCount) return b.submissionCount - a.submissionCount;
    return a.name.localeCompare(b.name);
  });

  const ranked = sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return typeof limit === "number" ? ranked.slice(0, limit) : ranked;
}
