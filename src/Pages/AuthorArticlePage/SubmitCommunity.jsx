import React, { useState } from "react";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";

const SubmitCommunity = ({ article, setShow }) => {
  const [community, setCommunity] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useGlobalContext();

  const verify = async (res) => {
    for (let i = 0; i < res.length; i++) {
      if (res[i].Community_name.toLowerCase() === community.toLowerCase()) {
        return res[i].id;
      }
    }
    return 0;
  };

  const handleCommunityName = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/?search=${community.toLowerCase()}`,
        config
      );
      const ans = await verify(res.data.success.results);
      if (ans) {
        return ans;
      } else {
        ToastMaker("Enter Correct Community Name", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px"
          }
        });
      }
      return false;
    } catch (err) {
      ToastMaker("Enter Correct Community Name", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px"
        }
      });
      console.log(err);
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };
    const val = await handleCommunityName();
    if (val) {
      try {
        const res = await axios.post(
          `/api/article/${article.id}/submit_article/`,
          {
            communities: [val]
          },
          config
        );
        setLoading(false);
        setShow(false);
        ToastMaker("Article Submitted to Community Successfully!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "green",
            fontSize: "20px"
          }
        });
      } catch (err) {
        setLoading(false);
        if (err.response.data.error) {
          ToastMaker(err.response.data.error, 3000, {
            valign: "top",
            styles: {
              backgroundColor: "red",
              fontSize: "20px"
            }
          });
        }
        console.log(err);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div className="flex items-center justify-center w-5/6 p-4">
          <div className="bg-gray-200 p-6 rounded-lg w-full max-h-5/6 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Submit to Community</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="community" className="block font-medium mb-1">
                  Enter Community Name:
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="text"
                  id="Community"
                  value={community}
                  name="Community"
                  onChange={(e) => setCommunity(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded mr-2 font-semibold"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                onClick={() => {
                  setShow(false);
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

export default SubmitCommunity;
