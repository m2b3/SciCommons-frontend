import React from "react";
import { useGlobalContext } from "../../Context/StateContext";
import { useNavigate } from "react-router-dom";
import "./AllMessagesPage.css";
import { SlUser } from "react-icons/sl";

const Suggestions = ({ suggestions }) => {
  const { user } = useGlobalContext();
  const navigate = useNavigate();

  const handleClick = (e, index) => {
    e.preventDefault();
    const channelName =
      suggestions[index].username <= user.username.toString()
        ? `chat_${suggestions[index].username}_${user.username}`
        : `chat_${user.username}_${suggestions[index].username}`;
    navigate(`/chat/${channelName}`);
  };

  return (
    <ul className="mt-2 border border-gray-300 rounded-md bg-white shadow-md">
      {suggestions.map((suggestion, index) => (
        <li key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
          <div
            onClick={(e) => {
              handleClick(e, index);
            }}
            className="flex flex-row"
          >
            {suggestion.profile_pic_url.includes("None") ? (
              <SlUser className="w-6 h-6" />
            ) : (
              <img src={suggestion.profile_pic_url} className="w-8 h-8 mr-2" alt="" />
            )}
            <span className="ml-2">{suggestion.username}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Suggestions;
