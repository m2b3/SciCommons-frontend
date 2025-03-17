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
  return comments.map((comment, index) => (
    <div className="relative" key={`${comment.id}_${index}`}>
      {depth > 0 && (
        <div className="absolute -left-3.5 aspect-square size-5 rounded-bl-xl border-b-[1.5px] border-l-[1.5px] border-common-heavyContrast md:-left-4" />
      )}
      <Comment
        {...comment}
        depth={depth}
        maxDepth={maxDepth}
        isAllCollapsed={isAllCollapsed}
        onAddReply={onAddReply}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
        contentType={contentType}
      />
    </div>
  ));
};

export default RenderComments;
