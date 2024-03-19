import React, { useEffect, useState } from "react";
import axios from "../../Utils/axios";
import ArticleCard from "../../Components/ArticleCard/ArticleCard";
import Loader from "../../Components/Loader/Loader";
import { useGlobalContext } from "../../Context/StateContext";

const FavouritePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortedArticles, setSortedArticles] = useState([]);
  const { token } = useGlobalContext();

  const loadData = async (res) => {
    setArticles(res);
    setSortedArticles(res);
  };

  const loadSortedArticles = async (res) => {
    setSortedArticles(res);
  };
  const fetchArticles = async () => {
    setLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${token}` // Include the token in the Authorization header
      }
    };
    try {
      const response = await axios.get(`/api/article/favourites/`, config);
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
        article.article_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authors.join(" ").toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.keywords.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    await loadSortedArticles(newArticles);
    setLoading(false);
  };

  const sortRated = (e) => {
    e.preventDefault();
    setLoading(true);
    const sortedByRating = [...articles].sort((a, b) => b.rating - a.rating);
    setSortedArticles(sortedByRating);
    setLoading(false);
  };
  const sortFavourite = (e) => {
    e.preventDefault();
    setLoading(true);
    const sortedByFavourite = [...articles].sort((a, b) => b.favourites - a.favourites);
    setSortedArticles(sortedByFavourite);

    setLoading(false);
  };
  const sortViews = (e) => {
    e.preventDefault();
    setLoading(true);
    const sortedByViews = [...articles].sort((a, b) => b.views - a.views);
    setSortedArticles(sortedByViews);

    setLoading(false);
  };
  const sortDate = (e) => {
    e.preventDefault();
    setLoading(true);
    const sortedByDate = [...articles].sort((a, b) => {
      const dateA = new Date(a.Public_date);
      const dateB = new Date(b.Public_date);
      return dateB - dateA;
    });
    setSortedArticles(sortedByDate);
    setLoading(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-start w-full bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-700 mt-2">Favourite Articles</h1>
        <form className="w-5/6 px-4 mt-2 md:w-2/3" onSubmit={handleSearch}>
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
        <div className="flex flex-row justify-end mb-5 w-full md:w-2/3">
          <button
            className="mx-1 px-3 mt-4 text-black bg-green-100 rounded-md hover:bg-green-400"
            style={{ cursor: "pointer" }}
            onClick={sortRated}
          >
            Most Rated
          </button>
          <button
            className="mx-1 px-3 mt-4 text-black bg-green-100 rounded-md hover:bg-green-400"
            style={{ cursor: "pointer" }}
            onClick={sortFavourite}
          >
            Most Favourite
          </button>
          <button
            className="mx-1 px-3 mt-4 text-black bg-green-100 rounded-md hover:bg-green-400"
            style={{ cursor: "pointer" }}
            onClick={sortViews}
          >
            Most Views
          </button>
          <button
            className="mx-1 px-3 mt-4 text-black bg-green-100 rounded-md hover:bg-green-400"
            style={{ cursor: "pointer" }}
            onClick={sortDate}
          >
            Most Recent
          </button>
        </div>
        <div className="flex flex-col items-center justify-center w-full bg-gray-50 mb-5">
          {loading ? <Loader /> : <ArticleCard articles={sortedArticles} />}
        </div>
      </div>
    </>
  );
};

export default FavouritePage;
