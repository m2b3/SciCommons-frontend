import React, { useState, useEffect } from "react";
import axios from "../../Utils/axios";
import Loader from "../../Components/Loader/Loader";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import NotificationCard from "./NotificationCard";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingmore, setLoadingMore] = useState(false);
  const { token } = useGlobalContext();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/notification/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.success;
      setNotifications(data.results);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
    }
    fetchNotifications();
  }, []);

  const loadMore = async (res) => {
    const newNotifications = [...notifications, ...res];
    setNotifications(newNotifications);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const response = await axios.get(
        `/api/notification/?limit=20&offset=${notifications.length}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = response.data.success.results;
      if (response.data.success.count === notifications.length) {
        ToastMaker("No more notifications to load", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px"
          }
        });
      }
      await loadMore(data);
    } catch (err) {
      console.log(err);
    }
    setLoadingMore(false);
  };

  const handleMarked = async (index) => {
    const newNotifications = [...notifications];
    const notificationIndex = newNotifications.findIndex(
      (notification) => notification.id === index
    );
    if (notificationIndex !== -1) {
      newNotifications[notificationIndex].marked = true;
      setNotifications(newNotifications);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mt-4 text-center text-green-500">Notifications</h1>
      </div>
      <div className="container mx-auto mt-2 w-full md:w-1/2">
        {loading && <Loader />}
        {!loading && notifications.length === 0 && (
          <>
            <div className="flex items-center justify-center">
              <div className="w-1/3 h-1/3 block">
                <img src={process.env.PUBLIC_URL + "/nonotifications.jpg"} alt="No notifications" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4 mt-4 text-center text-green-500">
              Nothing to see here!
            </h1>
          </>
        )}
        {!loading && notifications.length > 0 && (
          <>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                handleMarked={handleMarked}
              />
            ))}
            <div className="flex flex-row justify-center">
              <button
                className="bg-green-500 text-white px-2 py-1 mt-4 rounded-lg"
                onClick={handleLoadMore}
              >
                {loadingmore ? "loading..." : "load More Notifications"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
