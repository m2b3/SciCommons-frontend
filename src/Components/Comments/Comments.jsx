import React, { useState } from "react";
import "./Comments.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import axios from "axios";
import {IoIosArrowBack,IoIosArrowForward} from "react-icons/io";
import { useGlobalContext} from '../../Context/StateContext';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useNavigate } from "react-router-dom";
import Popper from "popper.js";
import {BiDotsVertical} from "react-icons/bi";


const ArticleCommentModal = ({setShowCommentModal, article, Comment, handleComment }) => {

  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const {token} = useGlobalContext();

  const handleCommentChange = (event) => {
      setComment(event);
  }

  const handleSubmit = async(e) => {
      e.preventDefault();
      setLoading(true);
      if(title.length >200){
        ToastMaker("Title is too long!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
        setLoading(false);
        return;
      }
      if(comment.length >20000){
        ToastMaker("Comment is too long!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
        setLoading(false);
        return;
      }
      const config={
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          }
      };
      const comment_Type = (article.isArticleModerator || article.isArticleReviewer || article.isAuthor)?"officialcomment":"publiccomment";
      try {
          const res = await axios.post(`https://scicommons-backend-vkyc.onrender.com/api/comment/`,
          {Title: title,Comment: comment, article: article.id, Type: 'comment', comment_Type:comment_Type, tag: "public", parent_comment:Comment.id}, 
          config);
          setLoading(false);
          setTitle("");
          setComment("");
          await handleComment(res.data.comment);
          ToastMaker("Comment Posted Successfully!!!", 3000, {
              valign: "top",
              styles: {
                backgroundColor: "green",
                fontSize: "20px",
              },
            });
      } catch(err){
          setLoading(false);
              ToastMaker("Comment posting failed!!!", 3000, {
                  valign: "top",
                  styles: {
                    backgroundColor: "red",
                    fontSize: "20px",
                  },
              });
          console.log(err);
      }
  }

  const fillLoad = () => {
    if(loading){
      return "Posting...";
    }
    return "Post Comment"
  }
  return (
      <>
          <div className="fixed inset-0 flex items-center justify-center w-full z-50 bg-gray-800 bg-opacity-50">
              <div className="flex items-center justify-center w-5/6 my-2 p-4">
                  <div className="bg-slate-200 p-6 rounded-lg max-h-5/6 overflow-hidden w-full">
                  <h2 className="text-xl font-semibold mb-4">Post a Comment</h2>
                  <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                          <label htmlFor="title" className="block font-medium mb-1">
                              Title
                          </label>
                          <input
                          style={{"border": "2px solid #cbd5e0"}}
                              type="text"
                              id="Title"
                              value={title}
                              name="Title"
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full border border-gray-300 rounded p-2"
                              required
                          />
                          <span className="text-xs font-semibold">Number of characters: {title.length}/200</span>
                      </div>
                      <div className="mb-4">
                          <label htmlFor="comment" className="block font-medium mb-1">
                              Comment
                          </label>
                          <ReactQuill theme="snow" className="bg-white w-full p-2 mb-4 resize-none border rounded max-h-[40vh] overflow-y-auto" value={comment} onChange={handleCommentChange}/>
                          <span className="text-xs font-semibold">Number of characters: {comment.length}/20000</span>
                      </div>
                      <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-white rounded mr-2 font-semibold"
                      >
                          {fillLoad()}
                      </button>
                      <button
                          className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                          onClick={()=>{setShowCommentModal(false)}}
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

const ArticleCommentEditModal = ({setShowEditModal, article, Comment, version, handleVersion }) => {

  const [title, setTitle] = useState(version.Title);
  const [comment, setComment] = useState(version.Comment);
  const [loading, setLoading] = useState(false);
  const {token} = useGlobalContext();

  const handleCommentChange = (event) => {
      setComment(event);
  }

  const handleSubmit = async(e) => {
      e.preventDefault();
      setLoading(true);
      if(title.length>200){
        ToastMaker("Title is too long!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
        setLoading(false);
        return;
      }
      if(comment.length >20000){
        ToastMaker("Comment is too long!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
        setLoading(false);
        return;
      }
      const config={
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          }
      };
      const comment_Type = (article.isArticleModerator || article.isArticleReviewer || article.isAuthor)?"officialcomment":"publiccomment";
      try {
          const res = await axios.post(`https://scicommons-backend-vkyc.onrender.com/api/comment/`,
          {Title: title,Comment: comment, article: article.id, Type: 'comment', comment_Type:comment_Type, tag: "public",parent_comment:null, version:Comment.id}, 
          config);
          setLoading(false);
          setTitle("");
          setComment("");
          await handleVersion(res.data.comment);
          ToastMaker("Comment Posted Successfully!!!", 3000, {
              valign: "top",
              styles: {
                backgroundColor: "green",
                fontSize: "20px",
              },
            });
      } catch(err){
          setLoading(false);
          try{
          ToastMaker(err.response.data.error, 3000, {
            valign: "top",
            styles: {
              backgroundColor: "red",
              fontSize: "20px",
            },
          });
        } catch(error){
          ToastMaker("Comment posting failed!!!", 3000, {
            valign: "top",
            styles: {
              backgroundColor: "red",
              fontSize: "20px",
            },
          });
        }
          console.log(err);
      }
  }

  const fillLoad = () => {
    if(loading){
      return "Posting...";
    }
    return "Post Comment";
  }

  return (
      <>
          <div className="fixed inset-0 flex items-center justify-center w-full z-50 bg-gray-800 bg-opacity-50">
              <div className="flex items-center justify-center w-5/6 my-2 p-4">
                  <div className="bg-slate-200 p-6 rounded-lg max-h-5/6 overflow-hidden w-full">
                  <h2 className="text-xl font-semibold mb-4">Post a Comment</h2>
                  <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                          <label htmlFor="title" className="block font-medium mb-1">
                              Title
                          </label>
                          <input
                          style={{"border": "2px solid #cbd5e0"}}
                              type="text"
                              id="Title"
                              value={title}
                              name="Title"
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full border border-gray-300 rounded p-2"
                              required
                          />
                          <span className="text-xs font-semibold">Number of characters: {title.length}/200</span>
                      </div>
                      <div className="mb-4">
                          <label htmlFor="comment" className="block font-medium mb-1">
                              Comment
                          </label>
                          <ReactQuill theme="snow" className="bg-white w-full p-2 mb-4 resize-none border rounded max-h-[40vh] overflow-y-auto" value={comment} onChange={handleCommentChange}/>
                          <span className="text-xs font-smibold">Number of characters: {comment.length}/20000</span>
                      </div>
                      <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-white rounded mr-2 font-semibold"
                      >
                        {fillLoad()}
                      </button>
                      <button
                          className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                          onClick={()=>{setShowEditModal(false)}}
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

const Comments = ({ comment, article, colour }) => {

  const [loading, setLoading] = useState(false);
  const [repliesData, setRepliesData] = useState([]);
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(comment.userrating?comment.userrating:0);
  const [overallrating, setOverallRating] = useState(comment.commentrating?comment.commentrating:0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [versions,setVersions] = useState([comment,...comment.versions]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [index,setIndex] = useState(comment.versions.length);
  const {token} = useGlobalContext();
  const navigate = useNavigate();

  const colorClasses = {
    0: 'bg-white',
    1: 'bg-slate-100',
  };

  const findTime = (date) => {
    const time = new Date(date);
    const now = new Date();
    const diff = now - time;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    if (years > 0) {
      return `${years} years ago`;
    } else if (months > 0) {
      return `${months} months ago`;
    } else if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else if (seconds > 0) {
      return `${seconds} seconds ago`;
    } else {
      return `Just now`;
    }
  };

  const handleComment = async(res) => {
    const newReply = [...repliesData,res];
    let newVersions = [...versions];
    newVersions[index].replies+=1;
    setRepliesData(newReply);
    setVersions(newVersions);
    setShowCommentModal(false)
  }

  const handleVersion = async(res) => {
    const newVersion = [...versions,res];
    setVersions(newVersion);
    setIndex(newVersion.length-1);
    setShowEditModal(false);
  }

  const styleLinksWithColor = (htmlContent) => {
    const coloredLinks = htmlContent.replace(/<a /g, '<a style="color: blue;" ');
    return coloredLinks;
  };


  const fillConfidence = () => {
    if(comment.confidence === 1){
      return (<span className="text-sm italic">My review is educated guess</span>)
    }
    else if(comment.confidence===2){
      return (<span className="text-sm italic">I am willing to defend my evaluation but Its likely that I didnt understand central parts of paper</span>)
    }
    else if(comment.confidence===3){
      return (<span className="text-sm italic">I am fairly confident that review is correct</span>)
    }
    else if(comment.confidence===4){
      return (<span className="text-sm italic">I am confident but not absolutely certain that my evaluation is correct</span>)
    }
    else if(comment.confidence===5){
      return (<span className="text-sm italic">I am absolutely certain that evaluation is correct and familiar with relevant literature</span>)
    }
  }

  const loadRatingData = async(event) => {
    const rate = overallrating-rating+parseInt(event.target.value);
    setOverallRating(rate);
    setRating(event.target.value);
  }

  const handleSliderChange = async(event) => {
    if(token === null) {
      navigate("/login");
    }
    await loadRatingData(event);
    await handleLike(event);
  };

  const handleRefresh = async() => {
    setRepliesData([]);
  }
  const handleLike = async(event) => {
    const config={
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
      }
    };
    try {
      const res = await axios.post(`https://scicommons-backend-vkyc.onrender.com/api/comment/like/`,
      {post:comment.id, value:event.target.value}, 
      config);
      ToastMaker("Comment Rated Successfully!!!", 3000, {
          valign: "top",
          styles: {
            backgroundColor: "green",
            fontSize: "20px",
          },
      });
    } catch(err){
      console.log(err);
    }
  }

  const loadData = async (res) => {
    const newReply = [...repliesData, ...res];
    setRepliesData(newReply);
  };

  const handleReply = async () => {
    setLoading(true);
    let config=null;
    if(token !== null){
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          parent_comment: versions[index].id,
          article: article.id,
        },
      };
    } else {
      config = {
        params: {
          parent_comment: versions[index].id,
          article: article.id,
        },
      };
    }
    try {
      const res = await axios.get(
        `https://scicommons-backend-vkyc.onrender.com/api/comment/?limit=20&offset=${repliesData.length}`,
        config
      );
      await loadData(res.data.success.results);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const fillLoad = () => {
    if (repliesData.length === 0) {
      return `Load replies`;
    } else if (versions[index].replies > repliesData.length) {
      return `Load ${versions[index].replies - repliesData.length} more replies`;
    } else {
      return "";
    }
  };

  const formatCount = (count) => {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return (count / 1000).toFixed(1) + "K";
    } else {
      return (count / 1000000).toFixed(1) + "M";
    }
  };

  const handleEditModal = () => {
    setShowEditModal(true);
  }

  return (
    <>
      <div className={`mb-2 w-full ${colorClasses[colour]} shadow-lg min-w-[200px] rounded px-4 py-2 overflow-x-auto`} data-commentid={comment.id}>
          <div className="flex flex-row items-center justify-between" >
            <div className="flex flex-row items-center"  style={{cursor:"pointer"}} onClick={()=>{setShow(!show)}}>
              <div className="flex flex-row items-center">
                <span className='font-bold  relative text-xl text-gray-600 leading-[1.25rem]'>
                  {versions[index].Title}
                </span>
                <span className=" text-[#777] font-[400] text-[0.55 rem] ml-2  p-2">
                    • by {versions[index].personal?"you":versions[index].user}
                </span>
                <span className="text-xs text-slate-400">
                  • {findTime(versions[index].Comment_date)} •
                </span>
              </div>
              {comment.Type==="review" && 
                <div className="flex ml-2">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (comment.rating == null ? 0 : comment.rating) >= 1
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>

                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (comment.rating == null ? 0 : comment.rating) >= 2
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (comment.rating == null ? 0 : comment.rating) >= 3
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (comment.rating == null ? 0 : comment.rating) >= 4
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (comment.rating == null ? 0 : comment.rating) >= 5
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>
                    </div>
                  }
                </div>
                <div className="flex">
                    <button onClick={async(e)=>{e.preventDefault();await handleRefresh();setIndex(index-1)}} style={{cursor:"pointer"}} disabled={index===0} className={index===0?"text-gray-300":""}><IoIosArrowBack className="w-6 h-6"/></button>
                    {index+1} / {versions.length}
                    <button onClick={async(e)=>{e.preventDefault();await handleRefresh();setIndex(index+1)}} style={{cursor:"pointer"}} disabled={index===versions.length-1} className={index===versions.length-1?"text-gray-300":""}><IoIosArrowForward className="w-6 h-6"/></button>
                    {article.isArticleModerator && <Dropdown article={article} comment={comment} color={colorClasses[colour]} />}
                </div>
                
          </div>
          {show && (
          <>
            <div className="w-full" style={{cursor:"pointer"}} onClick={()=>{setShow(!show)}}>
                <span className="inline-flex items-center gap-1.5 rounded text-xs p-[2px] font-medium bg-red-500 text-white">{comment.Type}</span>
                <span className="inline-flex items-center gap-1.5 ml-3 rounded text-xs p-[2px] font-medium bg-cyan-500 text-white">{comment.tag}</span>
                <span className="inline-flex items-center gap-1.5 ml-3 rounded text-xs p-[2px] font-medium bg-orange-500 text-white">{comment.comment_type}</span>
                {comment.role!=="none" &&<span className="inline-flex items-center gap-1.5 ml-3 rounded text-xs p-[2px] font-medium bg-purple-500 text-white">{comment.role}</span>}
            </div>
            <div className="container w-full flex flex-row mt-2">
              <div className="m-1 flex flex-row items-center z-20">
              <div className="text-xl font-semibold m-1 w-10 h-10 bg-gray-600 text-white flex flex-row justify-center items-center rounded-xl shadow-xl">{formatCount(overallrating)}</div>
                {versions[index].personal === false && (
                  <Box sx={{ height: 100 }}>
                    <Slider
                      sx={{
                        '& input[type="range"]': {
                          WebkitAppearance: 'slider-vertical',
                        },
                      }}
                      orientation="vertical"
                      defaultValue={rating}
                      aria-label="Temperature"
                      valueLabelDisplay="auto"
                      valueLabelPlacement="top"
                      step={1}
                      marks
                      min={0}
                      max={5}
                      onChange={handleSliderChange}
                    />
                  </Box>
                )}
              </div>
              <div className="border-l-2 border-gray-200 p-2 rounded-xl">
                <div className="text-sm font-semibold text-green-800">
                  Comment:
                </div>
                <ReactQuill
                  value={styleLinksWithColor(versions[index].Comment)}
                  readOnly={true}
                  modules={{toolbar: false}}
                />
                {comment.Type==="review" && <div className="container w-full mt-1">
                <span className="font-semibold text-sm text-green-800">Confidence:</span> {fillConfidence()}
              </div>}
              </div>
            </div>
              <div className="flex flex-row justify-end items-center">
                <div className="mt-2 flex flex-row">
                  {comment.personal && <span className="box-content text-white bg-[#4d8093] text-md border-solid ml-2 mr-2 md:font-bold p-2 pt-0 rounded" style={{cursor:"pointer"}} onClick={handleEditModal}>
                    edit comment
                  </span>}
                  <span className="box-content text-white bg-[#4d8093] text-md border-solid ml-2 md:font-bold p-2 pt-0 rounded" style={{cursor:"pointer"}} onClick={()=>{if(token===null){navigate("/login")}setShowCommentModal(true);}}>
                    reply
                  </span>
                </div>
              </div>
            <div className="mt-3 ml-1 lg:ml-5">
            {repliesData.length > 0 &&
            repliesData.map((reply) => <Comments key={reply.id} comment={reply} article={article} colour={colour===1?0:1}/>)}
            </div>
            {versions[index].replies > 0 && (
              <button style={{cursor:"pointer"}} onClick={handleReply} className="ml-5 text-xs mt-4">
                {loading ? (
                  <span className="text-gray-600 font-bold">Loading...</span>
                ) : (
                  <span className="text-gray-600 font-bold">{fillLoad()}</span>
                )}
              </button>
            )}

          </>)
          }
          {showCommentModal && <ArticleCommentModal setShowCommentModal={setShowCommentModal} article={article} Comment={versions[index]} handleComment={handleComment}/>}
          {showEditModal && <ArticleCommentEditModal setShowEditModal={setShowEditModal} article={article} Comment={comment} version={versions[versions.length-1]} handleVersion={handleVersion}/>}
      </div>
    </>
  );
};

const Dropdown = ({ article,comment,color}) => {
  

  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();
  const openDropdownPopover = () => {
    new Popper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start"
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const {token} = useGlobalContext();
  const [block, setBlock] = useState(comment.blocked);

  const handleBlock = async(e) => {
      e.preventDefault();
      const config = {
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          }
      };
      try{
      const response = await axios.post(`https://scicommons-backend-vkyc.onrender.com/api/comment/${comment.id}/block_user/`,config);
      setBlock(!block);
      } catch(error){
        console.log(error);
      }
  }

  const handleDelete = async(e) => {
    e.preventDefault();
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    };
    try{
    const response = await axios.delete(`https://scicommons-backend-vkyc.onrender.com/api/comment/${comment.id}/`,config);
    window.location.reload();
    } catch(error){
      console.log(error);
    }
  }

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-6/12 md:w-4/12 px-4">
          <div className="relative inline-flex align-middle w-full">
            <button
              className={
                `text-white font-bold uppercase text-sm rounded outline-none focus:outline-none ${color}`
              }
              style={{ transition: "all .15s ease", cursor:"pointer" }}
              type="button"
              ref={btnDropdownRef}
              onClick={() => {
                dropdownPopoverShow
                  ? closeDropdownPopover()
                  : openDropdownPopover();
              }}
            >
                  <BiDotsVertical className="w-6 h-6 text-black"/>
            </button>
            <div
              ref={popoverDropdownRef}
              className={
                (dropdownPopoverShow ? "block " : "hidden ") +
                "text-base z-50 float-right py-2 list-none text-left rounded shadow-lg mt-1 bg-white"
              }
              style={{ minWidth: "8rem" }}
            >
              <button
                className={
                  "text-sm py-2 px-4 w-full font-normal flex bg-white text-gray-800 hover:bg-gray-200"
                }
                style={{cursor:"pointer"}}
                onClick={(e)=>{handleBlock(e)}}
              >
               {block ? "UnBlock User": "Block User"}
              </button>
              <button
                className={
                  "text-sm py-2 px-4 w-full font-normal flex bg-white text-red-500 hover:bg-gray-200 "
                }
                style={{cursor:"pointer"}}
                onClick={(e)=>{handleDelete(e)}}
              >
               Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Comments;
