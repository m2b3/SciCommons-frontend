/* Added by Claude on 2026-08-22
   What: Shared placeholder for soft-deleted reviews and comments.
   Why: The backend keeps a deleted review (and its comments) and keeps returning it, so the
        frontend has to say the content is gone instead of rendering an empty author row.
   How: A single italic line, so a deleted node still reads as a node and its thread stays
        anchored to something visible. */
interface DeletedTombstoneProps {
  /** What was removed, e.g. "This review was deleted by its author." */
  message: string;
  className?: string;
}

const DeletedTombstone: React.FC<DeletedTombstoneProps> = ({ message, className }) => (
  <p className={`text-xs italic text-text-tertiary ${className ?? ''}`.trim()}>{message}</p>
);

export default DeletedTombstone;
