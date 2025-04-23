import { ReviewCommentOut, UserStats } from '@/api/schemas';
import { CommentData, UserData } from '@/components/common/Comment';

function convertToCommentData(backendComment: ReviewCommentOut): CommentData {
  const convertedComment: CommentData = {
    id: backendComment.id ?? 0,
    author: convertToUserData(backendComment.author),
    created_at: backendComment.created_at,
    content: backendComment.content,
    upvotes: backendComment.upvotes,
    replies: backendComment.replies.map(convertToCommentData),
    is_author: backendComment.is_author || false,
    // review specific
    rating: backendComment.rating ?? undefined,
    review_version: true,
    isReview: true,
    isNew: false,
    is_deleted: backendComment.is_deleted || false,
  };

  return convertedComment;
}

// Helper function to convert backend user data to frontend UserData
function convertToUserData(backendUser: UserStats): UserData {
  return {
    id: backendUser.id ?? 0,
    username: backendUser.username,
    profile_pic_url: backendUser.profile_pic_url || null,
  };
}

export default convertToCommentData;
