import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
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
} from 'lucide-react';

import { CommentOutId, ContentTypeEnum } from '@/api/schemas';
import { useUsersApiGetReactionCount, useUsersApiPostReaction } from '@/api/users/users';
import { useAuthStore } from '@/stores/authStore';

import CommentInput from './CommentInput';
import RenderComments from './RenderComments';

export interface UserData {
  id: number;
  username: string;
  profile_pic_url: string | null;
}

export interface CommentData {
  id?: CommentOutId;
  author: UserData;
  created_at: string;
  content: string;
  upvotes: number;
  replies: CommentData[];
  is_author?: boolean;
  review_version?: boolean;
  isNew?: boolean;
}

export interface CommentProps extends CommentData {
  depth: number;
  maxDepth: number;
  isAllCollapsed: boolean;
  onAddReply: (parentId: number, content: string) => void;
  onUpdateComment: (id: number, content: string) => void;
  onDeleteComment: (id: number) => void;
  contentType: ContentTypeEnum;
}

type Reaction = 'upvote' | 'downvote' | 'award';

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
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  isNew,
  contentType,
}) => {
  dayjs.extend(relativeTime);

  const accessToken = useAuthStore((state) => state.accessToken);

  // Todo: Too many requests
  const { data, refetch } = useUsersApiGetReactionCount(contentType, Number(id), {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { mutate } = useUsersApiPostReaction({
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
  const hasReplies = replies && replies.length > 0;

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

  const handleAddReply = (replyContent: string) => {
    if (id) {
      onAddReply(id, replyContent);
      setIsReplying(false);
    }
  };

  const handleUpdateComment = (updatedContent: string) => {
    if (id) {
      onUpdateComment(id, updatedContent);
      setIsEditing(false);
    }
  };

  const handleDeleteComment = () => {
    if (id) {
      if (window.confirm('Are you sure you want to delete this comment?')) {
        onDeleteComment(id);
      }
    }
  };

  const handleReaction = (reaction: Reaction) => {
    if (reaction === 'upvote' && id)
      mutate({ data: { content_type: contentType, object_id: id, vote: 1 } });
    else if (reaction === 'downvote' && id)
      mutate({ data: { content_type: contentType, object_id: id, vote: -1 } });
  };

  return (
    <div
      className={`relative mb-4 flex space-x-2 ${depth === 0 ? 'border-b pb-4' : ''} ${highlight ? 'bg-yellow-100 transition-colors duration-1000' : ''}`}
    >
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300">
        <Image
          src={author.profile_pic_url || 'https://picsum.photos/200/200'}
          alt={author.username}
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>
      {hasReplies && !isCollapsed && (
        <div className="absolute bottom-1 left-2 top-10 w-[1px] bg-gray-200"></div>
      )}
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasReplies && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            )}
            <span className="text-base font-semibold">{author.username}</span>
            <span className="text-sm text-gray-500">• {dayjs(created_at).fromNow()}</span>
          </div>
          {is_author && (
            <div className="flex items-center space-x-2">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsEditing(!isEditing)}
              >
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
          />
        ) : (
          <p className="mt-1 text-sm">{content}</p>
        )}
        <div className="mt-5 flex items-center space-x-4 text-gray-500">
          <button className="flex items-center space-x-1">
            {data?.data.user_reaction === 1 ? (
              <ThumbsUp
                size={16}
                className="text-blue-500"
                onClick={() => handleReaction('upvote')}
              />
            ) : (
              <ThumbsUp size={16} onClick={() => handleReaction('upvote')} />
            )}
            <span className="text-xs">{data?.data.likes}</span>
          </button>
          <button className="flex items-center space-x-1">
            {data?.data.user_reaction === -1 ? (
              <ThumbsDown
                size={16}
                className="text-red-500"
                onClick={() => handleReaction('downvote')}
              />
            ) : (
              <ThumbsDown size={16} onClick={() => handleReaction('downvote')} />
            )}
          </button>
          <button
            className="flex items-center space-x-1"
            onClick={() => setIsReplying(!isReplying)}
          >
            <MessageSquare size={16} />
            <span className="text-xs">Reply</span>
          </button>
          <button className="flex items-center space-x-1">
            <Award size={16} />
            <span className="text-xs">Award</span>
          </button>
          <button className="flex items-center space-x-1">
            <Share2 size={16} />
            <span className="text-xs">Share</span>
          </button>
          <button>
            <MoreHorizontal size={16} />
          </button>
        </div>
        {isReplying && (
          <CommentInput
            onSubmit={handleAddReply}
            placeholder="Write your reply..."
            buttonText="Post Reply"
          />
        )}
        {hasReplies && !isCollapsed && (
          <div className="mt-5 pl-4">
            <RenderComments
              comments={replies}
              depth={depth + 1}
              maxDepth={maxDepth}
              isAllCollapsed={isAllCollapsed}
              onAddReply={onAddReply}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              contentType={contentType}
            />
          </div>
        )}
        {hasReplies && isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="mt-2 text-base text-blue-500 hover:underline"
          >
            {replies.length} more {replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Comment;
