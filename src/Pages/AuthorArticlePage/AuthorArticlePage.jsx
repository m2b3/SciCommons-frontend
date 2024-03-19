import React, { useState, useEffect } from "react";
import cal from "./calendar.png";
import folder from "./folder.png";
import eye from "./eye-open.png";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../Utils/axios";
import Loader from "../../Components/Loader/Loader";
import { AiFillHeart, AiTwotoneStar, AiOutlineHeart } from "react-icons/ai";
import { MdOutlineViewSidebar } from "react-icons/md";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import { AiOutlineFilePdf, AiOutlineShareAlt } from "react-icons/ai";
import { BsChatLeftText } from "react-icons/bs";
import DisplayCommunity from "./DisplayCommunity";
import SubmitCommunity from "./SubmitCommunity";
import ArticleEditPage from "./ArticleEditPage";


const AuthorArticlePage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [articleEdit, setArticleEdit] = useState(false);
  const { token } = useGlobalContext();

  const loadArticleData = async (res) => {
    setArticle(res);
  };

  useEffect(() => {
    const getArticle = async () => {
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        const res = await axios.get(`/api/user/articles/${articleId}/`, config);
        if (res.data.success.length === 0) {
          navigate("/");
        }
        await loadArticleData(res.data.success[0]);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    getArticle();
  }, []);

  const handleProfile = (e, data) => {
    e.preventDefault();
    console.log(data);
    navigate(`/profile/${data}`);
  };

  const handleFile = () => {
    window.open(article.article_file);
  };

  const findTime = (date) => {
    const time = new Date(date);
    const now = new Date();
    const diff = now - time;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    if (years > 0) {
      return `${years} years ago`;
    } else if (months > 0) {
      return `${months} months ago`;
    } else if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else if (seconds > 0) {
      return `${seconds} seconds ago`;
    } else {
      return `Just now`;
    }
  };

  const handleArticleEdit = async (res) => {
    await loadArticleData(res);
    setArticleEdit(false);
  };

  const handleFavourites = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (article.isFavourite === false) {
      try {
        const res = await axios.post(
          `/api/article/favourite/`,
          { article: articleId },
          config
        );
        const newArticle = {
          ...article,
          isFavourite: true,
          favourites: article.favourites + 1,
        };
        await loadArticleData(newArticle);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const res = await axios.post(
          `/api/article/unfavourite/`,
          { article: articleId },
          config
        );
        const newArticle = {
          ...article,
          isFavourite: false,
          favourites: article.favourites - 1,
        };
        await loadArticleData(newArticle);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleShow = () => {
    setShow(true);
  };

  const formatCount = (count) => {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return (count / 1000).toFixed(1) + "K";
    } else {
      return (count / 1000000).toFixed(1) + "M";
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    ToastMaker("Link Copied to Clipboard", 3500, {
      valign: "top",
      styles: {
        backgroundColor: "green",
        fontSize: "20px",
      },
    });
    e.stopPropagation();
    navigator.clipboard.writeText(
      `https://scicommons.org/article/${article.id}`
    );
  };

  return (
    <div className="bg-white min-h-screen">
      {(loading || article === null) && <Loader />}
      {!loading && article !== null && (
        <div className="bg-white">
          <div className="flex justify-center bg-white w-full md:w-5/6 mt-[1rem] mx-auto p-2 overflow-hidden">
            <div className=" mt-1 w-full  justify-self-center bg-white">
              <div className="py-5 ">
                <div className="flex bg-white flex-row justify-between">
                  <div className="text-lg md:text-3xl font-[700] text-gray-600 bg-white uppercase">
                    {article.article_name.replace(/_/g, " ")}
                  </div>
                  <div className="flex flex-row">
                    <div
                      className="icon"
                      style={{ cursor: "pointer" }}
                      onClick={handleFavourites}
                    >
                      {article.isFavourite === true ? (
                        <AiFillHeart className="w-[2rem] h-[2rem]" />
                      ) : (
                        <AiOutlineHeart className="w-[2rem] h-[2rem]" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="py-1 bg-white">
                  <span className="italic font-sans text-md md:text-lg leading-[1.5rem] ">
                    {article.link && (
                      <span className="text-green-800 font-semibold">
                        Added by:{" "}
                      </span>
                    )}
                    {article.authors.map((data, i) => {
                      return (
                        <span
                          key={i}
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleProfile(data);
                          }}
                        >
                          {data}
                          <span> </span>
                        </span>
                      );
                    })}
                  </span>
                </div>
                <div className="py-1 bg-white">
                  {article.unregistered_authors.length > 0 && (
                    <>
                      <span className="text-[0.75rem] font-bold text-green-800">
                        UnRegistered Author(s) :{" "}
                      </span>
                      <span className="italic font-sans text-[0.75rem] leading-[1.5rem] ">
                        {article.unregistered_authors.map((data, i) => {
                          return (
                            <span key={i} style={{ cursor: "pointer" }}>
                              {data.fullName}
                              <span> , </span>
                            </span>
                          );
                        })}
                      </span>
                    </>
                  )}
                </div>
                <div className="bg-white">
                  <span className="text-[.75rem] p-0">
                    {!article.link && (
                      <>
                        <img
                          className="w-[.875rem] inline mb-1"
                          src={cal}
                          alt=""
                        ></img>
                        <span className="pl-1">Published:</span>
                        {article.published_date === null
                          ? " Not Published"
                          : findTime(article.published_date)}
                        <img
                          className="w-[.875rem] inline mb-1 mr-1 ml-4"
                          src={folder}
                          alt=""
                        ></img>

                        {article.published === null
                          ? " Not Yet"
                          : `Accepted by ${article.published}`}
                      </>
                    )}
                    <img
                      className="w-[.875rem] inline mb-1 mr-1 ml-4"
                      src={eye}
                      alt=""
                    ></img>

                    {article.status === "public" ? "Everyone" : "Private"}
                    <AiFillHeart className="w-[.875rem] inline mb-1 mr-1 ml-4" />
                    {formatCount(article.favourites)}
                    <MdOutlineViewSidebar className="w-[.875rem] inline mb-1 mr-1 ml-4" />
                    {formatCount(article.views)}
                    <AiTwotoneStar className="w-[.875rem] inline mb-1 mr-1 ml-4" />
                    {article.rating === null ? "0" : article.rating}
                  </span>
                </div>
              </div>
              <div className="text-[.75rem] leading-[1.125rem] mt-[-0.875rem] bg-white">
                {article.Abstract !== null && article.Abstract !== "" && (
                  <span className="block">
                    <strong className="text-green-700"> Abstract : </strong>
                    <span className="italic">{article.Abstract}</span>
                  </span>
                )}
                {article.license !== null && article.license !== "" && (
                  <div className="block">
                    <strong className="text-green-700 font-[700]">
                      {" "}
                      License :{" "}
                    </strong>
                    <span>{article.license}</span>
                  </div>
                )}
                {article.Code !== null && article.Code !== "" && (
                  <div className="block">
                    <strong className="text-green-700 font-[700]">
                      Code :{" "}
                    </strong>
                    <a href={article.Code} className="text-[#337ab7]">
                      {" "}
                      {article.Code}
                    </a>
                  </div>
                )}
                {article.video !== null && article.Code !== "" && (
                  <div className="block">
                    <strong className="text-green-700 font-[700]">
                      {" "}
                      Video Link:{" "}
                    </strong>
                    <a href={article.video} className="text-[#337ab7]">
                      {" "}
                      {article.video}
                    </a>
                  </div>
                )}
                {article.doi !== null && article.doi !== "" && (
                  <div className="block">
                    <strong className="text-green-700 font-[700]">
                      {" "}
                      DOI:{" "}
                    </strong>
                    <a href={article.doi} className="text-[#337ab7]">
                      {article.doi}
                    </a>
                  </div>
                )}
                {article.link && (
                  <div className="block">
                    <strong className="text-green-700 font-[700]">
                      {" "}
                      Article Link:{" "}
                    </strong>
                    <a href={article.link} className="text-[#337ab7]">
                      {" "}
                      {article.link}
                    </a>
                  </div>
                )}
                <div className="block">
                  <strong className="text-green-700 font-[700]">
                    {" "}
                    Submission Date :{" "}
                  </strong>
                  <span> {findTime(article.Public_date)} </span>
                </div>
              </div>

              <div className="flex flex-row justify-center bg-white">
                {!article.article_file.includes("None") && (
                  <button
                    className="flex items-center space-x-2 p-2 bg-red-500 mr-4 text-white text-md shadow-lg rounded-md hover:bg-red-600"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      handleFile();
                    }}
                  >
                    <AiOutlineFilePdf className="w-5 h-5" />
                    <span className="text-md">Pdf</span>
                  </button>
                )}
                <button
                  className="flex items-center space-x-2 p-2 bg-green-500 mr-4 text-white text-md shadow-lg rounded-md hover:bg-green-600"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate(`/chat/${articleId}`);
                  }}
                >
                  <BsChatLeftText className="w-5 h-5" />
                  <span className="text-md">Chat</span>
                </button>
                <button
                  className="flex items-center space-x-2 p-2 bg-blue-500 text-white text-md shadow-lg rounded-md hover:bg-blue-600"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    handleShare(e);
                  }}
                >
                  <AiOutlineShareAlt className="w-5 h-5" />
                  <span className="text-md">Share</span>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-end bg-white w-full md:w-5/6 mx-auto p-2 overflow-hidden">
            <div className="bg-white border-[#3f6978] border-solid">
              <div className=" flex flex-row float-right">
                <span
                  className="block box-content text-white bg-[#4d8093] text-[0.55 rem] border-solid ml-2 md:font-bold p-2 pt-0 rounded"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setArticleEdit(true);
                  }}
                >
                  Edit Article
                </span>
                <span
                  className="block box-content text-white bg-[#4d8093] text-[0.55 rem] border-solid ml-2 md:font-bold p-2 pt-0 rounded"
                  style={{ cursor: "pointer" }}
                  onClick={handleShow}
                >
                  Add Community
                </span>
              </div>
            </div>
          </div>
          <div className="w-full mt-3">
            <DisplayCommunity article={articleId} />
          </div>
          {show && <SubmitCommunity article={article} setShow={setShow} />}
          {articleEdit && (
            <ArticleEditPage
              setArticleEdit={setArticleEdit}
              handleArticleEdit={handleArticleEdit}
              article={article}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AuthorArticlePage;
