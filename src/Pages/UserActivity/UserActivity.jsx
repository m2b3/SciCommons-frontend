import React, { useState, useEffect } from "react";
import NavBar from "../../Components/NavBar/NavBar";
import "./UserActivity.css";
import axios from "../../Utils/axios";
import Loader from "../../Components/Loader/Loader";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";

const UserActivity = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useGlobalContext();

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/user/myactivity/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.success;
      await loadData(data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
    }
    fetchActivity();
  }, []);

  const loadData = async (res) => {
    res.reverse();
    setActivity(res);
  };

  return (
    <div>
      <NavBar />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mt-4 text-center text-green-500">
          Your Activity
        </h1>
      </div>
      <div className="container mx-auto mt-4 w-full md:w-3/4">
        {loading && <Loader />}
        {!loading && activity.length === 0 && (
          <>
            <div className="flex items-center justify-center">
              <div className="w-1/3 h-1/3 block">
                <img
                  src={process.env.PUBLIC_URL + "/nonotifications.jpg"}
                  alt="No activity"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4 mt-4 text-center text-green-500">
              Nothing to see here!
            </h1>
          </>
        )}
        {!loading && activity.length > 0 && (
          <div className="flex flex-row justify-center mt-3">
            <ol className="relative border-l border-gray-600">
              {activity.map((action, index) => (
                <li key={index} className="mb-10 ml-4">
                  <div className="absolute w-3 h-3 bg-gray-600 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                  <p className="text-base font-normal text-sm text-gray-800 ml-3">
                    {action.action}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivity;
