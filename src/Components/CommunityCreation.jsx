import React, {useEffect} from 'react'


const CommunityCreation = () => {


    useEffect(() => {
        const timer = setTimeout(() => {
          window.location.href = '/mycommunity';
        }, 5000);
    
        return () => clearTimeout(timer);
      }, []);
  
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Created Community Successfully!</h1>
        <p className="text-gray-500">Redirecting to Community Dashboard...</p>
      </div>
    );
}

export default CommunityCreation;