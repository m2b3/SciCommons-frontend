import React, {useEffect} from 'react'


const SuccessfulSubmission = () => {


    useEffect(() => {
        const timer = setTimeout(() => {
          window.location.href = '/submitarticle';
        }, 5000);
    
        return () => clearTimeout(timer);
      }, []);
  
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Article Submitted Successfully!</h1>
        <p className="text-lg text-gray-600 mb-8">Thank you for your submission.</p>
        <p className="text-gray-500">Redirecting to Submit Article Page...</p>
      </div>
    );
}

export default SuccessfulSubmission