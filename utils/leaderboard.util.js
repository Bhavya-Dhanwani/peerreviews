import Submission from "@/models/submission.model";
import User from "@/models/userModel";

const MIN_CREDIBILITY_SCORE = 0.2;
const MAX_CREDIBILITY_SCORE = 1.5;
const CONSISTENT_BEHAVIOR_DEVIATION = 1;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getMapValue(source, key) {
  if (!source || key == null) {
    return undefined;
  }

  if (source instanceof Map) {
    return source.get(String(key));
  }

  return source[String(key)];
}

function getReviewCount(user = {}) {
  return toNumber(user.reviewCount ?? user.totalReviewsGiven ?? user.reviewStats?.totalReviewsGiven);
}

function getDistinctProjectCount(user = {}) {
  return toNumber(user.distinctProjectsReviewed ?? user.reviewStats?.distinctProjectsReviewed);
}

function getAccountAgeDays(user = {}) {
  const createdAt = user.createdAt ? new Date(user.createdAt) : null;

  if (!createdAt || Number.isNaN(createdAt.getTime())) {
    return 0;
  }

  return (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
}

function getConnectedIdentityCount(user = {}) {
  const directConnections = [
    user.githubConnected,
    user.linkedinConnected,
    user.githubUrl,
    user.linkedinUrl,
    user.socialProfiles?.github,
    user.socialProfiles?.linkedin,
  ].filter(Boolean).length;

  const providers = Array.isArray(user.connectedProviders) ? user.connectedProviders.filter(Boolean).length : 0;

  return Math.max(directConnections, providers);
}

function normalizeRatingValue(entry) {
  if (typeof entry === "number") {
    return entry;
  }

  if (typeof entry?.rating === "number") {
    return entry.rating;
  }

  if (typeof entry?.score === "number") {
    return entry.score;
  }

  if (typeof entry?.averageScore === "number") {
    return entry.averageScore;
  }

  if (Array.isArray(entry?.ratings) && entry.ratings.length) {
    const total = entry.ratings.reduce((sum, rating) => sum + toNumber(rating?.score), 0);
    return total / entry.ratings.length;
  }

  return 0;
}

function normalizeProjectRatings(projectRatings = []) {
  if (!Array.isArray(projectRatings)) {
    return [];
  }

  return projectRatings
    .map((entry, index) => {
      const rating = clamp(normalizeRatingValue(entry), 0, 5);
      const reviewerId = String(entry?.reviewerId?._id || entry?.reviewerId || entry?.userId || entry?.raterId || index);

      return {
        rating,
        reviewerId,
        raw: entry,
      };
    })
    .filter((entry) => entry.rating > 0);
}

function isConsistentWithGlobalAverage(user = {}) {
  const deviation = user.averageDeviationFromGlobal ?? user.reviewStats?.averageDeviationFromGlobal;

  if (Number.isFinite(deviation)) {
    return deviation <= CONSISTENT_BEHAVIOR_DEVIATION;
  }

  const averageRatingGiven = user.averageRatingGiven ?? user.reviewStats?.averageRatingGiven;
  const globalAverageRating = user.globalAverageRating ?? user.reviewStats?.globalAverageRating;

  if (!Number.isFinite(averageRatingGiven) || !Number.isFinite(globalAverageRating)) {
    return false;
  }

  return Math.abs(averageRatingGiven - globalAverageRating) <= CONSISTENT_BEHAVIOR_DEVIATION;
}

function alwaysGivesExtremeRatings(user = {}) {
  if (typeof user.alwaysExtremeRatings === "boolean") {
    return user.alwaysExtremeRatings;
  }

  const givenRatings = Array.isArray(user.givenRatings)
    ? user.givenRatings.map((value) => clamp(toNumber(value), 0, 5)).filter(Boolean)
    : [];

  if (givenRatings.length) {
    return givenRatings.every((value) => value === 1 || value === 5);
  }

  const ratingCount = toNumber(user.ratingCount ?? user.reviewStats?.ratingCount);
  const extremeRatingCount = toNumber(user.extremeRatingCount ?? user.reviewStats?.extremeRatingCount);

  return ratingCount > 0 && extremeRatingCount === ratingCount;
}

export function detectSuspiciousUser(user = {}) {
  return Boolean(
    user.isSuspicious ||
      user.suspicious ||
      user.abuseSignals?.suspicious ||
      toNumber(user.abuseSignals?.sameIpMatches) > 0 ||
      toNumber(user.abuseSignals?.spamFlags) > 0
  );
}

export function adjustCredibilityIfSuspicious(user = {}, credibilityScore) {
  let adjustedScore = credibilityScore;

  if (detectSuspiciousUser(user)) {
    adjustedScore -= 0.5;
  }

  if (user.confirmedAbuse || user.abuseConfirmed || user.abuseSignals?.confirmedAbuse) {
    adjustedScore -= 1;
  }

  return clamp(adjustedScore, MIN_CREDIBILITY_SCORE, MAX_CREDIBILITY_SCORE);
}

export function calculateCredibility(user = {}) {
  let credibilityScore = 1;
  const accountAgeDays = getAccountAgeDays(user);
  const reviewCount = getReviewCount(user);
  const distinctProjectCount = getDistinctProjectCount(user);

  if (accountAgeDays > 30) {
    credibilityScore += 0.3;
  } else if (accountAgeDays > 7) {
    credibilityScore += 0.1;
  }

  if (reviewCount >= 10) {
    credibilityScore += 0.5;
  } else if (reviewCount >= 5) {
    credibilityScore += 0.3;
  }

  if (user.isVerified || user.emailVerified) {
    credibilityScore += 0.2;
  }

  if (getConnectedIdentityCount(user) > 0) {
    credibilityScore += 0.3;
  }

  if (isConsistentWithGlobalAverage(user)) {
    credibilityScore += 0.4;
  }

  if (alwaysGivesExtremeRatings(user)) {
    credibilityScore -= 0.3;
  }

  if (distinctProjectCount === 1) {
    credibilityScore -= 0.3;
  }

  return adjustCredibilityIfSuspicious(user, credibilityScore);
}

export function getCredibilityReport(user = {}) {
  const accountAgeDays = getAccountAgeDays(user);
  const reviewCount = getReviewCount(user);
  const distinctProjectCount = getDistinctProjectCount(user);
  const suspicious = detectSuspiciousUser(user);
  const confirmedAbuse = Boolean(user.confirmedAbuse || user.abuseConfirmed || user.abuseSignals?.confirmedAbuse);
  const consistentWithGlobalAverage = isConsistentWithGlobalAverage(user);
  const extremeRatingsOnly = alwaysGivesExtremeRatings(user);
  const hasConnectedIdentity = getConnectedIdentityCount(user) > 0;
  const emailVerified = Boolean(user.isVerified || user.emailVerified);

  const contributions = [
    {
      label: "Base score",
      value: 1,
      type: "base",
      applied: true,
    },
    {
      label: "Account age > 30 days",
      value: 0.3,
      type: "bonus",
      applied: accountAgeDays > 30,
    },
    {
      label: "Account age > 7 days",
      value: 0.1,
      type: "bonus",
      applied: accountAgeDays > 7 && accountAgeDays <= 30,
    },
    {
      label: "10+ reviews given",
      value: 0.5,
      type: "bonus",
      applied: reviewCount >= 10,
    },
    {
      label: "5+ reviews given",
      value: 0.3,
      type: "bonus",
      applied: reviewCount >= 5 && reviewCount < 10,
    },
    {
      label: "Email verified",
      value: 0.2,
      type: "bonus",
      applied: emailVerified,
    },
    {
      label: "GitHub/LinkedIn connected",
      value: 0.3,
      type: "bonus",
      applied: hasConnectedIdentity,
    },
    {
      label: "Rating behavior consistent with global average",
      value: 0.4,
      type: "bonus",
      applied: consistentWithGlobalAverage,
    },
    {
      label: "Only extreme ratings detected",
      value: -0.3,
      type: "penalty",
      applied: extremeRatingsOnly,
    },
    {
      label: "Reviewed only one project",
      value: -0.3,
      type: "penalty",
      applied: distinctProjectCount === 1,
    },
    {
      label: "Suspicious behavior detected",
      value: -0.5,
      type: "penalty",
      applied: suspicious,
    },
    {
      label: "Confirmed abuse",
      value: -1,
      type: "penalty",
      applied: confirmedAbuse,
    },
  ];

  const rawScore = contributions
    .filter((entry) => entry.applied)
    .reduce((total, entry) => total + entry.value, 0);

  return {
    credibilityScore: clamp(rawScore, MIN_CREDIBILITY_SCORE, MAX_CREDIBILITY_SCORE),
    rawScore,
    minScore: MIN_CREDIBILITY_SCORE,
    maxScore: MAX_CREDIBILITY_SCORE,
    inputs: {
      accountAgeDays,
      reviewCount,
      distinctProjectCount,
      emailVerified,
      hasConnectedIdentity,
      consistentWithGlobalAverage,
      extremeRatingsOnly,
      suspicious,
      confirmedAbuse,
    },
    contributions,
  };
}

export function buildUserCredibilityMap(users = []) {
  if (!Array.isArray(users)) {
    return {};
  }

  return users.reduce((map, user) => {
    if (!user?._id) {
      return map;
    }

    map[String(user._id)] = {
      ...user,
      credibilityScore: calculateCredibility(user),
    };

    return map;
  }, {});
}

export function calculateWeightedRating(projectRatings = [], userCredibilityMap = {}) {
  const normalizedRatings = normalizeProjectRatings(projectRatings);

  if (!normalizedRatings.length) {
    return 0;
  }

  const weighted = normalizedRatings.reduce(
    (accumulator, entry) => {
      const credibilityScore = clamp(
        toNumber(getMapValue(userCredibilityMap, entry.reviewerId)?.credibilityScore ?? getMapValue(userCredibilityMap, entry.reviewerId), 1),
        MIN_CREDIBILITY_SCORE,
        MAX_CREDIBILITY_SCORE
      );

      return {
        weightedSum: accumulator.weightedSum + entry.rating * credibilityScore,
        credibilitySum: accumulator.credibilitySum + credibilityScore,
      };
    },
    { weightedSum: 0, credibilitySum: 0 }
  );

  return weighted.credibilitySum > 0 ? weighted.weightedSum / weighted.credibilitySum : 0;
}

export function calculateBayesianScore(R, v, C, m) {
  const totalVotes = toNumber(v);
  const averageVotes = toNumber(m);

  if (totalVotes + averageVotes === 0) {
    return toNumber(C);
  }

  return (totalVotes / (totalVotes + averageVotes)) * toNumber(R) + (averageVotes / (totalVotes + averageVotes)) * toNumber(C);
}

export function calculateFinalScore(score, v, m) {
  const totalVotes = toNumber(v);
  const averageVotes = toNumber(m);
  const confidence = totalVotes + averageVotes > 0 ? totalVotes / (totalVotes + averageVotes) : 0;

  return toNumber(score) * confidence * Math.log10(totalVotes + 1);
}

export function createEmptyGlobalStats() {
  return {
    totalProjectCount: 0,
    totalReviewCount: 0,
    totalProjectRatingSum: 0,
  };
}

export function calculateGlobalValues(allProjectsStats = {}) {
  const totalProjectCount = toNumber(allProjectsStats.totalProjectCount);
  const totalReviewCount = toNumber(allProjectsStats.totalReviewCount);
  const totalProjectRatingSum = toNumber(allProjectsStats.totalProjectRatingSum);

  return {
    C: totalProjectCount > 0 ? totalProjectRatingSum / totalProjectCount : 0,
    m: totalProjectCount > 0 ? totalReviewCount / totalProjectCount : 0,
  };
}

export function applyProjectStatsDelta(allProjectsStats = createEmptyGlobalStats(), previousProjectScore = null, nextProjectScore = null) {
  const snapshot = {
    totalProjectCount: toNumber(allProjectsStats.totalProjectCount),
    totalReviewCount: toNumber(allProjectsStats.totalReviewCount),
    totalProjectRatingSum: toNumber(allProjectsStats.totalProjectRatingSum),
  };

  if (previousProjectScore) {
    snapshot.totalProjectCount = Math.max(0, snapshot.totalProjectCount - 1);
    snapshot.totalReviewCount = Math.max(0, snapshot.totalReviewCount - toNumber(previousProjectScore.reviewCount));
    snapshot.totalProjectRatingSum = Math.max(0, snapshot.totalProjectRatingSum - toNumber(previousProjectScore.weightedRating));
  }

  if (nextProjectScore) {
    snapshot.totalProjectCount += 1;
    snapshot.totalReviewCount += toNumber(nextProjectScore.reviewCount);
    snapshot.totalProjectRatingSum += toNumber(nextProjectScore.weightedRating);
  }

  return snapshot;
}

export function buildGlobalStatsSnapshot(projects = [], userMap = {}) {
  return projects.reduce((stats, project) => {
    const ratings = normalizeProjectRatings(project?.reviews ?? project?.projectRatings ?? []);
    const credibilityMap = ratings.reduce((map, entry) => {
      const reviewer = getMapValue(userMap, entry.reviewerId) || {};
      map[entry.reviewerId] = { credibilityScore: calculateCredibility(reviewer) };
      return map;
    }, {});

    const weightedRating = calculateWeightedRating(ratings, credibilityMap);

    return applyProjectStatsDelta(stats, null, {
      reviewCount: ratings.length,
      weightedRating,
    });
  }, createEmptyGlobalStats());
}

export function updateProjectScore(project = {}, allProjectsStats = {}, userMap = {}) {
  const ratings = normalizeProjectRatings(project?.reviews ?? project?.projectRatings ?? project?.ratings ?? []);
  const credibility = {};

  for (const entry of ratings) {
    const reviewer = getMapValue(userMap, entry.reviewerId) || {};
    credibility[entry.reviewerId] = {
      credibilityScore: calculateCredibility(reviewer),
    };
  }

  const R = calculateWeightedRating(ratings, credibility);
  const v = ratings.length;
  const { C, m } = calculateGlobalValues(allProjectsStats);
  const bayesianScore = calculateBayesianScore(R, v, C, m);
  const finalScore = calculateFinalScore(bayesianScore, v, m);

  return {
    ...project,
    weightedRating: R,
    reviewCount: v,
    bayesianScore,
    finalScore,
    credibility,
    leaderboardStats: {
      weightedRating: R,
      reviewCount: v,
      bayesianScore,
      finalScore,
      globalAverageRating: C,
      averageReviewsPerProject: m,
      updatedAt: new Date(),
    },
  };
}

export function sortProjectsByLeaderboardScore(projects = []) {
  return [...projects].sort((left, right) => {
    if (right.finalScore !== left.finalScore) {
      return right.finalScore - left.finalScore;
    }

    if (right.bayesianScore !== left.bayesianScore) {
      return right.bayesianScore - left.bayesianScore;
    }

    return (right.reviewCount || 0) - (left.reviewCount || 0);
  });
}

export async function getProjectLeaderboard(limit = null) {
  const [projects, users] = await Promise.all([
    Submission.find({}).select("taskId userId projectLink repoLink previewImages reviews leaderboardStats createdAt").lean(),
    User.find({}).select("createdAt isVerified socialProfiles connectedProviders reviewStats credibilityScore abuseSignals").lean(),
  ]);

  const userMap = buildUserCredibilityMap(users);
  const allProjectsStats = buildGlobalStatsSnapshot(projects, userMap);
  const scoredProjects = projects.map((project) => updateProjectScore(project, allProjectsStats, userMap));
  const rankedProjects = sortProjectsByLeaderboardScore(scoredProjects).map((project, index) => ({
    ...project,
    rank: index + 1,
  }));

  return typeof limit === "number" ? rankedProjects.slice(0, limit) : rankedProjects;
}

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
