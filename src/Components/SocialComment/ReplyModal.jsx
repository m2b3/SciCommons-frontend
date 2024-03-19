import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import axios from "../../Utils/axios";
import { useParams } from "react-router-dom";
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
          fontSize: "20px"
        }
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
              <span className="text-xs font-semibold">Number of characters: {body.length}/200</span>
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

export default ReplyModal;
