const CommunityCardSkeleton = () => {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg hover:shadow-xl animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="w-3/4 h-6 bg-gray-300 rounded"></div>
          <div className="flex items-center mb-2">
            <div className="w-5 h-5 bg-gray-300 rounded-full mr-2"></div>
            <div className="w-12 h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-5 h-5 bg-gray-300 rounded-full mr-2"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-5 h-5 bg-gray-300 rounded-full mr-2"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="flex">
            <div className="w-5 h-5 bg-gray-300 rounded-full mr-2"></div>
            <div className="w-12 h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default CommunityCardSkeleton;
  