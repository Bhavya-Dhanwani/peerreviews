"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { toast } from "sonner";

const SubmissionDiscussionContext = createContext(null);

async function parseApiResponse(response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Request failed.");
  }

  return result.data;
}

function normalizeReview(review = {}, fallbackName = "You", fallbackAvatar = "") {
  return {
    reviewerId: {
      _id: String(review.reviewerId?._id || review.reviewerId || ""),
      name: review.reviewerId?.name || fallbackName,
      avatar: review.reviewerId?.avatar || fallbackAvatar,
    },
    ratings: Array.isArray(review.ratings)
      ? review.ratings.map((rating) => ({
          label: rating.label || "",
          score: Number(rating.score || 0),
        }))
      : [],
    whatYouLiked: review.whatYouLiked || "",
    comment: review.comment || "",
  };
}

function normalizeComment(comment = {}, fallbackName = "You", fallbackAvatar = "") {
  return {
    _id: String(comment._id || ""),
    commenterId: {
      _id: String(comment.commenterId?._id || comment.commenterId || ""),
      name: comment.commenterId?.name || fallbackName,
      avatar: comment.commenterId?.avatar || fallbackAvatar,
    },
    text: comment.text || "",
    createdAt: comment.createdAt || new Date().toISOString(),
  };
}

function createInitialScores(reviewCriteria = []) {
  return Object.fromEntries((reviewCriteria || []).map((criterion) => [criterion.label, 0]));
}

function mergeUniqueComments(existingComments = [], incomingComment = null) {
  if (!incomingComment) {
    return existingComments;
  }

  const normalizedIncoming = normalizeComment(incomingComment);
  const alreadyExists = existingComments.some((comment) => comment._id && comment._id === normalizedIncoming._id);

  if (alreadyExists) {
    return existingComments;
  }

  return [...existingComments, normalizedIncoming];
}

function mergeUniqueSubmission(existingSubmissions = [], incomingSubmission = null) {
  if (!incomingSubmission?._id) {
    return existingSubmissions;
  }

  const alreadyExists = existingSubmissions.some((submission) => submission._id === incomingSubmission._id);

  if (alreadyExists) {
    return existingSubmissions.map((submission) =>
      submission._id === incomingSubmission._id ? { ...submission, ...incomingSubmission } : submission
    );
  }

  return [incomingSubmission, ...existingSubmissions];
}

function updateSubmissionCollections(currentSubmissions = [], submissionId, updater) {
  return currentSubmissions.map((submission) => (submission._id === submissionId ? updater(submission) : submission));
}

function calculateAverageScoreOutOf10(reviews = []) {
  const ratingTotal = reviews.reduce(
    (total, review) =>
      total +
      (Array.isArray(review.ratings)
        ? review.ratings.reduce((sum, rating) => sum + Number(rating.score || 0), 0)
        : 0),
    0
  );
  const maxRatingTotal = reviews.reduce(
    (total, review) =>
      total +
      (Array.isArray(review.ratings)
        ? review.ratings.reduce((sum) => sum + 5, 0)
        : 0),
    0
  );

  return {
    ratingTotal,
    averageScoreOutOf10: maxRatingTotal ? Number(((ratingTotal / maxRatingTotal) * 10).toFixed(1)) : 0,
  };
}

