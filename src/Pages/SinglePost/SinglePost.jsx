import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { SlUser } from "react-icons/sl";
import {
  IoHeartOutline,
  IoHeart,
  IoBookmarkOutline,
  IoBookmark,
  IoPaperPlaneOutline,
} from "react-icons/io5";
import {
  AiOutlineSend,
  AiFillLike,
  AiOutlineLike,
  AiOutlineClose,
} from "react-icons/ai";
import axios from "../../Utils/axios";
import Loader from "../../Components/Loader/Loader";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { CSpinner } from "@coreui/react";
import { BsReplyAll } from "react-icons/bs";
import { AiOutlineEdit } from "react-icons/ai";
import { BiDotsHorizontal } from "react-icons/bi";
import Popper from "popper.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./SinglePost.css";
import Post from "../../Components/Post/Post";
import SocialComment from "../../Components/SocialComment/SocialComment";
import { useGlobalContext } from "../../Context/StateContext";
import { ColorRing } from "react-loader-spinner";

const SinglePost = () => {
  const { token, user } = useGlobalContext();
  const [liked, setLiked] = useState(false);
  const [bookmark, setBookmark] = useState(false);
  const [likes, setLikes] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [loadSubmit, setLoadSubmit] = useState(false);
  const [loadComments, setLoadComments] = useState(false);
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const { postId } = useParams();

  const loadData = async (res) => {
    setLiked(res.liked);
    setBookmark(res.isbookmarked);
    setLikes(res.likes);
    setBookmarks(res.bookmarks);
    setPost(res);
    setComments(res.comments);
  };

  const loadCommentsData = async (res) => {
    await setComments(res);
  };

  const modifyComments = async () => {
    const newPost = { ...post };
    newPost.comments_count += 1;
    setPost(newPost);
  };

  const loadMore = async () => {
    setLoadComments(true);
    let config = null;
    if (token === null) {
      config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
    } else {
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          post: postId,
        },
      };
    }
    try {
      const res = await axios.get(
        `/api/feedcomment/?limit=20&offset=${comments.length}`,
        config
      );
      await loadCommentsData([...comments, ...res.data.success.results]);
    } catch (err) {
      console.log(err);
    }
    setLoadComments(false);
  };

  const fetchPost = async () => {
    setLoading(true);
    let config = null;
    if (token === null) {
      config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
    } else {
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
    }

    try {
      const res = await axios.get(`/api/feed/${postId}/`, config);
      await loadData(res.data.success);
    } catch (err) {
      console.log(err);
      if (err.response.data.detail === "Not found.") {
        ToastMaker("Post doesn't exists!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
        navigate("/explore");
      }
    }
    setLoading(false);
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

  useEffect(() => {
    fetchPost();
  }, []);

  const handleComment = async (e) => {
    if (token === null) {
      navigate("/login");
    }
    e.preventDefault();
    setLoadSubmit(true);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await axios.post(
        `/api/feedcomment/`,
        { post: postId, comment: comment },
        config
      );
      res.data.comment.commentavatar = user.profile_pic_url;
      res.data.comment.username = user.username;
      res.data.comment.commentliked = 0;
      res.data.comment.commentlikes = 0;
      res.data.comment.personal = true;
      setComment("");
      const newComments = [res.data.comment, ...comments];
      await loadCommentsData(newComments);
      await modifyComments();
      ToastMaker("Comment added successfully!!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
      setLoadSubmit(false);
    } catch (err) {
      console.log(err);
    }
    setLoadSubmit(false);
  };

  const fillLoad = () => {
    if (comments.length === 0) {
      return `No comments to Load`;
    } else if (post.comments > comments.length) {
      return `Load ${post.comments - comments.length} more comments`;
    } else {
      return "";
    }
  };

  return (
    <>
      <div className="overflow-hidden bg-green-50 min-h-screen">
        {(loading || post === null) && <Loader />}
        {!loading && post !== null && (
          <>
            <div className="bg-white w-full md:w-1/2 mx-auto">
              <Post post={post} />
              <div className="mt-[-15px] bg-white w-full">
                <div className="flex flex-row items-center justify-between p-2">
                  {user === null || user.profile_pic_url.includes("None") ? (
                    <SlUser className="w-8 h-8 mr-2" />
                  ) : (
                    <img
                      src={user.profile_pic_url}
                      alt={user.username}
                      className="w-8 h-8 rounded-full mr-4"
                    />
                  )}
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full p-1 mr-2 active:border-2 active:border-green-50"
                    name="comment"
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                    }}
                  />
                  <button
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      handleComment(e);
                    }}
                    className="bg-green-400 rounded-lg p-2"
                  >
                    {loadSubmit ? (
                      <ColorRing
                        height="30"
                        width="30"
                        radius="4"
                        color="white"
                        ariaLabel="loading"
                      />
                    ) : (
                      <AiOutlineSend className="text-xl" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mx-auto border p-6 w-full md:w-1/2 bg-white">
              <div className="text-3xl font-semibold text-green-600">
                Comments{" "}
                {post.comments_count > 0 &&
                  `(${formatCount(post.comments_count)})`}
              </div>
              {comments.length > 0 &&
                comments.map((comment) => (
                  <SocialComment
                    comment={comment}
                    post={post}
                    setPost={setPost}
                  />
                ))}
              <button
                style={{ cursor: "pointer" }}
                onClick={loadMore}
                className="p-2 text-black-500 text-center font-bold mt-2"
              >
                {loadComments ? "Loading..." : fillLoad()}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SinglePost;
