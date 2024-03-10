import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../../Components/ArticleCard/ArticleCard";
import Loader from "../../Components/Loader/Loader";
import { MdLocationPin, MdSubscriptions } from "react-icons/md";
import { BsGithub } from "react-icons/bs";
import { BiLogoGmail } from "react-icons/bi";
import { CgWebsite } from "react-icons/cg";
import { FaUsers, FaBook, FaPencilAlt } from "react-icons/fa";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";

const AdminArticlePage = ({ community }) => {
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
    let config = null;
    if (token) {
      config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    } else {
      config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/${community.Community_name}/articles/`,
        config
      );
      await loadData(response.data.success);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchArticles();
    };
    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newArticles = [...articles].filter((article) => {
      return (
        article.article.article_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        article.article.authors
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        article.article.keywords
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });
    await loadSortedArticles(newArticles);
    setLoading(false);
  };

  const handleNavigate = (index) => {
    if (community.isMember) {
      navigate(`/community/${community.Community_name}/${index}`);
    } else {
      navigate(`/article/${index}`);
    }
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
                placeholder="Search using keywords, authors, articles"
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
            <div className="text-sm md:text-xl font-semibold mr-2">
              Apply Filters:
            </div>
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
                  key={item.article.id}
                  className="p-2 bg-slate-100 m-1 rounded-md shadow-md w-full"
                >
                  <div
                    className="flex flex-row justify-between items-center w-full"
                    onClick={() => {
                      handleNavigate(item.article.id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <h3 className="text-xl font-medium text-green-600">
                      {item.article.article_name.replace(/_/g, " ")}
                    </h3>
                    <p className="text-gray-500 mt-2 pr-2">
                      <span className="text-green-700">Status : </span>
                      <span className="inline-flex items-center gap-1.5 py-1 px-1 rounded text-sm font-medium text-red-500">
                        {item.status}
                      </span>
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <h1 className="text-2xl font-bold text-gray-500">
                No Articles Found
              </h1>
            )}
          </ul>
        )}
      </div>
    </>
  );
};

const CommunityPage = () => {
  const { communityName } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
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
              "Content-Type": "application/json",
            },
          };
        } else {
          config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        }
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/community/${communityName}/`,
          config
        );
        await loadCommunity(res.data.success);
        setSubscribed(res.data.success.isSubscribed);
      } catch (error) {
        console.log(error);
        if (error.response.data.detail === "Not found.") {
          ToastMaker("Community doesn't exists!!!", 3000, {
            valign: "top",
            styles: {
              backgroundColor: "red",
              fontSize: "20px",
            },
          });
          navigate("/communities");
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
      navigate("/login");
    }
    setLoading(true);
    try {
      const updatedStatus = !subscribed;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      if (subscribed === false) {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/community/${community.Community_name}/subscribe/`,
          {
            user: user.id,
          },
          config
        );
        if (response.status === 200) {
          await loadData(updatedStatus);
        }
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/community/${community.Community_name}/unsubscribe/`,
          {
            user: user.id,
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
  const getButtonLabel = () => {
    if (loading) {
      return (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
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

    return <>{subscribed === true ? "Unsubscribe" : "Subscribe"}</>;
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
                  Subtitle :{" "}
                </span>
                {community?.subtitle}
              </p>
              <p className="test-sm md:text-md text-left text-gray-500">
                <span className="test-sm md:text-lg text-left font-bold text-green-700">
                  Description :{" "}
                </span>
                {community?.description}
              </p>
              <p className="test-sm md:text-md text-left text-gray-500">
                <span className="test-sm md:text-lg text-left font-bold text-green-700">
                  Admins :{" "}
                </span>
                {community?.admins.map((admin) => admin).join(", ")}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap justify-between">
              <div className="mt-4 flex">
                <MdLocationPin className="text-xl text-green-700 md:mr-3" />{" "}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.location}
                </span>
              </div>
              <div className="mt-4 flex">
                <BsGithub className="text-xl text-green-700 md:mr-3" />{" "}
                <a
                  className="text-sm md:text-md text-left text-gray-500"
                  href={community?.github}
                >
                  {community?.github}
                </a>
              </div>
              <div className="mt-4 flex">
                <BiLogoGmail className="text-xl text-green-700 md:mr-3" />{" "}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.email}
                </span>
              </div>
              <div className="mt-4 flex">
                <CgWebsite className="text-xl text-green-700 md:mr-3" />{" "}
                <a
                  className="text-sm md:text-md text-left text-gray-500"
                  href={community?.website}
                >
                  {community?.website}
                </a>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-between">
              <div className="mt-4 flex">
                <FaUsers className="text-xl text-green-700 md:mr-3" />{" "}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.membercount}
                </span>
              </div>
              <div className="mt-4 flex">
                <FaPencilAlt className="text-xl text-green-700 md:mr-3" />{" "}
                <a
                  className="text-sm md:text-md text-left text-gray-500"
                  href={community?.github}
                >
                  {community?.evaluatedcount}
                </a>
              </div>
              <div className="mt-4 flex">
                <FaBook className="text-xl text-green-700 md:mr-3" />{" "}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.publishedcount}
                </span>
              </div>
              <div className="mt-4 flex">
                <MdSubscriptions className="text-xl text-green-700 md:mr-3" />{" "}
                <span className="text-sm md:text-md text-left text-gray-500">
                  {community?.subscribed}
                </span>
              </div>
            </div>
            <div className="mt-8 flex flex-row justify-end">
              <button
                className="bg-teal-500 text-white md:px-4 md:py-2 rounded-xl mr-3 p-1"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (token === null) {
                    navigate("/login");
                  } else {
                    navigate(`/join-community/${community.Community_name}`);
                  }
                }}
              >
                Join Community
              </button>
              {/* <button
                                        className={`${
                                            subscribed
                                            ? 'bg-gray-400 text-gray-700 cursor-default'
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                        } rounded-xl p-1 md:py-2 md:px-4`}
                                        style={{cursor:"pointer"}}
                                        onClick={handleSubscribe}
                                        >
                                        {getButtonLabel()}
                                    </button> */}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-full bg-gray-50 mb-5">
            <AdminArticlePage community={community} />
          </div>
        </>
      )}
    </>
  );
};

export default CommunityPage;
