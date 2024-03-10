import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { useParams, useNavigate } from "react-router";
import TextField from "@mui/material/TextField";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import ListItemText from "@mui/material/ListItemText";
import axios from "../../Utils/axios";
import { useGlobalContext } from "../../Context/StateContext";
import { ChatItem, MessageBox, Input, ChatList } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import Loader from "../../Components/Loader/Loader";
import { AiOutlineSend } from "react-icons/ai";
import { BiLeftArrowAlt } from "react-icons/bi";
import { ColorRing } from "react-loader-spinner";
import { BiDownArrowAlt } from "react-icons/bi";

const ChatPage = () => {
  const [Messages, setMessages] = useState(null);
  const [Message, setMessage] = useState("");
  const { id } = useParams();
  const { token, user } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [article, setArticle] = useState(null);

  const navigate = useNavigate();

  const scrollToBottom = () => {
    const chatContainer = document.querySelector(".overflow-y-scroll");
    if (chatContainer !== null) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  const getMessages = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        article: id,
      },
    };
    axios
      .get(`/api/article_chat/`, config)
      .then((response) => {
        setMessages(response.data.success.results);
      })
      .catch((error) => {
        console.log("Error fetching chat messages:", error);
      });
  };

  const loadArticleData = async (res) => {
    setArticle(res);
  };

  const getArticle = async () => {
    setLoading(true);
    let config = null;
    if (token !== null) {
      config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
    try {
      const res = await axios.get(`/api/article/${id}`, config);

      await loadArticleData(res.data.success);
    } catch (err) {
      console.log(err);
      if (err.response.data.detail === "Not found.") {
        ToastMaker("Article Talk Page doesn't exists!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
      }
      navigate("/404");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token === null) {
      navigate("/login");
    }
    setLoading(true);
    const fetchData = async () => {
      await getArticle();
      await getMessages();
      scrollToBottom();
    };
    fetchData();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token === null) {
      navigate("/login");
    }
    const fetchData = async () => {
      await getMessages();
    };

    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 20000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // const checkScrollPosition = () => {
  //     const chatContainer = document.querySelector('.overflow-y-scroll');
  //     if (chatContainer) {
  //       const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight;
  //       setShowScrollButton(!isAtBottom);
  //     }
  //   };

  // useEffect(() => {

  //     checkScrollPosition();

  //     window.addEventListener('scroll', checkScrollPosition);

  //     return () => {
  //       window.removeEventListener('scroll', checkScrollPosition);
  //     };
  //   }, []);

  const handleSubmit = async () => {
    setLoadings(true);
    if (Message.body !== "") {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `/api/article_chat/`,
        {
          article: id,
          body: Message,
        },
        config
      );
      await loadData(response.data.success);
      setMessage("");
    }
    setLoadings(false);
  };

  const fillLoader = () => {
    if (loadings) {
      return (
        <ColorRing
          height="30"
          width="30"
          radius="4"
          color="white"
          ariaLabel="loading"
        />
      );
    }
    return <AiOutlineSend size={20} />;
  };

  const loadData = async (res) => {
    const messages = [
      ...Messages,
      {
        id: res.id,
        body: Message,
        sender: user.username,
        personal: true,
        created_at: new Date().toISOString(),
        media: null,
        article: id,
      },
    ];
    setMessages(messages);
  };

  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSubmit();
    }
  };

  return (
    <>
      {(loading || Messages === null || article === null) && <Loader />}
      {!loading && Messages !== null && article !== null && (
        <div className="flex h-screen">
          <div className="flex-grow bg-gray-200 p-1 md:p-4">
            <div
              style={{ cursor: "pointer" }}
              className="flex items-center xs:text-xs sm:text-sm md:text-3xl p-3 shadow-xl z-10 bg-white text-gray-600 font-bold flex flex-row justify-start sticky top-0"
            >
              <span
                onClick={() => {
                  navigate(`/article/${article.id}`);
                }}
                style={{ cursor: "pointer" }}
              >
                <BiLeftArrowAlt size={30} />
              </span>
              <span className="ml-3 flex">
                {article.article_name.length > 30
                  ? article.article_name.slice(0, 30).replace(/_/g, " ") + "..."
                  : article.article_name.replace(/_/g, " ")}
              </span>
            </div>
            <div className="bg-green-50 rounded-lg shadow-md p-1 md:p-4 h-full overflow-y-scroll">
              {Messages.map((message) => (
                <MessageBox
                  position={message.personal ? "right" : "left"}
                  type={"text"}
                  text={message.body}
                  title={message.personal ? null : message.sender}
                  date={message.created_at}
                />
              ))}
            </div>
            {/* {showScrollButton && <button
                        className="absolute bottom-[5rem] right-[3rem] bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                        onClick={scrollToBottom}
                        >
                            <BiDownArrowAlt size={30}/>
                    </button>} */}
            <div className="flex items-center rounded-full border border-gray-600 bg-gray-50 sticky bottom-[15px] left-0  px-2 py-1 md:px-4 md:py-2">
              <Input
                placeholder="Type a message..."
                multiline={false}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                onKeyDown={handleKeyPress}
                value={Message}
                rightButtons={
                  <button
                    type="submit"
                    className="text-green-600 hover:text-green-700"
                    onClick={handleSubmit}
                  >
                    {fillLoader()}
                  </button>
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
