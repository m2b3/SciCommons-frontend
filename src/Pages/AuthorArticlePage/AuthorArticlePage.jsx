import React, { useState, useEffect } from "react";
import img from "./file.png";
import cal from "./calendar.png";
import folder from "./folder.png";
import eye from "./eye-open.png";
import dublicate from "./duplicate.png";
import Navbar from "../../Components/NavBar/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import axios from '../../utils/axios';
import Loader from "../../Components/Loader/Loader";
import { AiFillHeart, AiTwotoneStar, AiOutlineHeart } from "react-icons/ai";
import { MdOutlineViewSidebar } from "react-icons/md";
import "./AuthorArticlePage.css";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import {useGlobalContext} from '../../Context/StateContext';
import {AiOutlineFilePdf,AiOutlineShareAlt} from 'react-icons/ai';
import {BsChatLeftText} from 'react-icons/bs';

const DisplayCommunity = ({article}) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortedArticles, setSortedArticles] = useState([]);
    const [selectedOption, setSelectedOption] = useState('All');
    const {token} = useGlobalContext();

    const navigate = useNavigate();

    const loadData = async (res) => {
        setArticles(res);
        setSortedArticles(res);
    }

    const handleOptionChange = async(e) => {
        setSelectedOption(e.target.value);
        if(e.target.value!=="All")
        {
            const newArticles = articles.filter((item)=>{
                return item.status===e.target.value
            })
            await loadSortedArticles(newArticles);
        } else{
            await loadSortedArticles([...articles]);
        }
    };

    const loadSortedArticles = async (res) => {
        setSortedArticles(res);
    }

    const fetchArticles = async () => {
        setLoading(true)
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            const response = await axios.get(
                `/api/article/${article}/isapproved/`,
                config
            );
            await loadData(response.data.success);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }   
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleSearch = async(e) => {
        e.preventDefault();
        setLoading(true);
        const newArticles = [...articles].filter((article) => {
            return article.community.Community_name.toLowerCase().includes(searchTerm.toLowerCase());
        });
        await loadSortedArticles(newArticles);
        setLoading(false);
    }

    const handleNavigate = (index) => {
        navigate(`/community/${index}/${article}`)
    } 

    const handlePublish = async (e, communityName) => {
      e.preventDefault();
      setLoading(true);
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            const response = await axios.post(
                `/api/article/${article}/publish/`,
                {published: communityName, status: "published"},
                config
            );
            fetchArticles();
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    const handleReject = async (e, communityName) => {
      e.preventDefault();
      setLoading(true);
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            const response = await axios.post(
                `/api/article/${article}/publish/`,
                {published: communityName, status: "rejected by user"},
                config
            );
            fetchArticles();
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center w-full bg-white">
                <form className="w-5/6 px-4 mt-1 md:w-2/3" onSubmit={handleSearch}>
                    <div className="relative">
                        <div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                            style={{"border": "2px solid #cbd5e0"}}
                                type="text"
                                placeholder="Search using community names"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-3 pl-12 pr-4 text-green-600 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-green-600"
                            />
                        </div>
                        <button
                            type="submit"
                            onClick={handleSearch}
                            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:bg-gray-700"
                        >
                            Search
                        </button>
                    </div>
                </form>
                <div className="flex flex-row flex-wrap justify-center items-center mb-5 w-full md:w-2/3">
                    <div className="flex flex-row items-center mt-3">
                        <div className="text-sm md:text-xl font-semibold mr-2">
                            Apply Filters: 
                        </div>
                        <div className="relative inline-flex mr-2">
                            <select
                                className="bg-white text-gray-800 text-sm md:text-lg border rounded-lg px-4 py-1 transition duration-150 ease-in-out"
                                value={selectedOption}
                                onChange={handleOptionChange}
                            >
                                <option value="All">All</option>
                                <option value="submitted">Submitted</option>
                                <option value="rejected">Rejected</option>
                                <option value="in review">In Review</option>
                                <option value="accepted">Accepted</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-row w-full bg-white justify-center min-h-screen mb-5">
                { loading ? <Loader /> :  (
                <ul className="mt-2 flex flex-col w-full md:w-3/4">
                    {
                        sortedArticles.length > 0 ? (
                        sortedArticles.map((item) => (
                        <li key={item.community.id} className="p-2 bg-white m-1 rounded-md shadow-md w-full">
                                    <div className="flex flex-row justify-between items-center w-full" onClick={()=>{handleNavigate(item.community.Community_name)}} style={{cursor:"pointer"}}>
                                        <h3 className="text-xl font-medium text-green-600">
                                            {item.community.Community_name}
                                        </h3>
                                        <p className="text-gray-500 mt-2 pr-2">
                                            <span className="text-green-700">Status : </span>
                                            <span className="inline-flex items-center gap-1.5 py-1 px-1 rounded text-sm font-medium text-red-500">{item.status}</span>
                                        </p>
                                        {item.status==="accepted" &&(
                                          <div className="flex flex-row">
                                            <button onClick={(e)=>{handlePublish(e,item.community.Community_name)}} className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                                                Publish 
                                            </button>
                                            <button onClick={(e)=>{handleReject(e,item.community.Community_name)}} className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ml-2">
                                                Reject
                                            </button>
                                          </div>
                                        )}
                                    </div>
                        </li>
                        ))):(<h1 className="text-2xl font-bold text-gray-500">No Communities Found</h1>)
                    }
                </ul>) }
            </div>
        </>
    )
};

