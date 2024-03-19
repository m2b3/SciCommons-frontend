import React, { useState, useEffect } from "react";
import { ChatList, MessageList } from "react-chat-elements";
import axios from "../../Utils/axios";
import { useGlobalContext } from "../../Context/StateContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../../Components/NavBar/NavBar";
import { FaSearch } from "react-icons/fa";
import { ColorRing } from "react-loader-spinner";
import Suggestions from "./Suggestions";

const AllMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { token } = useGlobalContext();
  const navigate = useNavigate();

  const loadData = async (res) => {
    setMessages(res);
  };

  const loadSuggestions = async (res) => {
    setSuggestions(res);
  };

  const getMessages = async () => {
    setLoading(true);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const res = await axios.get(`/api/user/messages/`, config);

      if (res.data.success.length === 0) {
        await loadData([]);
      } else {
        await loadData(res.data.success);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleChatClick = (chat) => {
    navigate(`/chat/${chat.channel}`);
  };

  const handleGroupClick = (chat) => {
    navigate(`/group/${chat.channel}`);
  };

  const handleUserClick = (chat) => {
    navigate(`/profile/${chat.receiver}`);
  };

  useEffect(() => {
    if (token === null) {
      navigate("/login");
    }

    getMessages();

    const intervalId = setInterval(() => {
      getMessages();
    }, 60000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        };
        const response = await axios.get(
          `/api/user/`,
          { params: { search: e.target.value } },
          config
        );
        await loadSuggestions(response.data.success.results);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      {messages.length !== 0 && (
        <div className="w-full md:w-2/3 mt-4 shadow-xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-600 text-center">Messages</h1>
          <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center">
            {loading ? (
              <ColorRing height="20" width="20" radius="4" color="green" ariaLabel="loading" />
            ) : (
              <FaSearch className="text-gray-500 text-xl mr-2" />
            )}
            <input
              style={{ border: "2px solid #cbd5e0" }}
              type="text"
              placeholder="Search"
              className="bg-transparent focus:outline-none w-full border-0 rounded-full"
            />
          </div>
          <div className="all-messages-page__content">
            <div className="all-messages-page__content__chat-list">
              <ChatList
                className="chat-list"
                dataSource={messages}
                onClick={handleChatClick}
                onGroupClick={handleGroupClick}
                onUserClick={handleUserClick}
              />
            </div>
            {suggestions.length > 0 && <Suggestions suggestions={suggestions} />}
            <div className="all-messages-page__content__message-list">
              <MessageList
                className="message-list"
                lockable={true}
                toBottomHeight={"100%"}
                dataSource={messages}
              />
            </div>
          </div>
        </div>
      )}
      {messages.length === 0 && (
        <div className="bg-green-50 h-screen p-2">
          <div className=" py-4 w-full md:w-2/3 h-[90vh] overflow-hidden my-auto shadow-xl mx-auto bg-white">
            <h1 className="text-2xl font-bold text-gray-600 text-center pb-1 border-b-2">
              Messages
            </h1>
            <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center">
              {loading ? (
                <ColorRing height="20" width="20" radius="4" color="green" ariaLabel="loading" />
              ) : (
                <FaSearch className="text-gray-500 text-xl mr-2" />
              )}
              <input
                style={{ border: "2px solid #cbd5e0" }}
                type="text"
                placeholder="Search"
                onKeyDown={handleSearch}
                className="bg-transparent focus:outline-none w-full border-0 rounded-full"
              />
            </div>
            {suggestions.length > 0 && <Suggestions suggestions={suggestions} />}
            <div className="min-h-screen flex flex-row justify-center items-center">
              <h1 className="text-xl text-gray-600 text-center font-bold">No messages found!!</h1>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllMessagesPage;
