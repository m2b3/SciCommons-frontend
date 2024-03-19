import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import axios from "../../Utils/axios";
import Loader from "../../Components/Loader/Loader";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";

const DisplayCommunity = ({ article }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortedArticles, setSortedArticles] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const { token } = useGlobalContext();

  const navigate = useNavigate();

  const loadData = async (res) => {
    setArticles(res);
    setSortedArticles(res);
  };

  const handleOptionChange = async (e) => {
    setSelectedOption(e.target.value);
    if (e.target.value !== "All") {
      const newArticles = articles.filter((item) => {
        return item.status === e.target.value;
      });
      await loadSortedArticles(newArticles);
    } else {
      await loadSortedArticles([...articles]);
    }
  };

  const loadSortedArticles = async (res) => {
    setSortedArticles(res);
  };

  const fetchArticles = async () => {
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const response = await axios.get(`/api/article/${article}/isapproved/`, config);
      await loadData(response.data.success);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newArticles = [...articles].filter((article) => {
      return article.community.Community_name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    await loadSortedArticles(newArticles);
    setLoading(false);
  };

  const handleNavigate = (index) => {
    navigate(`/community/${index}/${article}`);
  };

  const handlePublish = async (e, communityName) => {
    e.preventDefault();
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const response = await axios.post(
        `/api/article/${article}/publish/`,
        { published: communityName, status: "published" },
        config
      );
      fetchArticles();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleReject = async (e, communityName) => {
    e.preventDefault();
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const response = await axios.post(
        `/api/article/${article}/publish/`,
        { published: communityName, status: "rejected by user" },
        config
      );
      fetchArticles();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full bg-white">
        <form className="w-5/6 px-4 mt-1 md:w-2/3" onSubmit={handleSearch}>
          <div className="relative">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                style={{ border: "2px solid #cbd5e0" }}
                type="text"
                placeholder="Search using community names"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-12 pr-4 text-green-600 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-green-600"
              />
            </div>
            <button
              type="submit"
              onClick={handleSearch}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:bg-gray-700"
            >
              Search
            </button>
          </div>
        </form>
        <div className="flex flex-row flex-wrap justify-center items-center mb-5 w-full md:w-2/3">
          <div className="flex flex-row items-center mt-3">
            <div className="text-sm md:text-xl font-semibold mr-2">Apply Filters:</div>
            <div className="relative inline-flex mr-2">
              <select
                className="bg-white text-gray-800 text-sm md:text-lg border rounded-lg px-4 py-1 transition duration-150 ease-in-out"
                value={selectedOption}
                onChange={handleOptionChange}
              >
                <option value="All">All</option>
                <option value="submitted">Submitted</option>
                <option value="rejected">Rejected</option>
                <option value="in review">In Review</option>
                <option value="accepted">Accepted</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row w-full bg-white justify-center min-h-screen mb-5">
        {loading ? (
          <Loader />
        ) : (
          <ul className="mt-2 flex flex-col w-full md:w-3/4">
            {sortedArticles.length > 0 ? (
              sortedArticles.map((item) => (
                <li
                  key={item.community.id}
                  className="p-2 bg-white m-1 rounded-md shadow-md w-full"
                >
                  <div
                    className="flex flex-row justify-between items-center w-full"
                    onClick={() => {
                      handleNavigate(item.community.Community_name);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <h3 className="text-xl font-medium text-green-600">
                      {item.community.Community_name}
                    </h3>
                    <p className="text-gray-500 mt-2 pr-2">
                      <span className="text-green-700">Status : </span>
                      <span className="inline-flex items-center gap-1.5 py-1 px-1 rounded text-sm font-medium text-red-500">
                        {item.status}
                      </span>
                    </p>
                    {item.status === "accepted" && (
                      <div className="flex flex-row">
                        <button
                          onClick={(e) => {
                            handlePublish(e, item.community.Community_name);
                          }}
                          className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                        >
                          Publish
                        </button>
                        <button
                          onClick={(e) => {
                            handleReject(e, item.community.Community_name);
                          }}
                          className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ml-2"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <h1 className="text-2xl font-bold text-gray-500">No Communities Found</h1>
            )}
          </ul>
        )}
      </div>
    </>
  );
};

export default DisplayCommunity;
