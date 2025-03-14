import React, { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Edit,
  MessageSquare,
  MoreHorizontal,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";

import { ContentTypeEnum } from "@/api/schemas";
import {
  useUsersCommonApiGetReactionCount,
  useUsersCommonApiPostReaction,
} from "@/api/users-common-api/users-common-api";
import useIdenticon from "@/hooks/useIdenticons";
import { useAuthStore } from "@/stores/authStore";

import { Ratings } from "../ui/ratings";
import CommentInput from "./CommentInput";
import RenderComments from "./RenderComments";
import TruncateText from "./TruncateText";

export interface UserData {
  id: number;
  username: string;
  profile_pic_url: string | null;
}

export interface CommentData {
  id: number;
  author: UserData;
  created_at: string;
  content: string;
  upvotes: number;
  replies: CommentData[];
  is_author?: boolean;
  anonymous_name?: string;
  rating?: number;
  isReview?: boolean;
  review_version?: boolean;
  isNew?: boolean;
}

export interface CommentProps extends CommentData {
  depth: number;
  maxDepth: number;
  isAllCollapsed: boolean;
  onAddReply: (parentId: number, content: string, rating?: number) => void;
  onUpdateComment: (id: number, content: string, rating?: number) => void;
  onDeleteComment: (id: number) => void;
  contentType: ContentTypeEnum;
}

type Reaction = "upvote" | "downvote" | "award";

const Comment: React.FC<CommentProps> = ({
  id,
  author,
  created_at,
  content,
  replies,
  depth,
  maxDepth,
  isAllCollapsed,
  is_author,
  rating,
  isReview = false,
  anonymous_name,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  isNew,
  contentType,
}) => {
  dayjs.extend(relativeTime);

  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, refetch } = useUsersCommonApiGetReactionCount(contentType, Number(id), {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { mutate } = useUsersCommonApiPostReaction({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error(error);
      },
    },
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [highlight, setHighlight] = useState(isNew);
  const [isDeleted, setIsDeleted] = useState(false);
  const imageData = useIdenticon(40);

  useEffect(() => {
    setIsCollapsed(depth >= maxDepth || isAllCollapsed);
  }, [depth, maxDepth, isAllCollapsed]);

  useEffect(() => {
    if (isNew) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const handleAddReply = (replyContent: string, rating?: number) => {
    if (id) {
      onAddReply(id, replyContent, rating);
      setIsReplying(false);
    }
  };

  const handleUpdateComment = (updatedContent: string, rating?: number) => {
    if (id) {
      onUpdateComment(id, updatedContent, rating);
      setIsEditing(false);
    }
  };

  const handleDeleteComment = () => {
    if (id) {
      if (window.confirm("Are you sure you want to delete this comment?")) {
        onDeleteComment(id);
        setIsDeleted(true);
      }
    }
  };

  const handleReaction = (reaction: Reaction) => {
    if (reaction === "upvote" && id)
      mutate({ data: { content_type: contentType, object_id: id, vote: 1 } });
    else if (reaction === "downvote" && id)
      mutate({ data: { content_type: contentType, object_id: id, vote: -1 } });
  };

  if (isDeleted) {
    return null; // Completely remove deleted comment from UI
  }

  return (
    <div className={`relative mb-4 flex space-x-2 ${depth === 0 ? "border-b pb-4" : ""}`}>
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300">
        <Image
          src={author.profile_pic_url || `data:image/png;base64,${imageData}`}
          alt={author.username}
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>

      <div className="flex-grow res-text-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-gray-900">{anonymous_name || author.username}</span>
            <span className="text-gray-400 res-text-xs">• {dayjs(created_at).fromNow()}</span>
          </div>
          {is_author && (
            <div className="flex items-center space-x-2">
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsEditing(!isEditing)}>
                <Edit size={16} />
              </button>
              <button className="text-gray-500 hover:text-gray-700" onClick={handleDeleteComment}>
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          <CommentInput
            onSubmit={handleUpdateComment}
            placeholder="Edit your comment..."
            buttonText="Update"
            initialContent={content}
            initialRating={rating}
            isReview={isReview}
          />
        ) : (
          <p className="mt-1">
            <TruncateText text={content} maxLines={4} />
          </p>
        )}
        <div className="mt-5 flex items-center space-x-4 text-gray-500">
          <button className="flex items-center space-x-1">
            <ThumbsUp size={16} onClick={() => handleReaction("upvote")} />
            <span className="res-text-xs">{data?.data.likes}</span>
          </button>
          <button className="flex items-center space-x-1">
            <ThumbsDown size={16} onClick={() => handleReaction("downvote")} />
          </button>
          <button className="flex items-center space-x-1" onClick={() => setIsReplying(!isReplying)}>
            <MessageSquare size={16} />
            <span className="res-text-xs">Reply</span>
          </button>
        </div>
        {isReplying && <CommentInput onSubmit={handleAddReply} placeholder="Write your reply..." buttonText="Post Reply" isReview={isReview} />}
      </div>
    </div>
  );
};

export default Comment;
