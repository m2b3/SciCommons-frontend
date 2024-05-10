import React, { useState } from "react";
import Loader from "../../Components/Loader/Loader";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";


const PubMedSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useGlobalContext();
  
    const loadData = async (res) => {
      setResults(res);
    };
  
    const handleSearch = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json`
        );
        const data = response.data;
        let ids = data.esearchresult.idlist.slice(0, 10);
        if (ids === undefined || ids === null) {
          setResults([]);
          setLoading(false);
          return;
        }
        let articles = [];
  
        const summaryResponse = await axios.get(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(
            ","
          )}&retmode=json`
        );
        const summaryData = summaryResponse.data;
        if (summaryData.result === undefined || summaryData.result === null) {
          setResults([]);
          setLoading(false);
          return;
        }
        articles = Object.values(summaryData.result).map(async (article) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (article.uid === undefined) return;
          try {
            return {
              uid: article.uid,
              title: article.sorttitle,
              authors: article.authors,
              journal: article.source,
              pubdate: article.pubdate,
              url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}`,
            };
          } catch (error) {
            console.log(error);
          }
        });
  
        const resolvedArticles = await Promise.all(articles);
        const newArticles = resolvedArticles.filter((article) => {
          if (article === undefined) return false;
          return true;
        });
        await loadData(newArticles);
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };
  
    const handleSubmit = async (article) => {
      const baseURL = `/api/article/`;
      setLoading(true);
      try {
        const abstractResponse = await fetch(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${article.uid}&retmode=xml`
        );
        const abstractData = await abstractResponse.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(abstractData, "text/xml");
        let abstract = "";
        if (xml.querySelector("AbstractText") !== null) {
          abstract = xml.querySelector("AbstractText").textContent;
        }
  
        const response = await axios.post(
          baseURL,
          {
            article_name: article.title,
            unregistered_authors: article.authors.map((author) => {
              return JSON.stringify({ fullName: author.name, email: "" });
            }),
            keywords: "pubmed",
            Abstract: abstract,
            link: article.url,
            video: "",
            Code: "",
            status: "public",
            article_file: undefined,
            authors: [JSON.stringify(0)],
            communities: [JSON.stringify(0)],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.log(error);
        ToastMaker(error.response.data.error, 3500, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
        setLoading(false);
        return;
      }
      setLoading(false);
      ToastMaker("Article Added Successfully", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
    };
  
    return (
      <div className="w-full flex flex-col items-center min-h-screen">
        <div className="w-full h-20 flex flex-row justify-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(e);
            }}
            className="w-full h-20 flex flex-row justify-center"
          >
            <input
              style={{ border: "2px solid #cbd5e0" }}
              type="text"
              className="w-2/3 rounded-xl m-4 shadow-xl"
              placeholder="Enter article name to search using pubmed"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              onClick={handleSearch}
              className="ml-2 my-4 bg-gray-600 text-white font-bold p-2 rounded-xl shadow-xl"
            >
              Search
            </button>
          </form>
        </div>
        <div className="m-4">
          {loading && <Loader />}
          {!loading &&
            results.length > 0 &&
            results.map((article) => (
              <div
                key={article.url}
                className="shadow-xl bg-gray-50 rounded-lg p-2 my-2 w-full md:w-5/6 mx-auto"
              >
                <h2 className="text-2xl text-gray-600 font-bold uppercase">
                  {article.title}
                </h2>
                <br />
                <p className="text-sm">
                  <span className="text-green-600 font-bold">Author(s) : </span>
                  {article.authors.map((author) => {
                    return author.name + " , ";
                  })}
                </p>
                <p className="text-sm">
                  <span className="text-green-600 font-bold">Journal : </span>
                  {article.journal}
                </p>
                <div className="flex flex-row justify-between">
                  <a
                    href={article.url}
                    className="text-blue-600 font-semibold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more
                  </a>
                  <button
                    className="bg-green-600 text-white font-semibold p-1 m-1 rounded-lg"
                    onClick={() => {
                      handleSubmit(article);
                    }}
                  >
                    Add Article
                  </button>
                </div>
              </div>
            ))}
          {!loading && results.length === 0 && (
            <h1 className="text-xl font-bold text-gray-600">No Articles Found</h1>
          )}
        </div>
      </div>
    );
};

export default PubMedSearch;