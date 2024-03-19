import React, { useEffect, useState } from "react";
import axios from "../../Utils/axios";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/Loader/Loader";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import AcceptArticleModal from "./AcceptArticleModal";
import RejectArticleModal from "./RejectArticleModal";
import PublishArticleModal from "./PublishArticleModal";

const AdminArticlePage = ({ community }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortedArticles, setSortedArticles] = useState([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [data, setData] = useState(null);
  const { token } = useGlobalContext();

  const navigate = useNavigate();

  const loadData = async (res) => {
    setArticles(res);
    setSortedArticles(res);
  };

  const handleModified = async (index) => {
    let newarticles = [];
    for (var i = 0; i < articles.length; i++) {
      if (articles[i].article.id === index) {
        let newarticle = articles[i];
        newarticle.status = "in review";
        newarticles.push(newarticle);
      } else {
        newarticles.push(articles[i]);
      }
    }
    await loadData(newarticles);
  };

  const handleReject = async (index) => {
    const articleIndex = articles.findIndex((article) => article.article.id === index);
    let newarticles = [...articles];
    newarticles[articleIndex].status = "rejected";
    await loadData(newarticles);
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
      const response = await axios.get(`/api/community/${community}/articles/`, config);
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
      return (
        article.article.article_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.article.authors.join(" ").toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.article.keywords.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    await loadSortedArticles(newArticles);
    setLoading(false);
  };

  const handleNavigate = (index) => {
    navigate(`/community/${community}/${index}`);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full bg-white">
        <form className="w-5/6 px-4 mt-1 md:w-2/3" onSubmit={handleSearch}>
          <div className="relative">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-0 bottom-0 w-4 h-4 md:w-6 md:h-6 my-auto text-gray-400 md:left-3"
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
                className="w-full py-1 pl-4 pr-2 md:py-3 md:pl-12 md:pr-4 text-green-600 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-green-600"
              />
            </div>
            <button
              type="submit"
              onClick={handleSearch}
              className="absolute top-0 bottom-0 right-0 p-1 md:px-4 md:py-3 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:bg-gray-700"
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

      <div className="flex w-full bg-white min-h-screen mb-5">
        {loading ? (
          <Loader />
        ) : (
          <ul className="mt-2 flex flex-col w-full">
            {sortedArticles.length > 0 ? (
              sortedArticles.map((item) => (
                <li
                  key={item.article.id}
                  className="p-2 bg-slate-100 m-1 rounded-md shadow-md w-full"
                >
                  <div
                    className="flex flex-row justify-between flex-wrap items-center w-full"
                    onClick={() => {
                      handleNavigate(item.article.id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <h3 className="text-md md:text-xl font-medium text-green-600">
                      {item.article.article_name.replace(/_/g, " ")}
                    </h3>
                    <p className="text-gray-500 mt-2 pr-2">
                      <span className="text-green-700">Status : </span>
                      <span className="inline-flex items-center gap-1.5 py-1 px-1 rounded text-sm font-medium text-red-500">
                        {item.status}
                      </span>
                    </p>
                    {item.status === "submitted" && (
                      <div className="flex flex-row justify-between mt-2">
                        <button
                          className="bg-blue-600 px-2 py-1 rounded-lg font-semibold text-white mr-2 text-sm md:text-md"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowAccept(true);
                            setData({ article: item.article.id });
                            e.stopPropagation();
                          }}
                        >
                          Accept for Reviewal
                        </button>
                        <button
                          className="bg-gray-500 px-2 py-1 rounded-lg font-semibold text-white text-sm md:text-md"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowReject(true);
                            setData({ article: item.article.id });
                            e.stopPropagation();
                          }}
                        >
                          Reject Article
                        </button>
                      </div>
                    )}
                    {item.status === "published" && (
                      <div className="flex flex-row justify-between mt-2">
                        <button
                          className="bg-blue-600 px-2 py-1 rounded-lg font-semibold text-white mr-2 text-sm md:text-md"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowPublish(true);
                            setData({ article: item.article.id });
                            e.stopPropagation();
                          }}
                        >
                          Update Publish Details
                        </button>
                      </div>
                    )}
                  </div>
                  {showReject && (
                    <RejectArticleModal
                      setShowReject={setShowReject}
                      article={data.article}
                      community={community}
                      handleReject={handleReject}
                    />
                  )}
                  {showAccept && (
                    <AcceptArticleModal
                      setShowAccept={setShowAccept}
                      article={data.article}
                      community={community}
                      handleModified={handleModified}
                    />
                  )}
                  {showPublish && (
                    <PublishArticleModal
                      setShowPublish={setShowPublish}
                      article={data.article}
                      community={community}
                    />
                  )}
                </li>
              ))
            ) : (
              <h1 className="text-2xl font-bold text-gray-500">No Articles Found</h1>
            )}
          </ul>
        )}
      </div>
    </>
  );
};

export default AdminArticlePage;
