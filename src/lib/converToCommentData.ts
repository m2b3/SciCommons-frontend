import { CommentOut, DiscussionCommentOut, ReviewCommentOut, UserStats } from '@/api/schemas';
import { CommentData, UserData } from '@/components/common/Comment';

// Helper function to convert backend user data to frontend UserData
function convertToUserData(backendUser: UserStats): UserData {
  return {
    id: backendUser.id ?? 0,
    username: backendUser.username,
    profile_pic_url: backendUser.profile_pic_url || null,
  };
}

export function convertToPostCommentData(backendComment: CommentOut): CommentData {
  const convertedComment: CommentData = {
    id: backendComment.id ?? 0,
    author: convertToUserData(backendComment.author),
    created_at: backendComment.created_at,
    content: backendComment.content,
    upvotes: backendComment.upvotes,
    replies: backendComment.replies.map(convertToPostCommentData),
    is_author: backendComment.is_author || false,
    review_version: false,
    isNew: false,
  };

  return convertedComment;
}

export function convertToCommentData(backendComment: ReviewCommentOut): CommentData {
  const convertedComment: CommentData = {
    id: backendComment.id ?? 0,
    author: convertToUserData(backendComment.author),
    created_at: backendComment.created_at,
    content: backendComment.content,
    upvotes: backendComment.upvotes,
    replies: backendComment.replies.map(convertToCommentData),
    is_author: backendComment.is_author || false,
    // review specific
    rating: backendComment.rating || 0,
    review_version: true,
    isReview: true,
    isNew: false,
  };

  return convertedComment;
}

export function convertToDiscussionCommentData(backendComment: DiscussionCommentOut): CommentData {
  const convertedComment: CommentData = {
    id: backendComment.id ?? 0,
    author: convertToUserData(backendComment.author),
    created_at: backendComment.created_at,
    content: backendComment.content,
    upvotes: backendComment.upvotes,
    replies: backendComment.replies.map(convertToDiscussionCommentData),
    is_author: backendComment.is_author || false,
    review_version: false,
    isNew: false,
  };

  return convertedComment;
}
