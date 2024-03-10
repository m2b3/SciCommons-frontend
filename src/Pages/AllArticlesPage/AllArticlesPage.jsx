import React, { useEffect, useState } from "react";
import axios from "axios";
import ArticleCard from "../../Components/ArticleCard/ArticleCard";
import Loader from "../../Components/Loader/Loader";
import Footer from "../../Components/Footer/Footer";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";

const AllArticlesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All");
  const [orderOption, setOrderOption] = useState("Ascending");
  const [loadingmore, setLoadingMore] = useState(false);
  const { token } = useGlobalContext();

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleOrderChange = (e) => {
    setOrderOption(e.target.value);
  };

  const loadData = async (res) => {
    setArticles(res);
  };

  const loadMoreData = async (res) => {
    const newArticles = [...articles, ...res];
    setArticles(newArticles);
  };

  const fetchArticles = async () => {
    setLoading(true);
    let config = null;
    if (token !== null) {
      config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/article/`,
        config
      );
      await loadData(response.data.success.results);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fillFilter = () => {
    if (selectedOption === "Rating") {
      return "rated";
    } else if (selectedOption === "Favourites") {
      return "favourite";
    } else if (selectedOption === "Views") {
      return "viewed";
    }
    return "recent";
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    let filter = fillFilter();
    let config = null;
    if (token !== null) {
      config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
    if (orderOption === "Ascending") {
      filter = "least_" + filter;
    } else {
      filter = "most_" + filter;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/article/?search=${searchTerm}`,
        {
          params: {
            order: filter,
          },
        },
        config
      );
      await loadData(response.data.success.results);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      let filter = fillFilter();
      if (orderOption === "Ascending") {
        filter = "least_" + filter;
      } else {
        filter = "most_" + filter;
      }
      let config = null;
      if (token !== null) {
        config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      }
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/article/?search=${searchTerm}&limit=20&offset=${articles.length}`,
        {
          params: {
            order: filter,
          },
        },
        config
      );
      const data = response.data.success.results;
      if (response.data.success.count === articles.length) {
        ToastMaker("No more articles to load", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
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
      <div
        className="flex flex-col items-center justify-start bg-gray-50 min-h-screen"
      >
        <h1 className="text-3xl font-bold text-gray-700 mt-10">Articles</h1>
        <form
          className="w-5/6 px-4 mt-10 md:w-2/3 flex flex-row"
          onSubmit={handleSearch}
        >
          <div className="relative w-full">
            <input
              style={{ border: "2px solid #cbd5e0" }}
              type="text"
              placeholder="Search using keywords, authors, articles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pr-4 text-green-600 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-green-600"
            />
          </div>
          <button
            className="px-1 text-white text-lg bg-gray-600 ml-2 rounded-md px-4"
            onClick={handleSearch}
          >
            Search
          </button>
        </form>
        <div className="flex flex-row flex-wrap justify-center items-center mb-5 w-full md:w-2/3">
          <div className="flex flex-row items-center mt-3">
            <div className="relative inline-flex mr-2">
              <select
                className="bg-white text-gray-800 text-sm md:text-lg border rounded-lg px-4 py-1 transition duration-150 ease-in-out"
                value={selectedOption}
                onChange={handleOptionChange}
              >
                <option value="Date">Date</option>
                <option value="Rating">Rating</option>
                <option value="Favourites">Favourites</option>
                <option value="Views">Views</option>
              </select>
            </div>
          </div>
          <div className="flex flex-row items-center mt-3">
            <div className="text-sm md:text-lg font-semibold mr-2">Order:</div>
            <div className="relative inline-flex mr-2">
              <select
                className="bg-white text-gray-800 text-sm md:text-lg border rounded-lg px-4 py-1 transition duration-150 ease-in-out"
                value={orderOption}
                onChange={handleOrderChange}
              >
                <option value="Descending">Descending</option>
                <option value="Ascending">Ascending</option>
              </select>
            </div>
          </div>
          <button
            className="bg-green-500 text-md text-white shadow-lg mt-3 ml-3 p-1 rounded-lg"
            onClick={handleSearch}
          >
            Apply Filters
          </button>
        </div>

        <div className="flex flex-col items-center justify-center mx-auto w-full bg-gray-50 mb-5">
          {loading ? <Loader /> : <ArticleCard articles={articles} />}
          {(loading || articles.length > 0) && (
            <div className="flex flex-row justify-center">
              <button
                className="bg-green-500 text-white px-2 py-1 mt-4 rounded-lg"
                onClick={handleLoadMore}
              >
                {loadingmore ? "loading..." : "load More Articles"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllArticlesPage;
