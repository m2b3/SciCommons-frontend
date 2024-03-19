import React, { useRef } from "react";
import axios from "../../Utils/axios";
import Loader from "../Loader/Loader";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";

const AddModal = ({ community, setShowAddModal, loading, setLoading, onAdd }) => {
  const username = useRef(null);
  const { token } = useGlobalContext();

  const handleAdd = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const res = await axios.post(
        `/api/community/${community}/promote_member/`,
        {
          username: username.current,
          role: "member"
        },
        config
      );
      if (res.status === 200) {
        ToastMaker(res.data.success, 3500, {
          valign: "top",
          styles: {
            backgroundColor: "green",
            fontSize: "20px"
          }
        });
      }
      await onAdd();
    } catch (error) {
      console.log(error);
      ToastMaker(error.response.data.error, 3500, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px"
        }
      });
    }
    setShowAddModal(false);
    setLoading(false);
  };

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div className="w-full h-full fixed block top-0 left-0 bg-gray-900 bg-opacity-50 z-50">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-5/6 md:w-1/2 bg-white p-1 rounded-lg flex flex-col items-center justify-center">
              <h1 className="text-md md:text-xl font-bold text-gray-600 mb-4">Add Member</h1>
              <div className="w-full flex flex-col items-center justify-center">
                <div className="flex flex-col mt-4">
                  <span className="text-sm md:text-lg font-semibold text-gray-800 mr-2 mt-1">
                    UserName:{" "}
                  </span>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type="text"
                    id="username"
                    onChange={(e) => {
                      username.current = e.target.value;
                    }}
                    placeholder="enter the username"
                    className="w-full rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="w-full flex flex-row items-center justify-center mt-4">
                <button
                  className="text-sm font-semibold text-white p-2 px-5 mr-5 rounded-lg bg-green-600 flex"
                  style={{ cursor: "pointer" }}
                  onClick={handleAdd}
                >
                  Add Member
                </button>
                <button
                  className="text-sm font-semibold text-white p-2 px-5 rounded-lg bg-red-600 flex ml-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowAddModal(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddModal;
