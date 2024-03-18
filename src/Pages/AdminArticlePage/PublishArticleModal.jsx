import React, { useState } from "react";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";

const PublishArticleModal = ({ setShowPublish, article, community }) => {
    const [loading, setLoading] = useState(false);
    const { token } = useGlobalContext();
    const [doi, setDoi] = useState("");
    const [license, setLicense] = useState("");
  
    const handlePublish = async (e) => {
      e.preventDefault();
      const form_data = new FormData(e.target);
      setLoading(true);
      if (doi.length > 255 || license.length > 255) {
        ToastMaker("Doi,License must have less than 255 characters!!!", 3500, {
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
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const res = await axios.post(
          `/api/community/${community}/article/${article}/publish/`,
          form_data,
          config
        );
        if (res.status === 200) {
          ToastMaker(res.data.success, 3500, {
            valign: "top",
            styles: {
              backgroundColor: "green",
              fontSize: "20px",
            },
          });
        }
        setShowPublish(false);
      } catch (error) {
        console.log(error);
        ToastMaker("Please try again!!!", 3500, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
      }
      setLoading(false);
    };
  
    return (
      <>
        <div className="w-full h-full fixed block top-0 left-0 bg-gray-900 bg-opacity-10 z-50">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-5/6 md:w-1/2 bg-white p-5 rounded-lg flex flex-col items-center justify-center">
              <h1 className="text-md md:text-xl font-bold text-gray-600 mb-4">
                Update Publication details
              </h1>
              <form
                onSubmit={(e) => handlePublish(e)}
                encType="multipart/form-data"
              >
                <div className="w-full flex flex-col items-center justify-center">
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    className="border-2 border-gray-400 rounded-md w-full h-10 px-2 mt-3"
                    name="doi"
                    type="text"
                    value={doi}
                    onChange={(e) => {
                      setDoi(e.target.value);
                    }}
                    placeholder="Add Doi"
                  />
                  <span className="text-xs font-semibold">
                    Number of characters: {doi.length}/255
                  </span>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    className="border-2 border-gray-400 rounded-md w-full h-10 px-2 mt-3"
                    name="license"
                    on
                    type="text"
                    value={license}
                    onChange={(e) => {
                      setLicense(e.target.value);
                    }}
                    placeholder="Add License"
                  />
                  <span className="text-xs font-semibold">
                    Number of characters: {license.length}/255
                  </span>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type="file"
                    required
                    accept="application/pdf"
                    name="published_article_file"
                    className="block w-full px-5 py-2 mt-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg file:bg-gray-200 file:text-gray-700 file:text-sm file:px-4 file:py-1 file:border-none file:rounded-full  placeholder-gray-400/70  focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
                  />
                </div>
                <div className="w-full flex flex-row items-center justify-center">
                  <button
                    className="text-sm font-semibold text-white p-2 px-5 mr-5 rounded-lg bg-green-600 flex mt-3"
                    type="submit"
                    style={{ cursor: "pointer" }}
                  >
                    {loading ? "loading..." : "Publish"}
                  </button>
                  <button
                    className="text-sm font-semibold text-white p-2 px-5 rounded-lg bg-red-600 flex ml-2 mt-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setShowPublish(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  };

export default PublishArticleModal;