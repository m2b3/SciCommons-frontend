import { ContentTypeEnum } from '@/api/schemas';

import Comment, { CommentData } from './Comment';

interface RenderCommentsProps {
  comments: CommentData[];
  depth?: number;
  maxDepth: number;
  isAllCollapsed: boolean;
  autoExpandOnUnread?: boolean;
  mentionCandidates?: string[];
  targetCommentId?: number | null;
  onTargetCommentHandled?: () => void;
  onAddReply: (parentId: number, content: string) => void;
  onUpdateComment: (id: number, content: string) => void;
  onDeleteComment: (id: number) => void;
  contentType: ContentTypeEnum;
  /** Article context for tracking read state */
  articleContext?: {
    communityId: number;
    articleId: number;
  };
}

const RenderComments: React.FC<RenderCommentsProps> = ({
  comments,
  depth = 0,
  maxDepth,
  isAllCollapsed,
  autoExpandOnUnread = false,
  mentionCandidates = [],
  targetCommentId = null,
  onTargetCommentHandled,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  contentType,
  articleContext,
}) => {
  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Use stable comment keys based on comment IDs.
     Why: Index-coupled keys can remount items during realtime inserts and make thread state feel unreliable.
     How: Prefer `comment.id` as the React key with an index fallback only when ID is unavailable. */
  return comments.map((comment, index) => (
    <div className="relative" key={comment.id ? String(comment.id) : `comment_${index}`}>
      {depth > 0 && (
        <div className="absolute -left-3.5 aspect-square size-5 rounded-bl-xl border-b-[1.5px] border-l-[1.5px] border-common-heavyContrast md:-left-4" />
      )}
      <Comment
        {...comment}
        depth={depth}
        maxDepth={maxDepth}
        isAllCollapsed={isAllCollapsed}
        autoExpandOnUnread={autoExpandOnUnread}
        mentionCandidates={mentionCandidates}
        /* Fixed by Codex on 2026-02-26
           Who: Codex
           What: Forwarded deep-link target metadata through recursive comment trees.
           Why: Any level in the tree may hold the mentioned comment id.
           How: Pass the same target comment id/callback to every node so ancestors can expand and the target can self-scroll. */
        targetCommentId={targetCommentId}
        onTargetCommentHandled={onTargetCommentHandled}
        onAddReply={onAddReply}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
        contentType={contentType}
        articleContext={articleContext}
      />
    </div>
  ));
};

export default RenderComments;
