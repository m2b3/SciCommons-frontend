import React, { useState, useEffect } from "react";
import { AiOutlineLike, AiFillLike, AiOutlineEdit } from "react-icons/ai";
import { BsReplyAll } from "react-icons/bs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "toastmaker/dist/toastmaker.css";
import axios from "../../Utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import { SlUser } from "react-icons/sl";
import { useGlobalContext } from "../../Context/StateContext";
import ReplyModal from "./ReplyModal";
import EditModal from "./EditModal";

const SocialComment = ({ comment, post, setPost }) => {
  const navigate = useNavigate();
  const { token, user } = useGlobalContext();
  const [value, setValue] = useState(comment.comment);
  const [liked, setLiked] = useState(comment.commentliked);
  const [likes, setLikes] = useState(comment.commentlikes === null ? 0 : comment.commentlikes);
  const [loading, setLoading] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [replyData, setReplyData] = useState(null);
  const [repliesData, setRepliesData] = useState([]);
  const [editData, setEditData] = useState(null);
  const { postId } = useParams();

  const handleProfile = (e) => {
    e.preventDefault();
    navigate(`/profile/${comment.username}`);
  };

  const loadData = async (res) => {
    const newReply = [...repliesData, ...res];
    setRepliesData(newReply);
  };

  const handleLike = async (e) => {
    if (token === null) {
      navigate("/login");
    }
    e.preventDefault();
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };
    if (liked) {
      try {
        const res = await axios.post(`/api/feedcomment/unlike/`, { comment: comment.id }, config);
        setLiked(!liked);
        setLikes(likes - 1);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const res = await axios.post(`/api/feedcomment/like/`, { comment: comment.id }, config);
        setLiked(!liked);
        setLikes(liked + 1);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    setValue(comment.comment);
    setLikes(comment.commentliked);
    setLikes(comment.commentlikes);
    setRepliesData([]);
  }, [comment.id]);

  const formatCount = (count) => {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return (count / 1000).toFixed(1) + "K";
    } else {
      return (count / 1000000).toFixed(1) + "M";
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    setLoading(true);
    let config = null;
    if (token === null) {
      config = {
        headers: {
          "Content-Type": "application/json"
        },
        params: {
          comment: comment.id,
          post: comment.post
        }
      };
    } else {
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        params: {
          comment: comment.id,
          post: comment.post
        }
      };
    }
    try {
      const res = await axios.get(
        `/api/feedcomment/?limit=20&offset=${repliesData.length}`,
        config
      );
      let temp = { ...post };
      temp.comments_count += 1;
      setPost(temp);
      await loadData(res.data.success.results);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
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

  const fillLoad = () => {
    if (repliesData.length === 0) {
      return `Load replies`;
    } else if (comment.replies > repliesData.length) {
      return `Load ${comment.replies - repliesData.length} more replies`;
    } else {
      return "";
    }
  };

  const changeComment = async (body) => {
    const newComment = { ...comment, comment: body };
    setEditData(newComment);
    setValue(body);
  };

  const addReply = async (res) => {
    res.commentavatar = user.profile_pic_url;
    res.username = user.username;
    res.commentlikes = 0;
    res.commentliked = 0;
    res.personal = true;
    const newReply = [...repliesData, res];
    setRepliesData(newReply);
  };

  const styleLinksWithColor = (htmlContent) => {
    const coloredLinks = htmlContent.replace(/<a /g, '<a style="color: blue;" ');
    return coloredLinks;
  };

  return (
    <>
      <div key={comment.id} className="rounded-lg pl-2 mt-2 bg-white border-l-2 border-green-600">
        <div className="flex mb-2">
          <div className="flex flex-row items-center">
            {comment.commentavatar.includes("None") ? (
              <SlUser className="w-6 h-6 mr-1" />
            ) : (
              <img
                src={comment.commentavatar}
                alt={comment.username}
                className="w-6 h-6 rounded-full mr-2"
              />
            )}
            <div className="flex flex-col ml-2">
              <p
                className="font-medium text-sm text-green-600"
                style={{ cursor: "pointer" }}
                onClick={handleProfile}
              >
                {comment.username}
              </p>
              <span className="text-xs text-slate-400">{findTime(comment.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="container w-full my-4">
          <ReactQuill
            value={styleLinksWithColor(value)}
            readOnly={true}
            modules={{ toolbar: false }}
          />
        </div>
        <div className="w-full ml-10 flex flex-row items-center">
          <div className="flex flex-row items-center mr-3">
            <button style={{ cursor: "pointer" }} onClick={handleLike} className="flex">
              {liked ? <AiFillLike className="text-md" /> : <AiOutlineLike className="text-md" />}
            </button>
            <span className="text-sm">{formatCount(likes)}</span>
          </div>
          {comment.personal && (
            <span
              className="text-xs ml-4"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (token === null) {
                  navigate("/login");
                }
                setShowEdit(true);
                const newComment = { ...comment, comment: value };
                setEditData(newComment);
              }}
            >
              <AiOutlineEdit className="w-5 h-5 text-zinc-500" />
            </span>
          )}
          <span
            className="text-xs ml-4"
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (token === null) {
                navigate("/login");
              }
              setShowReply(true);
              setReplyData(comment);
            }}
          >
            <BsReplyAll className="w-5 h-5 text-zinc-500" />
          </span>
        </div>
        {showReply && (
          <ReplyModal
            comment={replyData}
            setShowReply={setShowReply}
            handleReply={handleReply}
            addReply={addReply}
          />
        )}
        {showEdit && (
          <EditModal comment={editData} setShowEdit={setShowEdit} changeComment={changeComment} />
        )}
        <div className="ml-1">
          {repliesData.length > 0 &&
            repliesData.map((reply) => (
              <SocialComment key={reply.id} comment={reply} post={post} setPost={post} />
            ))}
        </div>
        {comment.replies > 0 && (
          <button style={{ cursor: "pointer" }} onClick={handleReply} className="ml-5 text-xs mt-4">
            {loading ? (
              <span className="text-green-600">Loading...</span>
            ) : (
              <span className="text-green-600 font-bold">{fillLoad()}</span>
            )}
          </button>
        )}
      </div>
    </>
  );
};

export default SocialComment;
