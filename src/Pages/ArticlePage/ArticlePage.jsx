import React, { useState, useEffect, useRef } from "react";
import img from "./file.png";
import cal from "./calendar.png";
import folder from "./folder.png";
import eye from "./eye-open.png";
import dublicate from "./duplicate.png";
import bookmark from "./bookmark.png";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../Utils/axios";
import Loader from "../../Components/Loader/Loader";
import Comments from "../../Components/Comments/Comments";
import { AiFillHeart, AiTwotoneStar, AiOutlineHeart } from "react-icons/ai";
import { MdOutlineViewSidebar } from "react-icons/md";
import "./ArticlePage.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import { AiOutlineFilePdf, AiOutlineShareAlt } from "react-icons/ai";
import { BsChatLeftText } from "react-icons/bs";

const ArticleCommentModal = ({
  setShowCommentModal,
  article,
  handleComment,
}) => {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useGlobalContext();

  const handleCommentChange = (event) => {
    setComment(event);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (title.length > 200) {
      ToastMaker("Title should be less than 200 characters!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (comment.length > 20000) {
      ToastMaker("Comment should be less than 20000 characters!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const comment_Type =
      article.isArticleModerator ||
      article.isArticleReviewer ||
      article.isAuthor
        ? "officialcomment"
        : "publiccomment";
    try {
      const res = await axios.post(
        `/api/comment/`,
        {
          Title: title,
          Comment: comment,
          article: article.id,
          Type: "comment",
          comment_Type: comment_Type,
          tag: "public",
          parent_comment: null,
          version: null,
        },
        config
      );
      setLoading(false);
      setTitle("");
      setComment("");
      await handleComment(res.data.comment);
      setShowCommentModal(false);
      ToastMaker("Comment Posted Successfully!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
    } catch (err) {
      setLoading(false);
      if (err.response.data.error) {
        ToastMaker(err.response.data.error, 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
      }
      console.log(err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center w-full z-50 bg-gray-800 bg-opacity-50">
        <div className="flex items-center justify-center w-5/6 my-2 p-4">
          <div className="bg-slate-200 p-6 rounded-lg max-h-5/6 overflow-hidden w-full">
            <h2 className="text-xl font-semibold mb-4">Post a Comment</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block font-medium mb-1">
                  Title
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="text"
                  id="Title"
                  value={title}
                  name="Title"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                />
                <span className="font-semibold text-xs">
                  Number of characters: {title.length}/200
                </span>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block font-medium mb-1">
                  Comment
                </label>
                <ReactQuill
                  theme="snow"
                  className="bg-white w-full p-2 mb-4 resize-none border rounded max-h-[40vh] overflow-y-auto"
                  value={comment}
                  onChange={handleCommentChange}
                />
                <span className="text-xs font-semibold">
                  Number of characters: {comment.length}/20000
                </span>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-white rounded mr-2 font-semibold"
              >
                {loading ? "Posting..." : "Post Comment"}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                onClick={() => {
                  setShowCommentModal(false);
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const ArticleReviewModal = ({ setShowReviewModal, article, handleComment }) => {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const { token } = useGlobalContext();

  const handleBodyChange = (event) => {
    setComment(event);
  };
  const comment_Type =
    article.isArticleModerator || article.isArticleReviewer || article.isAuthor
      ? "officialcomment"
      : "publiccomment";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (title.length > 200) {
      ToastMaker("Title should be less than 200 characters!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (comment.length > 20000) {
      ToastMaker("Comment should be less than 20000 characters!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await axios.post(
        `/api/comment/`,
        {
          Title: title,
          Comment: comment,
          article: article.id,
          rating: rating,
          confidence: confidence,
          Type: "review",
          comment_Type: comment_Type,
          tag: "public",
          parent_comment: null,
          version: null,
        },
        config
      );
      setLoading(false);
      setTitle("");
      setComment("");
      setRating(0);
      await handleComment(res.data.comment);
      setShowReviewModal(false);
      ToastMaker("Review Posted Successfully!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
    } catch (err) {
      setLoading(false);
      if (err.response.data.error) {
        ToastMaker(err.response.data.error, 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
      }
      console.log(err);
    }
  };

  const handleSliderChange = (event) => {
    setRating(event.target.value);
  };

  const handleSelectChange = (event) => {
    setConfidence(event.target.value);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center w-full z-50 bg-gray-800 bg-opacity-50">
        <div className="flex items-center justify-center w-5/6 my-2 p-4">
          <div className="bg-slate-200 p-6 rounded-lg max-h-5/6 overflow-hidden w-full">
            <h2 className="text-xl font-semibold mb-4">Post a Review</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block font-medium mb-1">
                  Title
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="text"
                  id="Title"
                  value={title}
                  name="Title"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                />
                <span className="text-xs font-semibold">
                  Number of characters: {title.length}/200
                </span>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block font-medium mb-1">
                  Comment
                </label>
                <ReactQuill
                  theme="snow"
                  className="bg-white w-full p-2 mb-4 resize-none border rounded max-h-[40vh] overflow-y-auto"
                  value={comment}
                  onChange={handleBodyChange}
                />
                <span className="text-xs font-semibold">
                  Number of characters: {comment.length}/20000
                </span>
              </div>
              <div className="mb-1">
                <label htmlFor="rating" className="block font-medium mb-1">
                  Rating
                </label>
                <div className="w-64  my-1">
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={rating}
                    onChange={handleSliderChange}
                    className="slider-thumb w-full appearance-none h-2 bg-gray-300 focus:outline-none"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">0</span>
                    <span className="text-sm">{rating}</span>
                    <span className="text-sm">5</span>
                  </div>
                </div>
              </div>
              <div className="w-64 my-2">
                <label
                  htmlFor="select"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confidence
                </label>
                <select
                  id="select"
                  value={confidence}
                  onChange={handleSelectChange}
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring focus:ring-indigo-300 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="5">
                    I am absolutely certain that evaluation is correct and
                    familiar with relevant literature
                  </option>
                  <option value="4">
                    I am confident but not absolutely certain that my evaluation
                    is correct
                  </option>
                  <option value="3">
                    I am fairly confident that review is correct
                  </option>
                  <option value="2">
                    I am willing to defend my evaluation but Its likely that I
                    didnt understand central parts of paper
                  </option>
                  <option value="1">My review is educated guess</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-white rounded mr-2 font-semibold"
              >
                {loading ? "Posting..." : "Post Review"}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                onClick={() => {
                  setShowReviewModal(false);
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const ArticleDecisionModal = ({
  setShowDecisionModal,
  article,
  handleComment,
}) => {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState("");
  const { token } = useGlobalContext();

  const handleBodyChange = (event) => {
    setComment(event);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (title.length > 200) {
      ToastMaker("Title should be less than 200 characters!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (comment.length > 20000) {
      ToastMaker("Comment should be less than 20000 characters!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const comment_Type =
      article.isArticleModerator ||
      article.isArticleReviewer ||
      article.isAuthor
        ? "officialcomment"
        : "publiccomment";
    try {
      const res = await axios.post(
        `/api/comment/`,
        {
          Title: title,
          Comment: comment,
          article: article.id,
          decision: decision,
          Type: "decision",
          comment_Type: comment_Type,
          tag: "public",
          parent_comment: null,
          version: null,
        },
        config
      );
      setLoading(false);
      setTitle("");
      setComment("");
      setDecision("");
      await handleComment(res.data.comment);
      setShowDecisionModal(false);
      ToastMaker("Decision Posted Successfully!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
    } catch (err) {
      setLoading(false);
      if (err.response.data.error) {
        ToastMaker(err.response.data.error, 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
      }
      console.log(err);
    }
  };

  const handleSelectChange = (event) => {
    setDecision(event.target.value);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div className="flex items-center justify-center w-5/6 p-4">
          <div className="bg-gray-200 p-6 rounded-lg w-full max-h-5/6 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Post a Decision</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block font-medium mb-1">
                  Title
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="text"
                  id="Title"
                  value={title}
                  name="Title"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                />
                <span className="text-xs font-semibold">
                  Number of characters: {title.length}/200
                </span>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block font-medium mb-1">
                  Comment
                </label>
                <ReactQuill
                  theme="snow"
                  className="bg-white w-full p-2 mb-4 resize-none border rounded max-h-[50vh] overflow-y-auto"
                  value={comment}
                  onChange={handleBodyChange}
                />
                <span className="text-xs font-semibold">
                  Number of character: {comment.length}/20000
                </span>
              </div>
              <div className="w-64 my-2">
                <label
                  htmlFor="select"
                  className="block text-sm font-medium text-gray-700"
                >
                  Decision
                </label>
                <select
                  id="select"
                  value={decision}
                  onChange={handleSelectChange}
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring focus:ring-indigo-300 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="reject">Accept</option>
                  <option value="accept">Reject</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2 font-semibold"
              >
                {loading ? "Posting..." : "Post Decision"}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                onClick={() => {
                  setShowDecisionModal(false);
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

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
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await axios.put(
        `/api/article/${articleId}/updateviews/`,
        config
      );
    } catch (err) {
      console.log(err);
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
          Authorization: `Bearer ${token}`,
        },
        params: {
          article: articleId,
          order: filter,
          Type: Type === "null" ? null : Type,
          comment_type: comment_type === "null" ? null : comment_type,
        },
      };
    } else {
      config = {
        params: {
          article: articleId,
          order: filter,
          Type: Type === "null" ? null : Type,
          comment_type: comment_type === "null" ? null : comment_type,
        },
      };
    }
    try {
      const res = await axios.get(`/api/comment/`, config);
      await loadCommentData(res.data.success.results);
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
          Authorization: `Bearer ${token}`,
        },
      };
    }
    try {
      const res = await axios.get(`/api/article/${articleId}`, config);
      await loadArticleData(res.data.success);
    } catch (err) {
      console.log(err);
      if (err.response.data.detail === "Not found.") {
        ToastMaker("Article doesn't exists!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
      }
      navigate("/404");
    }
    setLoading(false);
  };

  useEffect(() => {
    getArticle();
    getComments();
  }, []);

  const handleProfile = (data) => {
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

  const handleFavourites = async () => {
    if (token === null) {
      navigate("/login");
    }
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
          Authorization: `Bearer ${token}`,
        },
        params: {
          article: articleId,
          order: filter,
          Type: Type === "null" ? null : Type,
          comment_type: comment_type === "null" ? null : comment_type,
        },
      };
    } else {
      config = {
        params: {
          article: articleId,
          order: filter,
          Type: Type === "null" ? null : Type,
          comment_type: comment_type === "null" ? null : comment_type,
        },
      };
    }
    try {
      const res = await axios.get(
        `/api/comment/?limit=20&offset=${comments.length}`,
        config
      );
      await loadCommentData([...comments, ...res.data.success.results]);
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
        fontSize: "20px",
      },
    });
    e.stopPropagation();
    navigator.clipboard.writeText(
      `https://scicommons.onrender.com/article/${article.id}`
    );
  };

  return (
    <div className="bg-white min-h-screen min-w-[800px]">
      {(loading || article === null || comments === null) && <Loader />}
      {!loading && article && comments && (
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
                        ></img>
                        <span className="pl-1">Published:</span>
                        {article.published_date === null
                          ? " Not Published"
                          : findTime(article.published_date)}
                        <img
                          className="w-[.875rem] inline mb-1 mr-1 ml-4"
                          src={folder}
                        ></img>

                        {article.published === null
                          ? " Not Yet"
                          : `Accepted by ${article.published}`}
                      </>
                    )}
                    <img
                      className="w-[.875rem] inline mb-1 mr-1 ml-4"
                      src={eye}
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

              <div className="ab m-0">
                <div className="bg-white border-[#3f6978] border-solid">
                  <div className="float-right">
                    <span className="text-[0.75rem] text-gray-600">Add:</span>
                    <span
                      className="box-content text-white bg-[#4d8093] text-[0.55 rem] border-solid ml-2 md:font-bold p-2 pt-0 rounded"
                      style={{ cursor: "pointer" }}
                      onClick={handleShow}
                    >
                      {currentState === 1 && "add review"}
                      {currentState !== 1 && "add comment"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full md:w-5/6 bg-white mt-[1rem] mx-auto p-2 overflow-hidden">
            <div className="w-full">
              <div className="flex flex-row justify-center mt-4 text-4xl font-bold text-gray-600">
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
            <div className="w-full min-h-screen">
              <div className="flex flex-row justify-around p-3 items-center w-full mb-3 mt-3 bg-zinc-200 rounded-lg shadow-md">
                <div className="relative inline-flex mr-2">
                  <select
                    className="bg-white text-gray-800 text-sm md:text-md border-2 rounded-md border-green-600 focus:border-2 focus:border-green-600 px-4 py-1 transition duration-150 ease-in-out"
                    value={Type}
                    onChange={(e) => handleTypeChange(e)}
                  >
                    <option value="null">All</option>
                    <option value="review">Review</option>
                    <option value="decision">Decision</option>
                  </select>
                </div>
                <div className="relative inline-flex mr-2">
                  <select
                    className="bg-white text-gray-800 text-sm md:text-md border-2 rounded-md border-green-600 focus:border-2 focus:border-green-600 px-4 py-1 transition duration-150 ease-in-out"
                    value={comment_type}
                    onChange={(e) => handleCommentTypeChange(e)}
                  >
                    <option value="null">All</option>
                    <option value="OfficialComment">Official Comment</option>
                    <option value="PublicComment">Public Comment</option>
                  </select>
                </div>
                <div className="relative inline-flex mr-2">
                  <select
                    className="bg-white text-gray-800 text-sm md:text-md border-2 rounded-md border-green-600 focus:border-2 focus:border-green-600 px-4 py-1 transition duration-150 ease-in-out"
                    value={order}
                    onChange={(e) => handleOrderChange(e)}
                  >
                    <option value="recent">Date</option>
                    <option value="rated">Comment Rating</option>
                    <option value="reputated">User Reputation</option>
                  </select>
                </div>
                <div className="relative inline-flex mr-2">
                  <select
                    className="bg-white text-gray-800 text-sm md:text-md border-2 rounded-md border-green-600 focus:border-2 focus:border-green-600 px-4 py-1 transition duration-150 ease-in-out"
                    value={orderOption}
                    onChange={(e) => handleOrderOptionChange(e)}
                  >
                    <option value="Descending">Descending</option>
                    <option value="Ascending">Ascending</option>
                  </select>
                </div>
                <div className="relative inline-flex mr-2">
                  <button
                    className="text-sm md:text-md bg-green-500 rounded-lg p-1 text-white font-semibold"
                    onClick={getComments}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="p-3">
                {!loadingComment &&
                  comments.length > 0 &&
                  comments.map((comment) => (
                    <Comments
                      key={comment.id}
                      comment={comment}
                      article={article}
                      colour={1}
                    />
                  ))}
                {loadingComment && <Loader />}
                {!loadingComment && comments.length === 0 && (
                  <div className="w-full flex flex-row justify-center items-center">
                    <button
                      style={{ cursor: "pointer" }}
                      onClick={loadMore}
                      className="p-2 text-green-500 text-2xl text-center font-bold mt-2"
                    >
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
