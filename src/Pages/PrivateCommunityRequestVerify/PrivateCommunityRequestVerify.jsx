import React, { useEffect, useState } from 'react';
import Loader from '../../Components/Loader/Loader';
import axios from '../../Utils/axios';
import { useGlobalContext } from '../../Context/StateContext';
import { MdLocationPin } from 'react-icons/md';
import { BsGithub } from 'react-icons/bs';
import { BiLogoGmail } from 'react-icons/bi';
import { CgWebsite } from 'react-icons/cg';
import toast from 'react-hot-toast';

function PrivateCommunityRequestVerify() {
  const [loading, setLoading] = useState(true);
  const { token } = useGlobalContext();
  const [response, setResponse] = useState(null);

  const referral = async (referralId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      // '00ecf1a7-f866-499f-9e07-699ebddbbb0c'
      const data = {
        referralId: referralId
      };
      const res = await axios.post(`/api/community/private/join/verify/`, data, config);
      console.log(res);
      if (res?.status === 200) {
        setResponse(res?.data);
      }
    } catch (error) {
      console.error('Network error:', error);
      navigator.push('/');
    }
    setLoading(false);
  };

  useEffect(() => {
    const referralId = window.location.pathname.split('/').pop();
    referral(referralId);
  }, []);

  const handleAccept = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      // const data = {
      //   communityId: response?.community?._id
      // };
      const res = await axios.get(
        `/api/community/${response?.community?.Community_name}/acceptJoinInvite/`,
        config
      );
      console.log(res);
      if (res?.status === 200) {
        toast.success(res?.data?.success);
        navigator.push('/');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleDecline = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      // const data = {
      //   communityId: response?.community?._id
      // };
      const res = await axios.get(
        `/api/community/${response?.community?.Community_name}/discardJoinInvite/`,
        config
      );
      console.log(res);
      if (res?.status === 200) {
        toast.success(res?.data?.success);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      {loading ? (
        <Loader />
      ) : !response?.valid ? (
        <h1>{response?.error}</h1>
      ) : (
        <div className="w-full h-full flex flex-col items-center p-10">
          <h1 className="text-2xl font-semibold">Confirm your invite</h1>
          <div className="w-full mt-6 flex flex-col justify-center mx-auto bg-slate-100 p-14 rounded-xl">
            <div className="m-4 flex flex-col justify-center">
              <h1 className="text-7xl font-bold text-center text-gray-500">
                {response?.community?.Community_name}
              </h1>
            </div>
            <div className="mt-4">
              <p className="text-md text-left text-gray-500">
                <span className="text-lg text-left font-bold text-green-700">Subtitle : </span>
                {response?.community?.subtitle}
              </p>
              <p className="text-md text-left text-gray-500">
                <span className="text-lg text-center font-bold text-green-700">Description : </span>
                {response?.community?.description}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap justify-between">
              <div className="mt-4 flex">
                <MdLocationPin className="text-xl text-green-700 md:mr-3" />{' '}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {response?.community?.location}
                </span>
              </div>
              <div className="mt-4 flex">
                <BsGithub className="text-xl text-green-700 md:mr-3" />{' '}
                <a
                  className="text-sm md:text-md text-left text-gray-500"
                  href={response?.community?.github}>
                  {response?.community?.github}
                </a>
              </div>
              <div className="mt-4 flex">
                <BiLogoGmail className="text-xl text-green-700 md:mr-3" />{' '}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {response?.community?.email}
                </span>
              </div>
              <div className="mt-4 flex">
                <CgWebsite className="text-xl text-green-700 md:mr-3" />{' '}
                <a
                  className="text-sm md:text-md text-left text-gray-500"
                  href={response?.community?.website}>
                  {response?.community?.website}
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between w-full mt-5 gap-5">
            <button
              className="w-1/2 p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-150"
              onClick={handleDecline}>
              Decline
            </button>
            <button
              className="w-1/2 p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-150"
              onClick={handleAccept}>
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivateCommunityRequestVerify;
