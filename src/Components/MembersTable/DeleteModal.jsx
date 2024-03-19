import React from "react";
import axios from "../../Utils/axios";
import Loader from "../Loader/Loader";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";



const DeleteModal = ({
    username,
    community,
    onDelete,
    userId,
    index,
    setShowDeleteModal,
    loading,
    setLoading,
  }) => {
    const { token } = useGlobalContext();
  
    const handleDelete = async () => {
      setLoading(true);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const res = await axios.delete(
          `/api/community/${community}/remove_member/${userId}`,
          config
        );
        if (res.status === 200) {
          await onDelete(index);
          ToastMaker(res.data.success, 3500, {
            valign: "top",
            styles: {
              backgroundColor: "green",
              fontSize: "20px",
            },
          });
        }
      } catch (error) {
        console.log(error);
        ToastMaker(error.response.data.error, 3500, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
      }
      setShowDeleteModal(false);
      setLoading(false);
    };
  
    return (
      <>
        {loading && <Loader />}
        {!loading && (
          <div className="w-full h-full fixed block top-0 left-0 bg-gray-900 bg-opacity-50 z-50">
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-5/6 md:w-1/2 bg-white p-1 rounded-lg flex flex-col items-center justify-center">
                <h1 className="text-md md:text-xl font-bold text-gray-600 mb-4">
                  Are you sure you want to delete this member?
                </h1>
                <div className="w-full flex flex-row items-center justify-center">
                  <button
                    className="text-sm font-semibold text-white p-2 px-5 mr-5 rounded-lg bg-green-600 flex"
                    style={{ cursor: "pointer" }}
                    onClick={handleDelete}
                  >
                    Yes
                  </button>
                  <button
                    className="text-sm font-semibold text-white p-2 px-5 rounded-lg bg-red-600 flex ml-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setShowDeleteModal(false);
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
};
  
export default DeleteModal;