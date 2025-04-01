import { useEffect, useState } from 'react';

import { ContentTypeEnum } from '@/api/schemas';

import Comment, { CommentData } from './Comment';

interface RenderCommentsProps {
  comments: CommentData[];
  depth?: number;
  maxDepth: number;
  isAllCollapsed: boolean;
  onAddReply: (parentId: number, content: string) => void;
  onUpdateComment: (id: number, content: string) => void;
  onDeleteComment: (id: number) => void;
  contentType: ContentTypeEnum;
}

const RenderComments: React.FC<RenderCommentsProps> = ({
  comments,
  depth = 0,
  maxDepth,
  isAllCollapsed,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  contentType,
}) => {
  const [shouldRender, setShouldRender] = useState(!isAllCollapsed);

  useEffect(() => {
    if (!isAllCollapsed) {
      setShouldRender(true);
    } else {
      setTimeout(() => setShouldRender(false), 300); // Wait for animation to finish before unmounting
    }
  }, [isAllCollapsed]);

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isAllCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
      }`}
    >
      {shouldRender ? (
        comments.map((comment) => (
          <Comment
            key={comment.id}
            {...comment}
            depth={depth}
            maxDepth={maxDepth}
            isAllCollapsed={isAllCollapsed}
            onAddReply={onAddReply}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            contentType={contentType}
          />
        ))
      ) : (
        <p className="text-sm text-gray-500">Comments are collapsed</p>
      )}
    </div>
  );
};

export default RenderComments;
