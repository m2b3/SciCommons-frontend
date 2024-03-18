import React, { useState } from "react";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";


const ArticleEditPage = ({ setArticleEdit, article, handleArticleEdit }) => {
    const [status, setStatus] = useState("public");
    const [loading, setLoading] = useState(false);
    const [Abstract, setAbstract] = useState(
      article.Abstract === null ? "" : article.Abstract
    );
    const [Code, setCode] = useState(article.Code);
    const [video, setVideo] = useState(article.video);
    const { token } = useGlobalContext();
  
    const submitForm = async (e) => {
      e.preventDefault();
      const form_data = new FormData(e.target);
  
      setLoading(true);
      try {
        const response = await axios.put(
          `/api/article/${article.id}/`,
          form_data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        await handleArticleEdit(response.data.data);
      } catch (error) {
        ToastMaker(error.response.data.error, 3500, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
        console.log(error);
        return;
      }
      setLoading(false);
    };
  
    return (
      <>
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="m-10 w-5/6 md:w-3/4 flex bg-white p-5 rounded-lg justify-center">
            <form
              onSubmit={(e) => submitForm(e)}
              className="w-full"
              encType="multipart/form-data"
            >
              <div className="mb-6 w-full">
                <label
                  htmlFor="video"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Video Link (if any)
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="url"
                  id="video"
                  name="video"
                  value={video}
                  onChange={(e) => {
                    setVideo(e.target.value);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                />
              </div>
  
              <div className="mb-6 w-full">
                <label
                  htmlFor="Code"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Code Link (if any)
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="url"
                  id="Code"
                  name="Code"
                  value={Code}
                  onChange={(e) => {
                    setCode(e.target.value);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                />
              </div>
              <div className="mb-6 w-full">
                <label
                  htmlFor="Abstract"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Abstract
                </label>
                <textarea
                  id="Abstract"
                  name="Abstract"
                  rows={4}
                  value={Abstract}
                  onChange={(e) => {
                    setAbstract(e.target.value);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                  placeholder=""
                  required
                />
              </div>
              <div className=" flex flex-row items-start space-x-5">
                <div className="max-w-xs">
                  <label
                    htmlFor="fullName"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Article Submission Type
                  </label>
                  <select
                    className="w-full p-2.5 text-gray-500 bg-gray-50 border rounded-md shadow-sm outline-none appearance-none focus:border-green-600"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                    }}
                    name="status"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
  
              <div className="mt-4">
                <button
                  type="submit"
                  className="mr-3 mb-3 text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
                <button
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                  onClick={() => setArticleEdit(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
};


export default ArticleEditPage;