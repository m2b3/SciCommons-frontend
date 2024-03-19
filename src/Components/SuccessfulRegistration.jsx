import React, { useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";

const SuccessfulRegistration = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/login"; // Redirect to login page after 5 seconds
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <FiCheckCircle className="text-green-500 text-6xl mb-4" />
      <h1 className="text-4xl font-bold mb-4">Registration Successful!</h1>
      <p className="text-lg text-gray-600 mb-8">Thank you for signing up.</p>
      <p className="text-gray-500">Redirecting to Login Page...</p>
    </div>
  );
};

export default SuccessfulRegistration;
