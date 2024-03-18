import React from "react";
import { useState, useNavigate } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";



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

export default PostEditModal;