function normalizeIncomingSubmission(submission = {}, currentUserId = null) {
  const ownerId = String(submission.userId?._id || submission.userId || "");
  const likedBy = Array.isArray(submission.likedBy) ? submission.likedBy.map((entry) => String(entry)) : [];
  const reviews = Array.isArray(submission.reviews) ? submission.reviews : [];
  const comments = Array.isArray(submission.comments) ? submission.comments : [];

  return {
    ...submission,
    _id: String(submission._id || ""),
    taskId: String(submission.taskId || ""),
    userId:
      typeof submission.userId === "object"
        ? {
            _id: ownerId,
            name: submission.userId?.name || "",
            avatar: submission.userId?.avatar || "",
          }
        : {
            _id: ownerId,
            name: "",
            avatar: "",
          },
    likedBy,
    reviews,
    comments,
    isOwner: Boolean(currentUserId && ownerId === currentUserId),
    hasReviewed: Boolean(
      currentUserId &&
        reviews.some((review) => String(review?.reviewerId?._id || review?.reviewerId || "") === String(currentUserId))
    ),
    canViewReviews: Boolean(currentUserId && ownerId === currentUserId),
    canReview: Boolean(currentUserId && ownerId !== currentUserId),
    reviewCount: Number(submission.reviewCount || reviews.length || 0),
    ratingTotal: Number(submission.ratingTotal || 0),
    averageScoreOutOf10: Number(submission.averageScoreOutOf10 || 0),
    commentCount: Number(submission.commentCount || comments.length || 0),
    createdAt: submission.createdAt || new Date().toISOString(),
  };
}

