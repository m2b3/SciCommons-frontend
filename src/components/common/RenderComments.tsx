import Comment, { CommentData } from './Comment';

interface RenderCommentsProps {
  comments: CommentData[];
  depth?: number;
  maxDepth: number;
  isAllCollapsed: boolean;
  onAddReply: (parentId: number, content: string) => void;
  onUpdateComment: (id: number, content: string) => void;
  onDeleteComment: (id: number) => void;
}

const RenderComments: React.FC<RenderCommentsProps> = ({
  comments,
  depth = 0,
  maxDepth,
  isAllCollapsed,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
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
        />
      ))}
    </>
  );
};

export default RenderComments;
