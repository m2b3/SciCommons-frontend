import React from "react";
import { useState } from "react";
import {
  IoHeartOutline,
  IoHeart,
  IoChatbubbleOutline,
  IoPaperPlaneOutline,
  IoBookmarkOutline,
  IoBookmark,
} from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { SlUser } from "react-icons/sl";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import Dropdown from "./Dropdown";

const Post = ({ post, onDeletePost, handleEditChange }) => {
  const [liked, setLiked] = useState(post.liked);
  const [bookmark, setBookmark] = useState(post.isbookmarked);
  const [likes, setLikes] = useState(post.likes);
  const [bookmarks, setBookmarks] = useState(post.bookmarks);
  const { user, token } = useGlobalContext();
  const navigate = useNavigate();

  const handleLike = async (e) => {
    if (token === null) {
      navigate("/login");
    }
    e.preventDefault();
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (liked) {
      try {
        const res = await axios.post(
          `/api/feed/unlike/`,
          { post: post.id },
          config
        );
        setLiked(!liked);
        setLikes(likes - 1);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const res = await axios.post(
          `/api/feed/like/`,
          { post: post.id },
          config
        );
        setLiked(!liked);
        setLikes(likes + 1);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleComments = (e) => {
    e.preventDefault();
    navigate(`/post/${post.id}`);
  };

  const handleBookmark = async (e) => {
    if (token === null) {
      navigate("/login");
    }
    e.preventDefault();
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (bookmark) {
      try {
        const res = await axios.post(
          `/api/feed/unbookmark/`,
          { post: post.id },
          config
        );
        setBookmark((prevBookmark) => !prevBookmark);
        setBookmarks((prevBookmarks) => prevBookmarks - 1);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const res = await axios.post(
          `/api/feed/bookmark/`,
          { post: post.id },
          config
        );
        setBookmark(!bookmark);
        setBookmarks(bookmarks + 1);
      } catch (err) {
        console.log(err);
      }
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

  const handleProfile = (e) => {
    e.preventDefault();
    navigate(`/profile/${post.username}`);
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
    navigator.clipboard.writeText(`https://scicommons.org/post/${post.id}`);
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

  const styleLinksWithColor = (htmlContent) => {
    const coloredLinks = htmlContent.replace(
      /<a /g,
      '<a style="color: blue;" '
    );
    return coloredLinks;
  };

  return (
    <>
      <div className="border p-2 my-4 shadow-lg md:shadow-xl bg-white">
        <div className="flex flex-row justify-between">
          <div className="flex items-center">
            {post.avatar.includes("None") ? (
              <SlUser className="w-6 h-6 mr-2" />
            ) : (
              <img
                src={post.avatar}
                alt={post.username}
                className="w-10 h-10 rounded-full mr-4"
              />
            )}
            <div className="flex flex-col">
              <p
                className="font-bold"
                style={{ cursor: "pointer" }}
                onClick={handleProfile}
              >
                {post.username}
              </p>
              <span className="text-sm text-slate-400">
                {findTime(post.created_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            {post.personal && (
              <div className="ml-3">
                <Dropdown
                  post={post}
                  onDeletePost={onDeletePost}
                  handleEditChange={handleEditChange}
                />
              </div>
            )}
          </div>
        </div>
        {/* Conditionally render image section */}
        <div className="container w-full my-2">
          <ReactQuill
            value={styleLinksWithColor(post.body)}
            readOnly={true}
            modules={{ toolbar: false }}
          />
        </div>
        {!post.image.includes("None") && (
          <img src={post.image} alt={post.caption} className="w-full my-4" />
        )}

        <Link to={`/post/${post.id}`}>
          <div className="w-full">
            <div className="flex flex-row justify-between">
              {/* Like Button */}
              <button
                style={{ cursor: "pointer" }}
                onClick={handleLike}
                className="flex"
              >
                {liked ? (
                  <IoHeart className="text-xl text-red-500" />
                ) : (
                  <IoHeartOutline className="text-xl" />
                )}
                <span className="text-sm md:ml-2">{formatCount(likes)}</span>
              </button>
              {/* Comment Button */}
              <button
                style={{ cursor: "pointer" }}
                onClick={handleComments}
                className="flex"
              >
                <IoChatbubbleOutline className="text-xl" />
                <span className="text-sm md:ml-2">
                  {formatCount(post.comments_count)}
                </span>
              </button>
              <button
                style={{ cursor: "pointer" }}
                onClick={handleBookmark}
                className="flex"
              >
                {bookmark ? (
                  <IoBookmark className="text-xl text-gray-800" />
                ) : (
                  <IoBookmarkOutline className="text-xl" />
                )}
                <span className="text-sm md:ml-2">
                  {formatCount(bookmarks)}
                </span>
              </button>
              <button
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  handleShare(e);
                }}
              >
                <IoPaperPlaneOutline className="text-xl" />
              </button>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};


export default Post;
