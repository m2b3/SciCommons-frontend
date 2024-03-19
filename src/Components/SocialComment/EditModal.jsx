import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import axios from "../../Utils/axios";
import { useGlobalContext } from "../../Context/StateContext";

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

export default EditModal;
