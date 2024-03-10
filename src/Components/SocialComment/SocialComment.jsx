import React, { useState, useEffect } from "react";
import {
  AiOutlineLike,
  AiFillLike,
  AiOutlineSend,
  AiOutlineClose,
  AiOutlineEdit,
} from "react-icons/ai";
import { BsReplyAll } from "react-icons/bs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import axios from "../../Utils/axios";
import "./SocialComment.css";
import { useParams, useNavigate } from "react-router-dom";
import { SlUser } from "react-icons/sl";
import { useGlobalContext } from "../../Context/StateContext";

const ReplyModal = ({ comment, setShowReply, handleReply, addReply }) => {
  const { user, token } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const { postId } = useParams();
  const [body, setBody] = useState("");

  const handleBodyChange = async (event) => {
    setBody(event);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (body.length > 200) {
      ToastMaker("Comment should be less than 200 characters", 3000, {
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
        `/api/feedcomment/`,
        { post: postId, comment: body, parent_comment: comment.id },
        config
      );
      addReply(res.data.comment);
      ToastMaker("Replied!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
      setShowReply(false);
      await handleReply(e);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setShowReply(false);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div className="bg-white w-2/3 rounded-lg shadow-lg p-6 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col mb-2 mt-2 w-full">
            <div className="flex flex-col ">
              {user.profile_pic_url.includes("None") ? (
                <SlUser className="w-6 h-6 sticky rounded-full mr-4" />
              ) : (
                <img
                  src={user.profile_pic_url}
                  alt={user.username}
                  className="w-8 h-8 sticky rounded-full mr-4"
                />
              )}
              <ReactQuill
                theme="snow"
                className="bg-white w-full p-2 mb-4 resize-none border rounded"
                value={body}
                onChange={handleBodyChange}
              />
              <span className="text-xs font-semibold">
                Number of characters: {body.length}/200
              </span>
            </div>
            <div className="flex flex-row justify-center">
              <button
                style={{ cursor: "pointer" }}
                onClick={handleComment}
                className="bg-green-600 rounded-lg text-white p-2 mr-2"
              >
                {loading ? "Loading..." : "Reply"}
              </button>
              <button
                style={{ cursor: "pointer" }}
                onClick={handleClose}
                className="bg-red-600 rounded-lg text-white p-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const EditModal = ({ comment, setShowEdit, changeComment }) => {
  const [editedComment, setEditedComment] = useState(comment.comment);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState(comment.comment);
  const { token } = useGlobalContext();

  const handleBodyChange = (event) => {
    setBody(event);
  };

  const handleSave = (e) => {
    handleEdit(e);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (body.length > 200) {
      ToastMaker("Comment should be less than 200 characters", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    try {
      const res = await axios.put(
        `/api/feedcomment/${comment.id}/`,
        { post: comment.post, comment: body },
        config
      );

      ToastMaker("Edited!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
      await changeComment(res.data.success.comment);
      setShowEdit(false);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      <div className="bg-white w-2/3 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Comment</h2>
        <ReactQuill
          theme="snow"
          className="bg-white w-full p-2 mb-4 resize-none border rounded"
          value={body}
          onChange={handleBodyChange}
        />
        <span className="text-xs my-2 font-semibold">
          Number of characters: {body.length}/200
        </span>
        <div className="flex justify-end">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setShowEdit(false);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            style={{ cursor: "pointer" }}
            onClick={handleSave}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SocialComment = ({ comment, post, setPost }) => {
  const navigate = useNavigate();
  const { token, user } = useGlobalContext();
  const [value, setValue] = useState(comment.comment);
  const [liked, setLiked] = useState(comment.commentliked);
  const [likes, setLikes] = useState(
    comment.commentlikes === null ? 0 : comment.commentlikes
  );
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
        Authorization: `Bearer ${token}`,
      },
    };
    if (liked) {
      try {
        const res = await axios.post(
          `/api/feedcomment/unlike/`,
          { comment: comment.id },
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
          `/api/feedcomment/like/`,
          { comment: comment.id },
          config
        );
        setLiked((prevLiked) => !prevLiked);
        setLikes((prevLikes) => prevLikes + 1);
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
          "Content-Type": "application/json",
        },
        params: {
          comment: comment.id,
          post: comment.post,
        },
      };
    } else {
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          comment: comment.id,
          post: comment.post,
        },
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
    const coloredLinks = htmlContent.replace(
      /<a /g,
      '<a style="color: blue;" '
    );
    return coloredLinks;
  };

  return (
    <>
      <div
        key={comment.id}
        className="rounded-lg pl-2 mt-2 bg-white border-l-2 border-green-600"
      >
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
              <span className="text-xs text-slate-400">
                {findTime(comment.created_at)}
              </span>
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
            <button
              style={{ cursor: "pointer" }}
              onClick={handleLike}
              className="flex"
            >
              {liked ? (
                <AiFillLike className="text-md" />
              ) : (
                <AiOutlineLike className="text-md" />
              )}
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
          <EditModal
            comment={editData}
            setShowEdit={setShowEdit}
            changeComment={changeComment}
          />
        )}
        <div className="ml-1">
          {repliesData.length > 0 &&
            repliesData.map((reply) => (
              <SocialComment
                key={reply.id}
                comment={reply}
                post={post}
                setPost={post}
              />
            ))}
        </div>
        {comment.replies > 0 && (
          <button
            style={{ cursor: "pointer" }}
            onClick={handleReply}
            className="ml-5 text-xs mt-4"
          >
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
