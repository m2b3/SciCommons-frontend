import React, { useState, useEffect } from "react";
import cal from "./calendar.png";
import folder from "./folder.png";
import eye from "./eye-open.png";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../Utils/axios";
import Loader from "../../Components/Loader/Loader";
import Comments from "../../Components/Comments/Comments";
import { AiFillHeart, AiTwotoneStar, AiOutlineHeart } from "react-icons/ai";
import { MdOutlineViewSidebar } from "react-icons/md";
import "./ArticlePage.css";
import "react-quill/dist/quill.snow.css";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import { AiOutlineFilePdf, AiOutlineShareAlt } from "react-icons/ai";
import { BsChatLeftText } from "react-icons/bs";
import ArticleCommentModal from "./ArticleCommentModal";
import ArticleReviewModal from "./ArticleReviewModal";
import ArticleDecisionModal from "./ArticleDecisionModal";

const ArticlePage = () => {
  const { articleId } = useParams();
  const [currentState, setcurrentState] = useState(1);
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loadComments, setLoadComments] = useState(false);
  const { token } = useGlobalContext();
  const [Type, setType] = useState("null");
  const [comment_type, setCommentType] = useState("null");
  const [order, setOrder] = useState("recent");
  const [orderOption, setOrderOption] = useState("Ascending");
  const [loadingComment, setLoadingComment] = useState(false);
  const [paramCommentId, setParamCommentId] = useState(null);

  const loadArticleData = async (res) => {
    setArticle(res);
    await updateViews();
  };

  const loadCommentData = async (res) => {
    setComments(res);
  };

  const updateViews = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const res = await axios.put(`/api/article/${articleId}/updateviews/`, config);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCommentIdThread = async (commentId) => {
    let arr = [];
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const response = await axios.get(`/api/comment/${commentId}/parents/`, config);
      arr.push(response.data.success);
      loadCommentData(arr);
    } catch (error) {
      console.log(error);
    }
  };

  const getComments = async () => {
    setLoadingComment(true);
    let config = null;
    let filter = null;
    if (orderOption === "Descending") {
      filter = "most_" + order;
    } else {
      filter = "least_" + order;
    }
    if (token !== null) {
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        params: {
          article: articleId,
          order: filter,
          Type: Type === "null" ? null : Type,
          comment_type: comment_type === "null" ? null : comment_type
        }
      };
    } else {
      config = {
        params: {
          article: articleId,
          order: filter,
          Type: Type === "null" ? null : Type,
          comment_type: comment_type === "null" ? null : comment_type
        }
      };
    }
    try {
      const res = await axios.get(`/api/comment/`, config);
      await loadCommentData(res?.data?.success?.results);
    } catch (err) {
      console.log(err);
    }
    setLoadingComment(false);
  };

  const getArticle = async () => {
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
      const res = await axios.get(`/api/article/${articleId}/`, config);
      await loadArticleData(res?.data?.success);
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.detail === "Not found.") {
        ToastMaker("Article doesn't exists!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px"
          }
        });
      }
      navigate("/404");
    }
    setLoading(false);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const commentId = url.searchParams.get("commentId");
    if (commentId) {
      fetchCommentIdThread(commentId);
      setParamCommentId(commentId);
    } else {
      getComments();
    }
    getArticle();
  }, []);

  const handleProfile = (data) => {
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

  const handleFavourites = async () => {
    if (token === null) {
      navigate("/login");
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };
    if (article.isFavourite === false) {
      try {
        const res = await axios.post(`/api/article/favourite/`, { article: articleId }, config);
        const newArticle = {
          ...article,
          isFavourite: true,
          favourites: article.favourites + 1
        };
        await loadArticleData(newArticle);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const res = await axios.post(`/api/article/unfavourite/`, { article: articleId }, config);
        const newArticle = {
          ...article,
          isFavourite: false,
          favourites: article.favourites - 1
        };
        await loadArticleData(newArticle);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleShow = () => {
    if (token === null) {
      navigate("/login");
    }
    if (currentState === 1) {
      setShowReviewModal(true);
    } else {
      setShowCommentModal(true);
    }
  };

  const fillLoad = () => {
    if (comments.length === 0) {
      return `No comments to Load`;
    } else if (article.commentcount > comments.length) {
      return `Load ${article.commentcount - comments.length} more comments`;
    } else {
      return "";
    }
  };

  const loadMore = async () => {
    setLoadComments(true);
    let filter = null;
    if (orderOption === "Descending") {
      filter = "most_" + order;
    } else {
      filter = "least_" + order;
    }
    let config = null;
    if (token !== null) {
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        params: {
          article: articleId,
          order: filter,
          Type: Type === "null" ? null : Type,
          comment_type: comment_type === "null" ? null : comment_type
        }
      };
    } else {
      config = {
        params: {
          article: articleId,
          order: filter,
          Type: Type === "null" ? null : Type,
          comment_type: comment_type === "null" ? null : comment_type
        }
      };
    }
    try {
      const res = await axios.get(`/api/comment/?limit=20&offset=${comments.length}`, config);
      await loadCommentData([...comments, ...(res?.data?.success?.results ?? [])]);
    } catch (err) {
      console.log(err);
    }
    setLoadComments(false);
  };

  const handleComment = async (res) => {
    const newReply = [res, ...comments];
    setComments(newReply);
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

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  const handleCommentTypeChange = (e) => {
    setCommentType(e.target.value);
  };

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
  };

  const handleOrderOptionChange = (e) => {
    setOrderOption(e.target.value);
  };

  const handleShare = (e) => {
    e.preventDefault();
    ToastMaker("Link Copied to Clipboard", 3500, {
      valign: "top",
      styles: {
        backgroundColor: "green",
        fontSize: "20px"
      }
    });
    e.stopPropagation();
    navigator.clipboard.writeText(`https://scicommons.org/article/${article.id}`);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <Toaster />
      {(loading || article === null || comments === null) && <Loader />}
      {!loading && article && comments && (
        <div className="bg-white">
          <div className="mx-auto mt-[1rem] flex w-full justify-center overflow-hidden bg-white p-2 md:w-5/6">
            <div className=" mt-1 w-full  justify-self-center bg-white">
              <div className="py-5 ">
                <div className="flex flex-row justify-between bg-white">
                  <div className="bg-white text-lg font-[700] uppercase text-gray-600 md:text-3xl">
                    {article.article_name.replace(/_/g, " ")}
                  </div>
                  <div className="flex flex-row">
                    <div className="icon" style={{ cursor: "pointer" }} onClick={handleFavourites}>
                      {article.isFavourite === true ? (
                        <AiFillHeart className="h-[2rem] w-[2rem]" />
                      ) : (
                        <AiOutlineHeart className="h-[2rem] w-[2rem]" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-white py-1">
                  <span className="text-md font-sans italic leading-[1.5rem] md:text-lg ">
                    {article.link && (
                      <span className="font-semibold text-green-800">Added by: </span>
                    )}
                    {article.authors.map((data, i) => {
                      return (
                        <span
                          key={i}
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleProfile(data);
                          }}>
                          {data}
                          <span> </span>
                        </span>
                      );
                    })}
                  </span>
                </div>
                <div className="bg-white py-1">
                  {article.unregistered_authors.length > 0 && (
                    <>
                      <span className="text-[0.75rem] font-bold text-green-800">
                        UnRegistered Author(s) :{" "}
                      </span>
                      <span className="font-sans text-[0.75rem] italic leading-[1.5rem] ">
                        {article.unregistered_authors.map((data, i) => {
                          return (
                            <span key={i} style={{ cursor: "pointer" }}>
                              {data?.fullName}
                              <span> , </span>
                            </span>
                          );
                        })}
                      </span>
                    </>
                  )}
                </div>
                <div className="bg-white">
                  <span className="p-0 text-[.75rem]">
                    {!article.link && (
                      <>
                        <img className="mb-1 inline w-[.875rem]" src={cal} alt=""></img>
                        <span className="pl-1">Published:</span>
                        {article.published_date === null
                          ? " Not Published"
                          : findTime(article.published_date)}
                        <img
                          className="mb-1 ml-4 mr-1 inline w-[.875rem]"
                          src={folder}
                          alt=""></img>

                        {article.published === null
                          ? " Not Yet"
                          : `Accepted by ${article.published}`}
                      </>
                    )}
                    <img className="mb-1 ml-4 mr-1 inline w-[.875rem]" src={eye} alt=""></img>

                    {article.status === "public" ? "Everyone" : "Private"}
                    <AiFillHeart className="mb-1 ml-4 mr-1 inline w-[.875rem]" />
                    {formatCount(article.favourites)}
                    <MdOutlineViewSidebar className="mb-1 ml-4 mr-1 inline w-[.875rem]" />
                    {formatCount(article.views)}
                    <AiTwotoneStar className="mb-1 ml-4 mr-1 inline w-[.875rem]" />
                    {article.rating === null ? "0" : article.rating}
                  </span>
                </div>
              </div>
              <div className="mt-[-0.875rem] bg-white text-[.75rem] leading-[1.125rem]">
                {article.Abstract !== null && article.Abstract !== "" && (
                  <span className="block">
                    <strong className="text-green-700"> Abstract : </strong>
                    <span className="italic">{article.Abstract}</span>
                  </span>
                )}
                {article.license !== null && article.license !== "" && (
                  <div className="block">
                    <strong className="font-[700] text-green-700"> License : </strong>
                    <span>{article.license}</span>
                  </div>
                )}
                {article.Code !== null && article.Code !== "" && (
                  <div className="block">
                    <strong className="font-[700] text-green-700">Code : </strong>
                    <a href={article.Code} className="text-[#337ab7]">
                      {" "}
                      {article.Code}
                    </a>
                  </div>
                )}
                {article.video !== null && article.Code !== "" && (
                  <div className="block">
                    <strong className="font-[700] text-green-700"> Video Link: </strong>
                    <a href={article.video} className="text-[#337ab7]">
                      {" "}
                      {article.video}
                    </a>
                  </div>
                )}
                {article.doi !== null && article.doi !== "" && (
                  <div className="block">
                    <strong className="font-[700] text-green-700"> DOI: </strong>
                    <a href={article.doi} className="text-[#337ab7]">
                      {article.doi}
                    </a>
                  </div>
                )}
                {article.link && (
                  <div className="block">
                    <strong className="font-[700] text-green-700"> Article Link: </strong>
                    <a href={article.link} className="text-[#337ab7]">
                      {" "}
                      {article.link}
                    </a>
                  </div>
                )}
                <div className="block">
                  <strong className="font-[700] text-green-700"> Submission Date : </strong>
                  <span> {findTime(article.Public_date)} </span>
                </div>
              </div>

              <div className="flex flex-row justify-center bg-white">
                {!article.article_file.includes("None") && (
                  <button
                    className="text-md mr-4 flex items-center space-x-2 rounded-md bg-red-500 p-2 text-white shadow-lg hover:bg-red-600"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      handleFile();
                    }}>
                    <AiOutlineFilePdf className="h-5 w-5" />
                    <span className="text-md">Pdf</span>
                  </button>
                )}
                <button
                  className="text-md mr-4 flex items-center space-x-2 rounded-md bg-green-500 p-2 text-white shadow-lg hover:bg-green-600"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate(`/chat/${articleId}`);
                  }}>
                  <BsChatLeftText className="h-5 w-5" />
                  <span className="text-md">Chat</span>
                </button>
                <button
                  className="text-md flex items-center space-x-2 rounded-md bg-blue-500 p-2 text-white shadow-lg hover:bg-blue-600"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    handleShare(e);
                  }}>
                  <AiOutlineShareAlt className="h-5 w-5" />
                  <span className="text-md">Share</span>
                </button>
              </div>

              <div className="ab m-0">
                <div className="border-solid border-[#3f6978] bg-white">
                  <div className="float-right">
                    <span className="text-[0.75rem] text-gray-600">Add:</span>
                    <span
                      className="text-[0.55 rem] ml-2 box-content rounded border-solid bg-[#4d8093] p-2 pt-0 text-white md:font-bold"
                      style={{ cursor: "pointer" }}
                      onClick={handleShow}>
                      {currentState === 1 && "add review"}
                      {currentState !== 1 && "add comment"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-[1rem] flex w-full flex-col overflow-hidden bg-white p-2 md:w-5/6">
            <div className="w-full">
              <div className="mt-4 flex flex-row justify-center text-4xl font-bold text-gray-600">
                Reviews
                {/* <button className={currentState === 2 ? 'mb-2 text-sm md:text-xl text-green-600 px-2 font-bold md:px-5 py-2 border-b-2 border-green-600' : 'mb-2 text-sm font-bold md:text-xl px-2 md:px-5 text-gray-600 border-b-2 border-gray-200  py-2'} 
                            style={{ borderBottom:currentState===2  ? '2px solid #68D391' : '2px solid #000',cursor:"pointer" }} onClick={()=> onclickFuntion(2)}>
                                Blogs
                            </button>
                            <button className={currentState === 3 ? 'mb-2 text-sm md:text-xl text-green-600 px-2 font-bold md:px-5 py-2  border-b-2 border-green-600' : 'mb-2 text-sm font-bold md:text-xl px-2 md:px-5 text-gray-600 border-b-2 border-gray-200 py-2'} 
                            style={{ borderBottom:currentState===3  ? '2px solid #68D391' : '2px solid #000',cursor:"pointer" }} onClick={()=> onclickFuntion(3)}>
                                    Videos
                            </button>
                            <button className={currentState === 4 ? 'mb-2 text-sm md:text-xl text-green-600 px-2 font-bold md:px-5 py-2 border-b-2 border-green-600' : 'mb-2 text-sm font-bold md:text-xl px-2 md:px-5 text-gray-600 border-b-2 border-gray-200 py-2'} 
                            style={{ borderBottom:currentState===4  ? '2px solid #68D391' : '2px solid #000',cursor:"pointer" }} onClick={()=> onclickFuntion(4)}>
                                    Discussions
                            </button> */}
              </div>
            </div>
            <div className="min-h-screen w-full">
              <div className="mb-3 mt-3 flex w-full flex-row items-center justify-around rounded-lg bg-zinc-200 p-3 shadow-md">
                <div className="relative mr-2 inline-flex">
                  <select
                    className="md:text-md rounded-md border-2 border-green-600 bg-white px-4 py-1 text-sm text-gray-800 transition duration-150 ease-in-out focus:border-2 focus:border-green-600"
                    value={Type}
                    onChange={(e) => handleTypeChange(e)}>
                    <option value="null">All</option>
                    <option value="review">Review</option>
                    <option value="decision">Decision</option>
                  </select>
                </div>
                <div className="relative mr-2 inline-flex">
                  <select
                    className="md:text-md rounded-md border-2 border-green-600 bg-white px-4 py-1 text-sm text-gray-800 transition duration-150 ease-in-out focus:border-2 focus:border-green-600"
                    value={comment_type}
                    onChange={(e) => handleCommentTypeChange(e)}>
                    <option value="null">All</option>
                    <option value="OfficialComment">Official Comment</option>
                    <option value="PublicComment">Public Comment</option>
                  </select>
                </div>
                <div className="relative mr-2 inline-flex">
                  <select
                    className="md:text-md rounded-md border-2 border-green-600 bg-white px-4 py-1 text-sm text-gray-800 transition duration-150 ease-in-out focus:border-2 focus:border-green-600"
                    value={order}
                    onChange={(e) => handleOrderChange(e)}>
                    <option value="recent">Date</option>
                    <option value="rated">Comment Rating</option>
                    <option value="reputated">User Reputation</option>
                  </select>
                </div>
                <div className="relative mr-2 inline-flex">
                  <select
                    className="md:text-md rounded-md border-2 border-green-600 bg-white px-4 py-1 text-sm text-gray-800 transition duration-150 ease-in-out focus:border-2 focus:border-green-600"
                    value={orderOption}
                    onChange={(e) => handleOrderOptionChange(e)}>
                    <option value="Descending">Descending</option>
                    <option value="Ascending">Ascending</option>
                  </select>
                </div>
                <div className="relative mr-2 inline-flex">
                  <button
                    className="md:text-md rounded-lg bg-green-500 p-1 text-sm font-semibold text-white"
                    onClick={getComments}>
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="p-3">
                {!loadingComment &&
                  comments.length > 0 &&
                  comments.map((comment) => {
                    return (
                      <Comments
                        key={comment.id}
                        comment={comment}
                        article={article}
                        colour={1}
                        paramCommentId={paramCommentId}
                      />
                    );
                  })}
                {loadingComment && <Loader />}
                {!loadingComment && comments.length === 0 && (
                  <div className="flex w-full flex-row items-center justify-center">
                    <button
                      style={{ cursor: "pointer" }}
                      onClick={loadMore}
                      className="mt-2 p-2 text-center text-2xl font-bold text-green-500">
                      {loadComments ? "Loading..." : fillLoad()}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {showCommentModal && (
            <ArticleCommentModal
              setShowCommentModal={setShowCommentModal}
              article={article}
              handleComment={handleComment}
            />
          )}
          {showReviewModal && (
            <ArticleReviewModal
              setShowReviewModal={setShowReviewModal}
              article={article}
              handleComment={handleComment}
            />
          )}
          {showDecisionModal && article.isArticleModerator && (
            <ArticleDecisionModal
              setShowDecisionModal={setShowDecisionModal}
              article={article}
              handleComment={handleComment}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ArticlePage;
