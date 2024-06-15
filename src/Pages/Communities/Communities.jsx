import React, { useState, useEffect } from 'react';
import axios from '../../Utils/axios';
import Loader from '../../Components/Loader/Loader';
import ToastMaker from 'toastmaker';
import 'toastmaker/dist/toastmaker.css';
import { useGlobalContext } from '../../Context/StateContext';
import { useNavigate } from 'react-router-dom';
import { MdSubscriptions } from 'react-icons/md';
import { FaBook, FaPencilAlt, FaUsers } from 'react-icons/fa';
import CommunityCardSkeleton from '../../Components/Loader/CommentCardSkeleton';

const Communities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingmore, setLoadingMore] = useState(false);
  const { token } = useGlobalContext();
  const navigate = useNavigate();

  const loadMoreData = async (res) => {
    const newCommunities = [...communities, ...res];
    setCommunities(newCommunities);
  };

  const fetchCommunities = async () => {
    setLoading(true);
    let config = null;
    if (token !== null) {
      config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    }
    try {
      const url = searchTerm ? `/api/community?search=${searchTerm}` : '/api/community/';
      const response = await axios.get(url, config);
      searchTerm
        ? setCommunities(response.data.success.results)
        : loadMoreData(response.data.success);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchCommunities();
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      let config = null;
      if (token !== null) {
        config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
      }
      const response = await axios.get(
        `/api/community/?search=${searchTerm}&limit=20&offset=${communities.length}`,
        config
      );
      const data = response.data.success.results;
      if (response.data.success.count === communities.length) {
        ToastMaker('No more communities to load', 3000, {
          valign: 'top',
          styles: {
            backgroundColor: 'red',
            fontSize: '20px'
          }
        });
      }
      await loadMoreData(data);
    } catch (err) {
      console.log(err);
    }
    setLoadingMore(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-gray-50 w-full">
        <h1 className="text-3xl font-bold text-gray-700 mt-10">Communities</h1>
        <form className="w-5/6 px-4 mt-10 md:w-2/3 flex flex-row" onSubmit={handleSearch}>
          <div className="relative w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              style={{ border: '2px solid #cbd5e0' }}
              type="text"
              placeholder="Search Communities"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-12 pr-4 text-green-600 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-green-600"
            />
          </div>
          <button
            className="px-1 text-white text-lg bg-gray-600 ml-2 rounded-md px-4"
            onClick={handleSearch}>
            Search
          </button>
        </form>
        <div className="flex flex-col items-center justify-center w-full bg-gray-50 p-5">
          {loading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-12 w-full">
              {Array.from({ length: 6 }).map((_, index) => (
                <CommunityCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-12 w-full">
                {communities?.length !== 0 ? (
                  communities?.map((item, index) => (
                    <div key={item.id}>
                      <div
                        key={item.id}
                        className="p-4 bg-white shadow-md rounded-lg hover:shadow-xl"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          navigate(`/community/${item.Community_name}`);
                        }}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-xl text-green-600 font-bold mb-4">
                              {item.Community_name.replace(/_/g, ' ')}
                            </h2>
                          </div>
                          <div className="flex items-center mb-2">
                            <FaUsers className="w-5 h-5 mr-2 text-gray-500" />
                            <span className="text-gray-600">{item.membercount}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center mb-2">
                              <FaPencilAlt className="w-5 h-5 mr-2 text-gray-500" />
                              <span className="text-gray-600">
                                Evaluated : {item.evaluatedcount}
                              </span>
                            </div>
                            <div className="flex items-center mb-2">
                              <FaBook className="w-5 h-5 mr-2 text-gray-500" />
                              <span className="text-gray-600">
                                Published : {item.publishedcount}
                              </span>
                            </div>
                          </div>
                          <div className="flex">
                            <MdSubscriptions className="text-xl text-green-700 mr-3" />{' '}
                            <span className="text-md text-left text-gray-500">
                              {item?.subscribed}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <h1 className="text-2xl font-bold text-gray-500">No Communities Found</h1>
                )}
              </div>
              {communities.length !== 0 && (
                <div className="flex flex-row justify-center">
                  <button
                    className="bg-green-500 text-white px-2 py-1 mt-4 rounded-lg"
                    onClick={handleLoadMore}>
                    {loadingmore ? 'loading...' : 'load More Communities'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Communities;
