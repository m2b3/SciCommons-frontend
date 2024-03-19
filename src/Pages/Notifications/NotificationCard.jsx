import React, { useState } from "react";
import dayjs from "dayjs";
import axios from "../../Utils/axios";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";

const NotificationCard = ({ notification, handleMarked }) => {
  const { link, is_read } = notification;
  const formattedDate = dayjs(notification.date).format("MMMM D, YYYY HH:mm A");
  const [isread, setIsRead] = useState(is_read);
  const [loading, setLoading] = useState(false);
  const { token } = useGlobalContext();

  const handleSeen = async () => {
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const response = axios.put(
        `/api/notification/${notification.id}/`,
        { is_read: true },
        config
      );
      setIsRead(true);
      await handleMarked(notification.id);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const fillMark = () => {
    if (isread === true) {
      return "done";
    }
    return "Mark as read";
  };

  return (
    <>
      <div
        className={`${
          isread ? "bg-white" : "bg-gray-200"
        } flex flex-row items-center justify-between p-4 shadow-xl rounded-lg hover:bg-green-50`}
      >
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="font-medium text-sm md:text-md">{notification.message}</h3>
            <p className="text-gray-500 text-sm md:text-md">{formattedDate}</p>
          </div>
        </div>
        <a
          href={link}
          className="text-blue-500 hover:text-blue-700 transition-colors text-xs duration-300 mr-3"
        >
          View
        </a>
        <button
          onClick={handleSeen}
          className={`${isread ? "text-gray-800" : "text-blue-800"} text-xs`}
        >
          {loading ? "marking..." : fillMark()}
        </button>
      </div>
    </>
  );
};

export default NotificationCard;
