import React, { useEffect, useState } from 'react';
import axios from '../../Utils/axios';
import toast from 'react-hot-toast';

function VerifyToken() {
  const [message, setMessage] = useState('Verifying...');
  const handleApi = async (token) => {
    try {
      const response = await axios.post(`/api/user/verifytoken/`, {
        email_token: token
      });
      console.log(response);
      setMessage('Verified!! Please login to continue.');
      toast.success(response.data.success);
    } catch (error) {
      console.log(error);
      setMessage('Error!! Please try again.');
      toast.error(error.response.data.error);
    }
  };

  useEffect(() => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const token = url.searchParams.get('token');
    //handleApi(token);
  }, []);
  return (
    <div className="w-full h-[85vh] flex flex-center items-center justify-center">
      <h1>{message}</h1>
    </div>
  );
}

export default VerifyToken;