const SubmitCommunity = ({article, setShow}) => {
    const [community, setCommunity] = useState("");
    const [loading, setLoading] = useState(false);
    const [communityId,setCommunityId] = useState(0);
    const {token} = useGlobalContext();


    const verify = async(res) => {
        for(let i=0;i<res.length;i++){
            if(res[i].Community_name.toLowerCase() === community.toLowerCase()){
                return res[i].id;
            }
        }
        return 0;
    }

    const handleCommunityName = async() => {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
        try{
            const res = await axios.get(`/api/community/?search=${community.toLowerCase()}`,config);
            const ans = await verify(res.data.success.results)
            if(ans){
                return ans;
            } else {
                ToastMaker("Enter Correct Community Name", 3000, {
                    valign: "top",
                    styles: {
                      backgroundColor: "red",
                      fontSize: "20px",
                    },
                });
            }
            return false;
        } catch(err) {
            ToastMaker("Enter Correct Community Name", 3000, {
                valign: "top",
                styles: {
                  backgroundColor: "red",
                  fontSize: "20px",
                },
            });
            console.log(err);
        }
        return false;
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        const config={
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        };
        const val = await handleCommunityName();
        if(val) {
            try {
                    const res = await axios.post(`/api/article/${article.id}/submit_article/`,{
                        communities:[val],
                    },config);
                    setLoading(false);
                    setShow(false);
                    ToastMaker("Article Submitted to Community Successfully!!!", 3000, {
                        valign: "top",
                        styles: {
                        backgroundColor: "green",
                        fontSize: "20px",
                        },
                    });
            } catch(err){
                setLoading(false);
                if(err.response.data.error){
                    ToastMaker(err.response.data.error, 3000, {
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
        setLoading(false);
    }

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
                            style={{"border": "2px solid #cbd5e0"}}
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
                            {
                                loading ? "Submitting..." : "Submit"
                            }
                        </button>
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                            onClick={()=>{setShow(false)}}
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

const ArticleEditPage = ({setArticleEdit, article, handleArticleEdit}) => {

  const [status, setStatus] = useState("public");
  const [loading, setLoading] = useState(false);
  const [Abstract, setAbstract] = useState(article.Abstract===null?"":article.Abstract);
  const [Code,setCode] = useState(article.Code);
  const [video, setVideo] = useState(article.video);
  const {token} = useGlobalContext();

  const submitForm = async(e) => {
    e.preventDefault();
    const form_data = new FormData(e.target);


    setLoading(true);
    try {
      const response = await axios.put(`/api/article/${article.id}/`, form_data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await handleArticleEdit(response.data.data);
    } catch (error) {
      ToastMaker(error.response.data.error, 3500,{
        valign: 'top',
          styles : {
              backgroundColor: 'red',
              fontSize: '20px',
          }
      })
      console.log(error);
      return;
    }
    setLoading(false);
  };


  return (
    <>
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
    <div className="m-10 w-5/6 md:w-3/4 flex bg-white p-5 rounded-lg justify-center">
      <form onSubmit={(e) => submitForm(e)} className="w-full" encType="multipart/form-data">

        <div className="mb-6 w-full">
          <label
            htmlFor="video"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Video Link (if any)
          </label>
          <input
          style={{"border": "2px solid #cbd5e0"}}
            type="url"
            id="video"
            name="video"
            value={video}
            onChange={(e)=>{setVideo(e.target.value)}}
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
          style={{"border": "2px solid #cbd5e0"}}
            type="url"
            id="Code"
            name="Code"
            value={Code}
            onChange={(e)=>{setCode(e.target.value)}}
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
            onChange={(e)=>{setAbstract(e.target.value)}}
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
          {loading?"Submitting...":"Submit"}
        </button>
        <button
          className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center" onClick={()=>setArticleEdit(false)}
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


const AuthorArticlePage = () => {

  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show,setShow] = useState(false);
  const [articleEdit, setArticleEdit] = useState(false);
  const {token} = useGlobalContext();

  const loadArticleData = async (res) => {
    setArticle(res);
  };

  useEffect(() => {
    const getArticle = async () => {
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        const res = await axios.get(
          `/api/user/articles/${articleId}/`,
          config
        );
        if(res.data.success.length===0){
            navigate('/');
        }
        await loadArticleData(res.data.success[0]);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    getArticle();
  }, []);

  const handleProfile = (e,data) => {
    e.preventDefault();
    console.log(data);
    navigate(`/profile/${data}`);
  };

  const handleFile = () => {
    window.open(article.article_file);
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

  const handleArticleEdit = async(res) => {
    await loadArticleData(res)
    setArticleEdit(false);
  }

  const handleFavourites = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (article.isFavourite === false) {
      try {
        const res = await axios.post(
          `/api/article/favourite/`,
          { article: articleId },
          config
        );
        const newArticle = {
          ...article,
          isFavourite: true,
          favourites: article.favourites + 1,
        };
        await loadArticleData(newArticle);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const res = await axios.post(
          `/api/article/unfavourite/`,
          { article: articleId },
          config
        );
        const newArticle = {
          ...article,
          isFavourite: false,
          favourites: article.favourites - 1,
        };
        await loadArticleData(newArticle);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleShow = () => {
    setShow(true);
  };

  const formatCount = (count)=>{
    if (count < 1000) {
        return count.toString();
    } else if (count < 1000000) {
        return (count / 1000).toFixed(1) + 'K';
    } else {
        return (count / 1000000).toFixed(1) + 'M';
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    ToastMaker("Link Copied to Clipboard", 3500, {
      valign: 'top',
      styles : {
          backgroundColor: 'green',
          fontSize: '20px',
      }
    })
    e.stopPropagation();
    navigator.clipboard.writeText(`https://scicommons.onrender.com/article/${article.id}`);
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      {(loading|| article===null) && <Loader />}
      {!loading && article!==null && (
        <div className="bg-white">
              <div className="flex justify-center bg-white w-full md:w-5/6 mt-[1rem] mx-auto p-2 overflow-hidden">
              <div className=' mt-1 w-full  justify-self-center bg-white'>
                  <div className="py-5 ">
                      <div className="flex bg-white flex-row justify-between">

                          <div className='text-lg md:text-3xl font-[700] text-gray-600 bg-white uppercase'>
                              {article.article_name.replace(/_/g, " ")}
                          </div>
                          <div className="flex flex-row">
                              <div className="icon" style={{cursor:"pointer"}} onClick={handleFavourites}>
                                  {
                                      article.isFavourite === true ? (<AiFillHeart className='w-[2rem] h-[2rem]'/>):(<AiOutlineHeart className='w-[2rem] h-[2rem]'/>) 
                                  }
                              </div>
                          </div>
                      </div>
                      <div className="py-1 bg-white">

                          <span className="italic font-sans text-md md:text-lg leading-[1.5rem] ">
                              {article.link && (<span className="text-green-800 font-semibold">Added by: </span>)}
                              {article.authors.map((data, i) => {
                                  return (
                                      <span key={i} style={{cursor:"pointer"}} onClick={(e)=>{e.preventDefault();handleProfile(data)}}>
                                          {data } 
                                          <span>  </span>
                                          
                                      </span>
                                  );

                              })}
                          </span>
                      </div>
                      <div className="py-1 bg-white">
                        {article.unregistered_authors.length>0 && <><span className="text-[0.75rem] font-bold text-green-800">UnRegistered Author(s) : </span>
                          <span className="italic font-sans text-[0.75rem] leading-[1.5rem] ">

                              {article.unregistered_authors.map((data, i) => {
                                  return (
                                      <span key={i} style={{cursor:"pointer"}}>
                                          {data.fullName } 
                                          <span> , </span>
                                      </span>
                                  );

                              })}
                          </span></>
                          }
                      </div>
                      <div className="bg-white">
                          <span className="text-[.75rem] p-0">
                              {!article.link && (<><img className='w-[.875rem] inline mb-1' src={cal} ></img>
                              <span className="pl-1">
                                  Published:
                              </span>
                              {article.published_date===null?" Not Published":findTime(article.published_date)}
                              <img className='w-[.875rem] inline mb-1 mr-1 ml-4' src={folder} ></img>

                              {article.published===null?" Not Yet": `Accepted by ${article.published}`}</>)}
                              <img className='w-[.875rem] inline mb-1 mr-1 ml-4' src={eye} ></img>

                              {article.status==="public"?"Everyone":"Private"}
                              <AiFillHeart className='w-[.875rem] inline mb-1 mr-1 ml-4' />
                              {formatCount(article.favourites)}
                              <MdOutlineViewSidebar className="w-[.875rem] inline mb-1 mr-1 ml-4" />
                              {formatCount(article.views)}
                              <AiTwotoneStar className="w-[.875rem] inline mb-1 mr-1 ml-4" />
                              {article.rating===null? "0": article.rating}
                          </span>
                      </div>

                  </div>
                  <div className="text-[.75rem] leading-[1.125rem] mt-[-0.875rem] bg-white">
                      {article.Abstract!==null && article.Abstract!=="" && <span className="block">
                          <strong className='text-green-700'> Abstract : </strong>
                            <span className="italic">{article.Abstract}</span>
                      </span>}
                      {article.license!==null && article.license!=="" && (<div className="block">
                          <strong className='text-green-700 font-[700]'> License : </strong>
                          <span>{ article.license}</span>
                      </div>)}
                      {(article.Code!==null && article.Code!=="") && <div className="block">
                          <strong className='text-green-700 font-[700]'>Code : </strong>
                          <a href={article.Code} className='text-[#337ab7]'> {article.Code}</a>
                      </div>}
                      {(article.video!==null && article.Code!=="") && <div className="block">
                          <strong className='text-green-700 font-[700]'> Video Link: </strong>
                          <a href={article.video} className='text-[#337ab7]'> {article.video}</a>                        
                      </div>}
                      {(article.doi!==null && article.doi!=="") && <div className="block">
                          <strong className="text-green-700 font-[700]">
                              {" "}
                              DOI:{" "}
                          </strong>
                          <a href={article.doi} className="text-[#337ab7]">
                              {article.doi}
                          </a>
                      </div>}
                      {
                          article.link && (
                              <div className="block">
                                  <strong className='text-green-700 font-[700]'> Article Link: </strong>
                                  <a href={article.link} className='text-[#337ab7]'> {article.link}</a>                          
                              </div>
                          )
                      }
                      <div className="block">
                          <strong className='text-green-700 font-[700]'> Submission Date : </strong>
                          <span > {findTime(article.Public_date)} </span>                            
                      </div>

                  </div>

                  <div className="flex flex-row justify-center bg-white">
                      {!article.article_file.includes("None") && <button className="flex items-center space-x-2 p-2 bg-red-500 mr-4 text-white text-md shadow-lg rounded-md hover:bg-red-600" style={{cursor:"pointer"}} onClick={()=>{handleFile()}}>
                          <AiOutlineFilePdf className="w-5 h-5" />
                          <span className="text-md">Pdf</span>
                      </button>}
                      <button className="flex items-center space-x-2 p-2 bg-green-500 mr-4 text-white text-md shadow-lg rounded-md hover:bg-green-600" style={{cursor:"pointer"}} onClick={()=>{navigate(`/chat/${articleId}`)}}>
                          <BsChatLeftText className="w-5 h-5" />
                          <span className="text-md">Chat</span>
                      </button>
                      <button className="flex items-center space-x-2 p-2 bg-blue-500 text-white text-md shadow-lg rounded-md hover:bg-blue-600" style={{cursor:"pointer"}} onClick={(e)=>{handleShare(e)}}>
                          <AiOutlineShareAlt className="w-5 h-5" />
                          <span className="text-md">Share</span>
                      </button>
                  </div>
              </div>
            </div>
            <div className="mt-2 flex justify-end bg-white w-full md:w-5/6 mx-auto p-2 overflow-hidden">
                    <div className='bg-white border-[#3f6978] border-solid'>
                        <div className=" flex flex-row float-right">
                            <span className="block box-content text-white bg-[#4d8093] text-[0.55 rem] border-solid ml-2 md:font-bold p-2 pt-0 rounded" style={{cursor:"pointer"}} onClick={()=>{setArticleEdit(true)}}>
                              Edit Article
                            </span>
                            <span className="block box-content text-white bg-[#4d8093] text-[0.55 rem] border-solid ml-2 md:font-bold p-2 pt-0 rounded" style={{cursor:"pointer"}} onClick={handleShow}>
                              Add Community
                            </span>
                        </div>
                    </div>
              </div>
          <div className="w-full mt-3">
                <DisplayCommunity article={articleId}/>
          </div>
          {show && <SubmitCommunity article={article} setShow={setShow}/>}
          {articleEdit && <ArticleEditPage setArticleEdit={setArticleEdit} handleArticleEdit={handleArticleEdit} article={article}/>}
        </div>
      )}
    </div>
  );
};

export default AuthorArticlePage;
