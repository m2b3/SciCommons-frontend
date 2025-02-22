import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';

const CommunityInvitationSkeletonLoader = () => {
  return (
    <Skeleton className="flex w-full flex-col items-start gap-4 p-0">
      <BlockSkeleton className="aspect-square size-12 shrink-0 rounded-full" />
      <TextSkeleton className="w-24" />
      <TextSkeleton className="w-32" />
      <TextSkeleton />
      <TextSkeleton />
      <TextSkeleton />
      <div className="flex w-full flex-row justify-end gap-4">
        <BlockSkeleton className="h-10 w-28" />
        <BlockSkeleton className="h-10 w-28" />
      </div>
    </Skeleton>
  );
};

export default CommunityInvitationSkeletonLoader;