export default function SubmissionDiscussionProvider({ task, initialSubmissions = [], currentUser = null, children }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activePanel, setActivePanel] = useState("reviews");
  const [reviewComment, setReviewComment] = useState("");
  const [likedComment, setLikedComment] = useState("");
  const [commentText, setCommentText] = useState("");
  const [reviewScores, setReviewScores] = useState(() => createInitialScores(task.review));
  const [currentUserCredibility, setCurrentUserCredibility] = useState(null);
  const [isReviewing, startReviewTransition] = useTransition();
  const [isCommenting, startCommentTransition] = useTransition();

  const currentUserId = currentUser?.id || session?.user?.id || null;
  const currentUserName = currentUser?.name || session?.user?.name || "You";
  const currentUserAvatar = currentUser?.avatar || session?.user?.image || "";

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    let isActive = true;

    (async () => {
      try {
        const response = await fetch("/api/auth/auth-session", {
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const result = await response.json();

        if (!isActive) {
          return;
        }

        setCurrentUserCredibility(result?.data?.credibility || null);
      } catch {
      }
    })();

    return () => {
      isActive = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!task?._id) {
      return undefined;
    }

    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    const roomId = task._id;
    socket.emit("task:join", roomId);

    socket.on("comment:created", (payload) => {
      if (!payload?.submissionId || !payload?.comment) {
        return;
      }

      setSubmissions((current) =>
        current.map((submission) => {
          if (submission._id !== payload.submissionId) {
            return submission;
          }

          const comments = mergeUniqueComments(submission.comments || [], payload.comment);
          return {
            ...submission,
            comments,
            commentCount: Number(payload.commentCount || comments.length),
          };
        })
      );

      setSelectedSubmission((current) => {
        if (!current || current._id !== payload.submissionId) {
          return current;
        }

        const comments = mergeUniqueComments(current.comments || [], payload.comment);
        return {
          ...current,
          comments,
          commentCount: Number(payload.commentCount || comments.length),
        };
      });
    });

    socket.on("submission:created", (payload) => {
      if (!payload?.submission?._id) {
        return;
      }

      const normalizedSubmission = normalizeIncomingSubmission(payload.submission, currentUserId);

      setSubmissions((current) => mergeUniqueSubmission(current, normalizedSubmission));
    });

    socket.on("submission:liked", (payload) => {
      if (!payload?.submissionId || !payload?.userId) {
        return;
      }

      const applyLikeUpdate = (submission) => {
        const nextLikedBy = payload.liked
          ? Array.from(new Set([...(submission.likedBy || []), payload.userId]))
          : (submission.likedBy || []).filter((entry) => entry !== payload.userId);

        return {
          ...submission,
          likedBy: nextLikedBy,
        };
      };

      setSubmissions((current) => updateSubmissionCollections(current, payload.submissionId, applyLikeUpdate));
      setSelectedSubmission((current) =>
        current && current._id === payload.submissionId ? applyLikeUpdate(current) : current
      );
    });

    socket.on("review:created", (payload) => {
      if (!payload?.submissionId) {
        return;
      }

      const applyReviewUpdate = (submission) => {
        const isCurrentReviewer = String(payload.reviewerId || "") === String(currentUserId || "");
        const isOwner = Boolean(currentUserId && submission.userId?._id === currentUserId);

        return {
          ...submission,
          reviewCount: Number(payload.reviewCount || submission.reviewCount || 0),
          ratingTotal: Number(payload.ratingTotal || submission.ratingTotal || 0),
          averageScoreOutOf10: Number(payload.averageScoreOutOf10 || submission.averageScoreOutOf10 || 0),
          hasReviewed: submission.hasReviewed || isCurrentReviewer,
          canReview: isCurrentReviewer ? false : submission.canReview,
          canViewReviews: submission.canViewReviews || isCurrentReviewer || isOwner,
        };
      };

      setSubmissions((current) => updateSubmissionCollections(current, payload.submissionId, applyReviewUpdate));
      setSelectedSubmission((current) =>
        current && current._id === payload.submissionId ? applyReviewUpdate(current) : current
      );
    });

    return () => {
      socket.emit("task:leave", roomId);
      socket.disconnect();
    };
  }, [currentUserId, task?._id]);

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const next = submissions.filter((submission) => {
      if (!query) return true;

      const haystack = [submission.userId?.name, submission.projectLink, submission.repoLink]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    return next.sort((left, right) => {
      if (sortBy === "likes") {
        return (right.likedBy?.length || 0) - (left.likedBy?.length || 0);
      }

      if (sortBy === "rating") {
        return (right.ratingTotal || 0) - (left.ratingTotal || 0);
      }

      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });
  }, [search, sortBy, submissions]);

  const resetComposer = useCallback(() => {
    setReviewComment("");
    setLikedComment("");
    setCommentText("");
    setReviewScores(createInitialScores(task.review));
  }, [task.review]);

  const openSubmission = useCallback(
    (submission, panel = "reviews") => {
      setSelectedSubmission(submission);
      setActivePanel(panel);
      resetComposer();
    },
    [resetComposer]
  );

  const closeSubmission = useCallback(() => {
    setSelectedSubmission(null);
    setActivePanel("reviews");
    resetComposer();
  }, [resetComposer]);

  const redirectToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  const toggleLike = useCallback(
    async (submissionId) => {
      if (!currentUserId) {
        redirectToLogin();
        return;
      }

      try {
        const response = await fetch(`/api/submissions/${submissionId}/like`, {
          method: "POST",
          credentials: "include",
        });

        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        const data = await parseApiResponse(response);

        const updateLikedState = (submission) => {
          const likedBy = data.liked
            ? Array.from(new Set([...(submission.likedBy || []), currentUserId]))
            : (submission.likedBy || []).filter((entry) => entry !== currentUserId);
          return { ...submission, likedBy };
        };

        setSubmissions((current) =>
          updateSubmissionCollections(current, submissionId, updateLikedState)
        );
        setSelectedSubmission((current) => (current && current._id === submissionId ? updateLikedState(current) : current));
      } catch (error) {
        toast.error(error.message || "Unable to like right now.");
      }
    },
    [currentUserId, redirectToLogin]
  );

  const submitComment = useCallback(() => {
    if (!selectedSubmission) return;

    if (!currentUserId) {
      redirectToLogin();
      return;
    }

    const text = commentText.trim();

    if (!text) {
      toast.error("Write something before posting your comment.");
      return;
    }

    startCommentTransition(async () => {
      try {
        const response = await fetch(`/api/submissions/${selectedSubmission._id}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ text }),
        });

        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        const data = await parseApiResponse(response);

        setSubmissions((current) =>
          updateSubmissionCollections(current, selectedSubmission._id, (submission) => {
            if (submission._id !== selectedSubmission._id) {
              return submission;
            }

            const comments = Array.isArray(data.comments)
              ? data.comments.map((comment) => normalizeComment(comment, currentUserName, currentUserAvatar))
              : submission.comments || [];

            return {
              ...submission,
              comments,
              commentCount: data.commentCount || comments.length,
            };
          })
        );

        setSelectedSubmission((current) => {
          if (!current || current._id !== selectedSubmission._id) {
            return current;
          }

          const comments = Array.isArray(data.comments)
            ? data.comments.map((comment) => normalizeComment(comment, currentUserName, currentUserAvatar))
            : current.comments || [];

          return {
            ...current,
            comments,
            commentCount: data.commentCount || comments.length,
          };
        });

        setCommentText("");
        toast.success("Comment posted.");
      } catch (error) {
        toast.error(error.message || "Unable to post comment.");
      }
    });
  }, [commentText, currentUserAvatar, currentUserId, currentUserName, redirectToLogin, selectedSubmission]);

  const submitReview = useCallback(() => {
    if (!selectedSubmission) return;

    if (!currentUserId) {
      redirectToLogin();
      return;
    }

    const ratings = (task.review || []).map((criterion) => ({
      label: criterion.label,
      score: Number(reviewScores[criterion.label] || 0),
    }));

    startReviewTransition(async () => {
      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            submissionId: selectedSubmission._id,
            ratings,
            whatYouLiked: likedComment,
            comment: reviewComment,
          }),
        });

        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        const data = await parseApiResponse(response);

        setSubmissions((current) =>
          updateSubmissionCollections(current, selectedSubmission._id, (submission) => {
            if (submission._id !== selectedSubmission._id) {
              return submission;
            }

            const reviews = Array.isArray(data.reviews)
              ? data.reviews.map((review) => normalizeReview(review, currentUserName, currentUserAvatar))
              : submission.reviews;

            const metrics = calculateAverageScoreOutOf10(reviews);

            return {
              ...submission,
              reviews,
              canViewReviews: true,
              canReview: false,
              hasReviewed: true,
              reviewCount: data.reviewCount || reviews.length,
              ratingTotal: data.ratingTotal || metrics.ratingTotal,
              averageScoreOutOf10: metrics.averageScoreOutOf10,
            };
          })
        );

        toast.success("Review added to the discussion.");
        closeSubmission();
      } catch (error) {
        toast.error(error.message || "Unable to submit review.");
      }
    });
  }, [closeSubmission, currentUserAvatar, currentUserId, currentUserName, likedComment, redirectToLogin, reviewComment, reviewScores, selectedSubmission, task.review]);

  const value = useMemo(
    () => ({
      activePanel,
      commentText,
      currentUserCredibility: currentUserId ? currentUserCredibility : null,
      currentUserId,
      filteredSubmissions,
      isCommenting,
      isReviewing,
      likedComment,
      openSubmission,
      closeSubmission,
      reviewComment,
      reviewScores,
      search,
      selectedSubmission,
      setActivePanel,
      setCommentText,
      setLikedComment,
      setReviewComment,
      setReviewScores,
      setSearch,
      setSortBy,
      sortBy,
      submitComment,
      submitReview,
      task,
      toggleLike,
    }),
    [activePanel, closeSubmission, commentText, currentUserCredibility, currentUserId, filteredSubmissions, isCommenting, isReviewing, likedComment, openSubmission, reviewComment, reviewScores, search, selectedSubmission, sortBy, submitComment, submitReview, task, toggleLike]
  );

  return <SubmissionDiscussionContext.Provider value={value}>{children}</SubmissionDiscussionContext.Provider>;
}

export function useSubmissionDiscussion() {
  const context = useContext(SubmissionDiscussionContext);

  if (!context) {
    throw new Error("useSubmissionDiscussion must be used within SubmissionDiscussionProvider.");
  }

  return context;
}
