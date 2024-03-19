import React, { useState } from "react";
import "react-quill/dist/quill.snow.css";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import Popper from "popper.js";
import { BiDotsVertical } from "react-icons/bi";
import axios from "../../Utils/axios";



const Dropdown = ({ article, comment, color }) => {
    const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
    const btnDropdownRef = React.createRef();
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
  
    const { token } = useGlobalContext();
    const [block, setBlock] = useState(comment.blocked);
  
    const handleBlock = async (e) => {
      e.preventDefault();
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        const response = await axios.post(
          `/api/comment/${comment.id}/block_user/`,
          config
        );
        setBlock(!block);
      } catch (error) {
        console.log(error);
      }
    };
  
    const handleDelete = async (e) => {
      e.preventDefault();
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        const response = await axios.delete(
          `/api/comment/${comment.id}/`,
          config
        );
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    };
  
    return (
      <>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-6/12 md:w-4/12 px-4">
            <div className="relative inline-flex align-middle w-full">
              <button
                className={`text-white font-bold uppercase text-sm rounded outline-none focus:outline-none ${color}`}
                style={{ transition: "all .15s ease", cursor: "pointer" }}
                type="button"
                ref={btnDropdownRef}
                onClick={() => {
                  dropdownPopoverShow
                    ? closeDropdownPopover()
                    : openDropdownPopover();
                }}
              >
                <BiDotsVertical className="w-6 h-6 text-black" />
              </button>
              <div
                ref={popoverDropdownRef}
                className={
                  (dropdownPopoverShow ? "block " : "hidden ") +
                  "text-base z-50 float-right py-2 list-none text-left rounded shadow-lg mt-1 bg-white"
                }
                style={{ minWidth: "8rem" }}
              >
                <button
                  className={
                    "text-sm py-2 px-4 w-full font-normal flex bg-white text-gray-800 hover:bg-gray-200"
                  }
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    handleBlock(e);
                  }}
                >
                  {block ? "UnBlock User" : "Block User"}
                </button>
                <button
                  className={
                    "text-sm py-2 px-4 w-full font-normal flex bg-white text-red-500 hover:bg-gray-200 "
                  }
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    handleDelete(e);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
};

  
export default Dropdown;