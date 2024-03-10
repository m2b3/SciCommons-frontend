import React from "react";
import { useState } from "react";
import {
  IoHeartOutline,
  IoHeart,
  IoChatbubbleOutline,
  IoPaperPlaneOutline,
  IoBookmarkOutline,
  IoBookmark,
  IoEllipsisHorizontal,
  IoEllipsisVertical,
} from "react-icons/io5";
import { BiDotsHorizontal } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { SlUser } from "react-icons/sl";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "../../Utils/axios";
import Popper from "popper.js";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import "./Post.css";
import { useGlobalContext } from "../../Context/StateContext";

const Post = ({ post, onDeletePost, handleEditChange }) => {
  const [liked, setLiked] = useState(post.liked);
  const [bookmark, setBookmark] = useState(post.isbookmarked);
  const [likes, setLikes] = useState(post.likes);
  const [comment, setComment] = useState("");
  const [bookmarks, setBookmarks] = useState(post.bookmarks);
  const { user, token } = useGlobalContext();
  const [loadSubmit, setLoadSubmit] = useState(false);
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
        setLiked((prevLiked) => !prevLiked);
        setLikes((prevLikes) => prevLikes - 1);
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
        setLiked((prevLiked) => !prevLiked);
        setLikes((prevLikes) => prevLikes + 1);
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
        setBookmark((prevBookmark) => !prevBookmark);
        setBookmarks((prevBookmarks) => prevBookmarks + 1);
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
    navigator.clipboard.writeText(`/post/${post.id}`);
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

const Dropdown = ({ post, onDeletePost, handleEditChange }) => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const { token } = useGlobalContext();
  const btnDropdownRef = React.createRef();
  const [showEdit, setShowEdit] = useState(false);
  const popoverDropdownRef = React.createRef();
  const openDropdownPopover = () => {
    new Popper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };
  const navigate = useNavigate();

  const EditPost = async () => {
    if (token === null) {
      navigate("/login");
    }
    setShowEdit(true);
  };

  const DeletePost = async () => {
    if (token === null) {
      navigate("/login");
    }
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await axios.delete(`/api/feed/${post.id}/`, config);
      await onDeletePost(post.id);
      ToastMaker("Post Deleted Successfully", "success");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-6/12 md:w-4/12">
          <div className="relative inline-flex align-middle w-full">
            <button
              className={
                "uppercase text-sm rounded outline-none focus:outline-none"
              }
              style={{ transition: "all .15s ease", cursor: "pointer" }}
              type="button"
              ref={btnDropdownRef}
              onClick={() => {
                dropdownPopoverShow
                  ? closeDropdownPopover()
                  : openDropdownPopover();
              }}
            >
              <BiDotsHorizontal className="w-6 h-6 text-black-800" />
            </button>
            <div
              ref={popoverDropdownRef}
              className={
                (dropdownPopoverShow ? "block" : "hidden ") +
                "text-base z-50 py-2 float-left list-none text-left rounded shadow-lg mt-1 bg-white"
              }
              style={{ minWidth: "8rem" }}
            >
              <div
                onClick={EditPost}
                style={{ cursor: "pointer" }}
                className={
                  "text-sm py-2 px-4 font-normal block w-full whitespace-no-wrap bg-white text-gray-800 hover:bg-gray-200"
                }
              >
                Edit Post
              </div>
              <div
                onClick={DeletePost}
                style={{ cursor: "pointer" }}
                className={
                  "text-sm py-2 px-4 font-normal text-red-400 block w-full whitespace-no-wrap bg-white text-gray-800 hover:bg-gray-200"
                }
              >
                Delete Post
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEdit && (
        <PostEditModal
          post={post}
          setShowEdit={setShowEdit}
          handleEditChange={handleEditChange}
        />
      )}
    </>
  );
};

const PostEditModal = ({ post, setShowEdit, handleEditChange }) => {
  const [updatedBody, setUpdatedBody] = useState(post.body);
  const [loading, setLoading] = useState(false);
  const { token } = useGlobalContext();
  const navigate = useNavigate();

  const handleBodyChange = (event) => {
    setUpdatedBody(event);
  };

  const onClose = async () => {
    setShowEdit(false);
  };

  const handleEditSubmit = async (e) => {
    if (token === null) {
      navigate("/login");
    }
    e.preventDefault();
    const form_data = new FormData(e.target);

    form_data.append("body", updatedBody);
    console.log(updatedBody, updatedBody.length);
    if (updatedBody.length > 500) {
      ToastMaker(
        "Post body is too large. Maximum allowed size is 500 characters",
        3500,
        {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        }
      );
      return;
    }
    const file = form_data.get("image");
    if (file && file.size > 10485760) {
      ToastMaker(
        "File size is too large. Maximum allowed size is 10 MB",
        3500,
        {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        }
      );
      e.target.reset();
      return;
    } else {
      console.log("File size is ok");
    }
    setLoading(true);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      if (form_data.get("image") === null) {
        form_data.delete("image");
      }
      const res = await axios.put(`/api/feed/${post.id}/`, form_data, config);
      ToastMaker("Post Edited Successfully", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
      await onClose();
      window.location.reload();
      e.target.reset();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const fillEdit = () => {
    if (loading) {
      return "submitting";
    }
    return "Edit";
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="p-4 bg-slate-100 w-5/6 md:w-2/3 h-100 rounded-md shadow-md">
          <form
            onSubmit={(e) => handleEditSubmit(e)}
            encType="multipart/form-data"
          >
            <ReactQuill
              theme="snow"
              value={updatedBody}
              onChange={handleBodyChange}
              className="w-full p-2 mb-4 bg-white resize-none border rounded"
            />
            <span className="text-sm font-semibold">
              Number of character: {updatedBody.length}
            </span>
            <div className="flex justify-between items-center mt-2">
              <input
                style={{ border: "2px solid #cbd5e0" }}
                type="file"
                accept="image/*"
                className="mb-4 rounded-xl"
                name="image"
              />
              <div className="flex flex-row">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white h-8 px-2 mr-1 rounded"
                >
                  {fillEdit()}
                </button>
                <button
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowEdit(false)}
                  className="bg-red-500 hover:bg-red-700 px-2 h-8 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Post;
