import React from "react";
import { useState } from "react";
import { BiDotsHorizontal } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import axios from "../../Utils/axios";
import Popper from "popper.js";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import PostEditModal from "./PostEditModal";

const Dropdown = ({ post, onDeletePost, handleEditChange }) => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const { token } = useGlobalContext();
  const btnDropdownRef = React.createRef();
  const [showEdit, setShowEdit] = useState(false);
  const popoverDropdownRef = React.createRef();
  const openDropdownPopover = () => {
    new Popper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start"
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
        Authorization: `Bearer ${token}`
      }
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
              className={"uppercase text-sm rounded outline-none focus:outline-none"}
              style={{ transition: "all .15s ease", cursor: "pointer" }}
              type="button"
              ref={btnDropdownRef}
              onClick={() => {
                dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
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
        <PostEditModal post={post} setShowEdit={setShowEdit} handleEditChange={handleEditChange} />
      )}
    </>
  );
};

export default Dropdown;
