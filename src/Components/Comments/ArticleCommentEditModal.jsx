import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import axios from "../../Utils/axios";

const ArticleCommentEditModal = ({
  setShowEditModal,
  article,
  Comment,
  version,
  handleVersion
}) => {
  const [title, setTitle] = useState(version.Title);
  const [comment, setComment] = useState(version.Comment);
  const [loading, setLoading] = useState(false);
  const { token } = useGlobalContext();

  const handleCommentChange = (event) => {
    setComment(event);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (title.length > 200) {
      ToastMaker("Title is too long!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px"
        }
      });
      setLoading(false);
      return;
    }
    if (comment.length > 20000) {
      ToastMaker("Comment is too long!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px"
        }
      });
      setLoading(false);
      return;
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };
    const comment_Type =
      article.isArticleModerator || article.isArticleReviewer || article.isAuthor
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
          version: Comment.id
        },
        config
      );
      setLoading(false);
      setTitle("");
      setComment("");
      await handleVersion(res.data.comment);
      ToastMaker("Comment Posted Successfully!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px"
        }
      });
    } catch (err) {
      setLoading(false);
      try {
        ToastMaker(err.response.data.error, 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px"
          }
        });
      } catch (error) {
        ToastMaker("Comment posting failed!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px"
          }
        });
      }
      console.log(err);
    }
  };

  const fillLoad = () => {
    if (loading) {
      return "Posting...";
    }
    return "Post Comment";
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
                  onChange={handleCommentChange}
                />
                <span className="text-xs font-smibold">
                  Number of characters: {comment.length}/20000
                </span>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2 font-semibold"
              >
                {fillLoad()}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                onClick={() => {
                  setShowEditModal(false);
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

export default ArticleCommentEditModal;
