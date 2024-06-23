const CommunityInvitationSkeletonLoader = () => {
  return (
    <div className="flex animate-pulse flex-col items-center space-y-4">
      <div className="h-14 w-14 rounded-full bg-gray-300"></div>
      <div className="h-6 w-48 rounded bg-gray-300"></div>
      <div className="flex space-x-2">
        <div className="h-4 w-4 rounded bg-gray-300"></div>
        <div className="h-4 w-24 rounded bg-gray-300"></div>
      </div>
      <div className="h-12 w-96 rounded bg-gray-300"></div>
      <div className="flex space-x-4 self-end">
        <div className="h-8 w-20 rounded bg-gray-400"></div>
        <div className="h-8 w-20 rounded bg-gray-400"></div>
      </div>
    </div>
  );
};

export default CommunityInvitationSkeletonLoader;
