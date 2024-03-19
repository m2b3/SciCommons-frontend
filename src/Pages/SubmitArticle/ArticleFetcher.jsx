import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../Context/StateContext";
import axios from "../../Utils/axios";
import toast from "react-hot-toast";

const ArticleFetcher = () => {
    const [inputValue, setInputValue] = useState("");
    const [articleData, setArticleData] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [articleType, setArticleType] = useState("");
  
    const navigate = useNavigate();
  
    const { token } = useGlobalContext();
  
    const handleInputChange = (event) => {
      setInputValue(event.target.value);
    };
  
    const fetchArticle = async () => {
      setArticleData(null); // Reset article data before fetching new article
      let apiUrl = "";
      if (inputValue.startsWith("10.")) {
        // DOI
        apiUrl = `https://api.crossref.org/works/${inputValue}`;
        setArticleType("doi");
      } else if (inputValue.startsWith("arXiv:")) {
        // arXiv ID
        const arxivId = inputValue.split(":")[1];
        apiUrl = `https://export.arxiv.org/api/query?id_list=${arxivId}`;
        setArticleType("arxiv");
      } else {
        setFetchError("Invalid input. Please enter a valid DOI or arXiv ID.");
        return;
      }
  
      try {
        const response = await axios.get(apiUrl);
        setArticleData(response.data);
        setFetchError(null);
      } catch (error) {
        setFetchError("Failed to fetch article. Please try again.");
      }
    };
  
    const renderArticleDetails = () => {
        switch (articleType) {
          case "doi":
            return (
              <div>
                <h2 className="text-lg font-bold">
                  {articleData.message.title[0]}
                </h2>
                <p>
                  Authors:{" "}
                  {articleData.message.author.map((a) => a.family).join(", ")}
                </p>
                <p>Abstract: {articleData.message.abstract}</p>
                <a
                  href={articleData.message.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Full Article
                </a>
              </div>
            );
          case "arxiv": {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(articleData, "text/xml");
            const title =
              xmlDoc.getElementsByTagName("title")[1].childNodes[0].nodeValue;
            const authors = Array.from(xmlDoc.getElementsByTagName("author"))
              .map((author) => author.childNodes[1].textContent)
              .join(", ");
            const abstract =
              xmlDoc.getElementsByTagName("summary")[0].childNodes[0].nodeValue;
            const arxivId = inputValue.split(":")[1];
            const arxivLink = `https://arxiv.org/abs/${arxivId}`;
            return (
              <div>
                <h2 className="text-lg font-bold">{title}</h2>
                <p>Authors: {authors}</p>
                <p>Abstract: {abstract}</p>
                <a
                  href={arxivLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Full Article
                </a>
              </div>
            );
            }
          default:
            return null;
        }
      };
      
  
    const addArticleToBackend = async () => {
      const baseURL = `/api/article/`;
      let articleDetails = {};
      if (articleType === "doi") {
        articleDetails = {
          article_name: articleData.message.title[0],
          unregistered_authors: articleData.message.author.map((author) => {
            return JSON.stringify({ fullName: author.family, email: "" });
          }),
          keywords: "doi",
          Abstract: articleData.message.abstract,
          link: articleData.message.URL,
          video: "",
          Code: "",
          status: "public",
          article_file: undefined,
          authors: [JSON.stringify(0)],
          communities: [JSON.stringify(0)],
        };
      } else if (articleType === "arxiv") {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(articleData, "text/xml");
        const title =
          xmlDoc.getElementsByTagName("title")[1].childNodes[0].nodeValue;
        const authors = Array.from(xmlDoc.getElementsByTagName("author")).map(
          (author) => author.childNodes[1].textContent
        );
        const abstract =
          xmlDoc.getElementsByTagName("summary")[0].childNodes[0].nodeValue;
        const arxivId = inputValue.split(":")[1];
        const arxivLink = `https://arxiv.org/abs/${arxivId}`;
        articleDetails = {
          article_name: title,
          unregistered_authors: authors.map((author) => {
            return JSON.stringify({ fullName: author, email: "" });
          }),
          keywords: "arxiv",
          Abstract: abstract,
          link: arxivLink,
          video: "",
          Code: "",
          status: "public",
          article_file: undefined,
          authors: [JSON.stringify(0)],
          communities: [JSON.stringify(0)],
        };
      }
  
      try {
        const response = await axios.post(baseURL, articleDetails, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        // Todo: Use toast.promise later
        toast.success("Article added successfully. Redirecting to the article page.");
  
        if (response.data.success.id) {
          // redirect the user to the article page
          navigate("/article/" + response.data.success.id);
        }
      } catch (error) {
        toast.error(error.response.data.error);
        console.error("Error adding article:", error);
      }
    };
  
    return (
      <>
        <div className="my-10 mx-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchArticle();
            }}
            // class="max-w-md mx-auto"
          >
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                placeholder="Enter DOI, arXiv ID, or PubMed ID"
                value={inputValue}
                onChange={handleInputChange}
                required
              />
              <button
                type="submit"
                className="text-white absolute end-2.5 bottom-2.5 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                Search
              </button>
            </div>
          </form>
  
          {fetchError && (
            <div className="text-red-500 mt-2 text-center">{fetchError}</div>
          )}
          {articleData && (
            <div className="mt-4 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              {renderArticleDetails()}
              <button
                className="mt-4 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                type="button"
                onClick={addArticleToBackend}
              >
                Add Article
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  export default ArticleFetcher;