import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useGlobalContext } from "../../Context/StateContext";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { useNavigate } from "react-router-dom";
import axios from "../../Utils/axios";
import { FaLink } from "react-icons/fa6";
import toast from "react-hot-toast";
import ArticleCommentModal from "./ArticleCommentModal";
import ArticleCommentEditModal from "./ArticleCommentEditModal";
import Dropdown from "./Dropdown";
import { Tooltip } from "flowbite-react";

const Comments = ({ comment, article, colour, paramCommentId }) => {
  const [loading, setLoading] = useState(false);
  const [repliesData, setRepliesData] = useState([]);
  const [show, setShow] = useState(typeof comment.replies === "object");
  const [rating, setRating] = useState(
    comment.userrating ? comment.userrating : 0
  );
  const [overallrating, setOverallRating] = useState(
    comment.commentrating ? comment.commentrating : 0
  );
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [versions, setVersions] = useState([comment, ...comment.versions]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [index, setIndex] = useState(comment.versions.length);
  const { token } = useGlobalContext();
  const navigate = useNavigate();
  const [commentHighlight, setCommentHighlight] = useState(false);

  const colorClasses = {
    0: "bg-white",
    1: "bg-slate-100",
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

  const handleComment = async (res) => {
    const newReply = [...repliesData, res];
    let newVersions = [...versions];
    newVersions[index].replies += 1;
    setRepliesData(newReply);
    setVersions(newVersions);
    setShowCommentModal(false);
  };

  const handleVersion = async (res) => {
    const newVersion = [...versions, res];
    setVersions(newVersion);
    setIndex(newVersion.length - 1);
    setShowEditModal(false);
  };

  const styleLinksWithColor = (htmlContent) => {
    const coloredLinks = htmlContent.replace(
      /<a /g,
      '<a style="color: blue;" '
    );
    return coloredLinks;
  };

  const fillConfidence = () => {
    if (comment.confidence === 1) {
      return (
        <span className="text-sm italic">My review is educated guess</span>
      );
    } else if (comment.confidence === 2) {
      return (
        <span className="text-sm italic">
          I am willing to defend my evaluation but Its likely that I didnt
          understand central parts of paper
        </span>
      );
    } else if (comment.confidence === 3) {
      return (
        <span className="text-sm italic">
          I am fairly confident that review is correct
        </span>
      );
    } else if (comment.confidence === 4) {
      return (
        <span className="text-sm italic">
          I am confident but not absolutely certain that my evaluation is
          correct
        </span>
      );
    } else if (comment.confidence === 5) {
      return (
        <span className="text-sm italic">
          I am absolutely certain that evaluation is correct and familiar with
          relevant literature
        </span>
      );
    }
  };

  const loadRatingData = async (event) => {
    const rate = overallrating - rating + parseInt(event.target.value);
    setOverallRating(rate);
    setRating(event.target.value);
  };

  const handleSliderChange = async (event) => {
    if (token === null) {
      navigate("/login");
    }
    await loadRatingData(event);
    await handleLike(event);
  };

  const handleRefresh = async () => {
    setRepliesData([]);
  };
  const handleLike = async (event) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await axios.post(
        `/api/comment/like/`,
        { post: comment.id, value: event.target.value },
        config
      );
      ToastMaker("Comment Rated Successfully!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const loadData = async (res) => {
    const newReply = [...repliesData, ...res];
    setRepliesData(newReply);
  };

  const handleReply = async () => {
    setLoading(true);
    let config = null;
    if (token !== null) {
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          parent_comment: versions[index].id,
          article: article.id,
        },
      };
    } else {
      config = {
        params: {
          parent_comment: versions[index].id,
          article: article.id,
        },
      };
    }
    try {
      const res = await axios.get(
        `/api/comment/?limit=20&offset=${repliesData.length}`,
        config
      );
      await loadData(res.data.success.results);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const fillLoad = () => {
    if (repliesData.length === 0) {
      return `Load replies`;
    } else if (versions[index].replies > repliesData.length) {
      return `Load ${
        versions[index].replies - repliesData.length
      } more replies`;
    } else {
      return "";
    }
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

  const handleEditModal = () => {
    setShowEditModal(true);
  };

  useEffect(() => {
    if (paramCommentId == comment.id) {
      document
        .getElementById(paramCommentId)
        .scrollIntoView({ behavior: "smooth" });
      setCommentHighlight(true);
      setTimeout(() => {
        setCommentHighlight(false);
      }, 2000);
    }
  }, []);

  return (
    <>
      <div
        className={`mb-2 w-full  ${
          commentHighlight
            ? "shadow-[0_0px_20px_0px_rgba(0,0,0,0.2)] border-green-600 border-1 bg-green-50"
            : `shadow-lg ${colorClasses[colour]}`
        } min-w-[200px] rounded px-4 py-2 overflow-x-auto transition-all duration-300 ease-in-out`}
        data-commentid={comment.id}
        id={`comment-${comment.id}`} // This is the id of the comment
      >
        <div className="flex flex-row items-center justify-between">
          <div
            className="flex flex-row items-center"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setShow(!show);
            }}
          >
            <div className="flex flex-row items-center">
              <span className="font-bold  relative text-xl text-gray-600 leading-[1.25rem]">
                {versions[index].Title}
              </span>
              <span className=" text-[#777] font-[400] text-[0.55 rem] ml-2  p-2">
                • by {versions[index].personal ? "you" : versions[index].user}
              </span>
              <span className="text-xs text-slate-400">
                • {findTime(versions[index].Comment_date)} •
              </span>
            </div>
            {comment.Type === "review" && (
              <div className="flex ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`h-5 w-5 ${
                    (comment.rating == null ? 0 : comment.rating) >= 1
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }`}
                >
                  <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                </svg>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`h-5 w-5 ${
                    (comment.rating == null ? 0 : comment.rating) >= 2
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }`}
                >
                  <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`h-5 w-5 ${
                    (comment.rating == null ? 0 : comment.rating) >= 3
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }`}
                >
                  <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`h-5 w-5 ${
                    (comment.rating == null ? 0 : comment.rating) >= 4
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }`}
                >
                  <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`h-5 w-5 ${
                    (comment.rating == null ? 0 : comment.rating) >= 5
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }`}
                >
                  <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex space-x-2 items-center">
            <button
              onClick={async (e) => {
                e.preventDefault();
                await handleRefresh();
                setIndex(index - 1);
              }}
              style={{ cursor: "pointer" }}
              disabled={index === 0}
              className={index === 0 ? "text-gray-300" : ""}
            >
              <IoIosArrowBack className="w-6 h-6" />
            </button>
            {index + 1} / {versions.length}
            <button
              onClick={async (e) => {
                e.preventDefault();
                await handleRefresh();
                setIndex(index + 1);
              }}
              style={{ cursor: "pointer" }}
              disabled={index === versions.length - 1}
              className={index === versions.length - 1 ? "text-gray-300" : ""}
            >
              <IoIosArrowForward className="w-6 h-6" />
            </button>
            {article.isArticleModerator && (
              <Dropdown
                article={article}
                comment={comment}
                color={colorClasses[colour]}
              />
            )}
            {/* Url Link for comment */}
            <div
              className="text-blue-500 underline text-xl cursor-pointer"
              // copy to clipboard
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(
                  `${window.location.origin}/article/${article.id}/comment/${comment.id}`
                );
                ToastMaker("Link Copied!!!", 3000, {
                  valign: "top",
                  styles: {
                    backgroundColor: "green",
                    fontSize: "20px",
                  },
                });
              }}
            >
              <Tooltip content="Copy Link" position="top">
                <FaLink />
              </Tooltip>
            </div>
          </div>
        </div>
        {show && (
          <>
            <div
              className="w-full"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShow(!show);
              }}
            >
              <span className="inline-flex items-center gap-1.5 rounded text-xs p-[2px] font-medium bg-red-500 text-white">
                {comment.Type}
              </span>
              <span className="inline-flex items-center gap-1.5 ml-3 rounded text-xs p-[2px] font-medium bg-cyan-500 text-white">
                {comment.tag}
              </span>
              <span className="inline-flex items-center gap-1.5 ml-3 rounded text-xs p-[2px] font-medium bg-orange-500 text-white">
                {comment.comment_type}
              </span>
              {comment.role !== "none" && (
                <span className="inline-flex items-center gap-1.5 ml-3 rounded text-xs p-[2px] font-medium bg-purple-500 text-white">
                  {comment.role}
                </span>
              )}
            </div>
            <div className="container w-full flex flex-row mt-2">
              <div className="m-1 flex flex-row items-center z-20">
                <div className="text-xl font-semibold m-1 w-10 h-10 bg-gray-600 text-white flex flex-row justify-center items-center rounded-xl shadow-xl">
                  {formatCount(overallrating)}
                </div>
                {versions[index].personal === false && (
                  <Box sx={{ height: 100 }}>
                    <Slider
                      sx={{
                        '& input[type="range"]': {
                          WebkitAppearance: "slider-vertical",
                        },
                      }}
                      orientation="vertical"
                      defaultValue={rating}
                      aria-label="Temperature"
                      valueLabelDisplay="auto"
                      valueLabelPlacement="top"
                      step={1}
                      marks
                      min={0}
                      max={5}
                      onChange={handleSliderChange}
                    />
                  </Box>
                )}
              </div>
              <div className="border-l-2 border-gray-200 p-2 rounded-xl">
                <div className="text-sm font-semibold text-green-800">
                  Comment:
                </div>
                <ReactQuill
                  value={styleLinksWithColor(versions[index].Comment)}
                  readOnly={true}
                  modules={{ toolbar: false }}
                />
                {comment.Type === "review" && (
                  <div className="container w-full mt-1">
                    <span className="font-semibold text-sm text-green-800">
                      Confidence:
                    </span>{" "}
                    {fillConfidence()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-row justify-end items-center">
              <div className="mt-2 flex flex-row">
                {comment.personal && (
                  <span
                    className="box-content text-white bg-[#4d8093] text-md border-solid ml-2 mr-2 md:font-bold p-2 pt-0 rounded"
                    style={{ cursor: "pointer" }}
                    onClick={handleEditModal}
                  >
                    edit comment
                  </span>
                )}
                <span
                  className="box-content text-white bg-[#4d8093] text-md border-solid ml-2 md:font-bold p-2 pt-0 rounded"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (token === null) {
                      navigate("/login");
                    }
                    setShowCommentModal(true);
                  }}
                >
                  reply
                </span>
              </div>
            </div>
            <div className="mt-3 ml-1 lg:ml-5">
              {typeof comment.replies !== "object"
                ? repliesData.length > 0 &&
                  repliesData.map((reply) => (
                    <Comments
                      key={reply.id}
                      comment={reply}
                      article={article}
                      colour={colour === 1 ? 0 : 1}
                      paramCommentId={paramCommentId}
                    />
                  ))
                : comment.replies.map((reply) => (
                    <Comments
                      key={reply.id}
                      comment={reply}
                      article={article}
                      colour={colour === 1 ? 0 : 1}
                      paramCommentId={paramCommentId}
                    />
                  ))}
            </div>
            {versions[index].replies > 0 && (
              <button
                style={{ cursor: "pointer" }}
                onClick={handleReply}
                className="ml-5 text-xs mt-4"
              >
                {loading ? (
                  <span className="text-gray-600 font-bold">Loading...</span>
                ) : (
                  <span className="text-gray-600 font-bold">{fillLoad()}</span>
                )}
              </button>
            )}
          </>
        )}
        {showCommentModal && (
          <ArticleCommentModal
            setShowCommentModal={setShowCommentModal}
            article={article}
            Comment={versions[index]}
            handleComment={handleComment}
          />
        )}
        {showEditModal && (
          <ArticleCommentEditModal
            setShowEditModal={setShowEditModal}
            article={article}
            Comment={comment}
            version={versions[versions.length - 1]}
            handleVersion={handleVersion}
          />
        )}
      </div>
    </>
  );
};


export default Comments;
