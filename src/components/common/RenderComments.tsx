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
  return (
    <>
      {comments.map((comment) => (
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
      ))}
    </>
  );
};

export default RenderComments;
