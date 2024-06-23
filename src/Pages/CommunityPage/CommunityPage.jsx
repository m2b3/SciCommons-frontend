import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../Utils/axios';
import Loader from '../../Components/Loader/Loader';
import { MdLocationPin, MdSubscriptions } from 'react-icons/md';
import { BsGithub } from 'react-icons/bs';
import { BiLogoGmail } from 'react-icons/bi';
import { CgWebsite } from 'react-icons/cg';
import { FaUsers, FaBook, FaPencilAlt } from 'react-icons/fa';
import ToastMaker from 'toastmaker';
import 'toastmaker/dist/toastmaker.css';
import { useGlobalContext } from '../../Context/StateContext';
import Articles from './Articles';
import toast from 'react-hot-toast';

const CommunityPage = () => {
  const { communityName } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdminCommunity, setIsAdminCommunity] = useState(0);
  const [subscribed, setSubscribed] = useState(null);
  const { user, token } = useGlobalContext();

  const loadCommunity = async (res) => {
    setCommunity(res);
  };

  const loadData = async (res) => {
    setSubscribed(res);
    const data = community;
    data.isSubscribed = res;
    data.subscribed = res ? data.subscribed + 1 : data.subscribed - 1;
    setCommunity(data);
  };
  useEffect(() => {
    setLoading(true);
    const getCommunity = async () => {
      try {
        let config = null;
        if (token === null) {
          config = {
            headers: {
              'Content-Type': 'application/json'
            }
          };
        } else {
          config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
        }
        const res = await axios.get(`/api/community/${communityName}/`, config);
        const checkIsAdmin = res.data.success.isAdmin;
        setIsAdminCommunity(checkIsAdmin);
        await loadCommunity(res.data.success);
        setSubscribed(res.data.success.isSubscribed);
      } catch (error) {
        console.log(error);
        if (error.response.data.detail === 'Not found.') {
          ToastMaker("Community doesn't exists!!!", 3000, {
            valign: 'top',
            styles: {
              backgroundColor: 'red',
              fontSize: '20px'
            }
          });
          navigate('/communities');
        }
      }
    };

    const fetchData = async () => {
      await getCommunity();
    };
    fetchData();
    setLoading(false);
  }, [communityName]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (token === null) {
      navigate('/login');
    }
    setLoading(true);
    try {
      const updatedStatus = !subscribed;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      if (subscribed === false) {
        const response = await axios.post(
          `/api/community/${community.Community_name}/subscribe/`,
          {
            user: user.id
          },
          config
        );
        if (response.status === 200) {
          await loadData(updatedStatus);
        }
      } else {
        const response = await axios.post(
          `/api/community/${community.Community_name}/unsubscribe/`,
          {
            user: user.id
          },
          config
        );
        if (response.status === 200) {
          await loadData(updatedStatus);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.post(
        `/api/community/${communityName}/join_request/`,
        { community: communityName },
        config
      );
      if (response.data.success) {
        toast.success(response?.data?.success);
        // console.log(response);
      }
    } catch (error) {
      setLoading(false);
      toast.error('An error occurred. Please try again.');
      console.log(error);
      return;
    }
    // setLoading(false);
  };

  const getButtonLabel = () => {
    if (loading) {
      return (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM12 20c3.042 0 5.824-1.135 7.938-3l-2.647-3A7.962 7.962 0 0012 16v4zm5.291-9H20c0-3.042-1.135-5.824-3-7.938l-3 2.647A7.962 7.962 0 0116 12h4zm-9-5.291V4c-3.042 0-5.824 1.135-7.938 3l2.647 3A7.962 7.962 0 0112 8V4zm-5.291 9L4 16c3.042 0 5.824-1.135 7.938-3l2.647 3A7.962 7.962 0 018 20h4v-4H4.709z"
          />
        </svg>
      );
    }

    return <>{subscribed === true ? 'Unsubscribe' : 'Subscribe'}</>;
  };

  return (
    <>
      {loading && community === null && <Loader />}
      {!loading && community !== null && (
        <>
          <div className="w-4/5 md:w-2/3 flex flex-col justify-center mx-auto mt-4 p-3 mb-8 md:p-6">
            <div className="m-4 flex flex-col justify-center">
              <h1 className="text-xl md:text-7xl font-bold text-center text-gray-500">
                {community?.Community_name}
              </h1>
            </div>
            <div className="mt-4">
              <p className="test-sm md:text-md text-left text-gray-500">
                <span className="text-sm md:text-lg text-left font-bold text-green-700">
                  Subtitle :{' '}
                </span>
                {community?.subtitle}
              </p>
              <p className="test-sm md:text-md text-left text-gray-500">
                <span className="test-sm md:text-lg text-left font-bold text-green-700">
                  Description :{' '}
                </span>
                {community?.description}
              </p>
              <p className="test-sm md:text-md text-left text-gray-500">
                <span className="test-sm md:text-lg text-left font-bold text-green-700">
                  Admins :{' '}
                </span>
                {community?.admins.map((admin) => admin).join(', ')}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap justify-between">
              <div className="mt-4 flex">
                <MdLocationPin className="text-xl text-green-700 md:mr-3" />{' '}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.location}
                </span>
              </div>
              <div className="mt-4 flex">
                <BsGithub className="text-xl text-green-700 md:mr-3" />{' '}
                <a className="text-sm md:text-md text-left text-gray-500" href={community?.github}>
                  {community?.github}
                </a>
              </div>
              <div className="mt-4 flex">
                <BiLogoGmail className="text-xl text-green-700 md:mr-3" />{' '}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.email}
                </span>
              </div>
              <div className="mt-4 flex">
                <CgWebsite className="text-xl text-green-700 md:mr-3" />{' '}
                <a className="text-sm md:text-md text-left text-gray-500" href={community?.website}>
                  {community?.website}
                </a>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-between">
              <div className="mt-4 flex">
                <FaUsers className="text-xl text-green-700 md:mr-3" />{' '}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.membercount}
                </span>
              </div>
              <div className="mt-4 flex">
                <FaPencilAlt className="text-xl text-green-700 md:mr-3" />{' '}
                <a className="text-sm md:text-md text-left text-gray-500" href={community?.github}>
                  {community?.evaluatedcount}
                </a>
              </div>
              <div className="mt-4 flex">
                <FaBook className="text-xl text-green-700 md:mr-3" />{' '}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.publishedcount}
                </span>
              </div>
              <div className="mt-4 flex">
                <MdSubscriptions className="text-xl text-green-700 md:mr-3" />{' '}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.subscribed}
                </span>
              </div>
            </div>
            <div className="mt-8 flex flex-row justify-end">
              {!isAdminCommunity && (
                <button
                  className="bg-teal-500 text-white md:px-4 md:py-2 rounded-xl mr-3 p-1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (token === null) {
                      navigate('/login');
                    } else if (community?.access === 'public') {
                      handleJoinCommunity();
                    } else {
                      navigate(`/join-community/${community.Community_name}`);
                    }
                  }}>
                  {community?.access === 'public' ? 'Join Community' : 'Request to Join'}
                </button>
              )}
              <button
                className={`${
                  subscribed
                    ? 'bg-gray-400 text-gray-700 cursor-default'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } rounded-xl p-1 md:py-2 md:px-4`}
                style={{ cursor: 'pointer' }}
                onClick={handleSubscribe}>
                {getButtonLabel()}
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-full bg-gray-50 mb-5">
            <Articles community={community} />
          </div>
        </>
      )}
    </>
  );
};

export default CommunityPage;
