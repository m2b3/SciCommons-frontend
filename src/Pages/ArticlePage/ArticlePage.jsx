import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../Utils/axios';
import Loader from '../../Components/Loader/Loader';
import Comments from '../../Components/Comments/Comments';
import { AiFillHeart, AiTwotoneStar, AiOutlineHeart } from 'react-icons/ai';
import { MdOutlineViewSidebar } from 'react-icons/md';
import './ArticlePage.css';
import 'react-quill/dist/quill.snow.css';
import ToastMaker from 'toastmaker';
import 'toastmaker/dist/toastmaker.css';
import { useGlobalContext } from '../../Context/StateContext';
import { AiOutlineFilePdf, AiOutlineShareAlt } from 'react-icons/ai';
import { BsChatLeftText } from 'react-icons/bs';
import ArticleCommentModal from './ArticleCommentModal';
import ArticleReviewModal from './ArticleReviewModal';
import ArticleDecisionModal from './ArticleDecisionModal';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/solid';
import { Tooltip } from 'flowbite-react';
import toast from 'react-hot-toast';

const ArticlePage = () => {
  const { articleId, commentId } = useParams();
  const [currentState, setcurrentState] = useState(1);
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loadComments, setLoadComments] = useState(false);
  const { token } = useGlobalContext();
  const [Type, setType] = useState('null');
  const [comment_type, setCommentType] = useState('null');
  const [order, setOrder] = useState('recent');
  const [orderOption, setOrderOption] = useState('Ascending');
  const [loadingComment, setLoadingComment] = useState(false);
  const [paramCommentId, setParamCommentId] = useState(null);

  const loadArticleData = async (res) => {
    setArticle(res);
    await updateViews();
  };

  const loadCommentData = async (res) => {
    setComments(res);
  };

  const updateViews = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const res = await axios.put(`/api/article/${articleId}/updateviews/`, config);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCommentIdThread = async (commentId) => {
    let arr = [];
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const response = await axios.get(`/api/comment/${commentId}/parents/`, config);
      arr.push(response.data.success);
      loadCommentData(arr);
    } catch (error) {
      console.log(error);
    }
  };

  const getComments = async () => {
    setLoadingComment(true);
    let config = null;
    let filter = null;
    if (orderOption === 'Descending') {
      filter = 'most_' + order;
    } else {
      filter = 'least_' + order;
    }
    if (token !== null) {
      config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        params: {
          article: articleId,
          order: filter,
          Type: Type === 'null' ? null : Type,
          comment_type: comment_type === 'null' ? null : comment_type
        }
      };
    } else {
      config = {
        params: {
          article: articleId,
          order: filter,
          Type: Type === 'null' ? null : Type,
          comment_type: comment_type === 'null' ? null : comment_type
        }
      };
    }
    try {
      const res = await axios.get(`/api/comment/`, config);
      await loadCommentData(res?.data?.success?.results);
    } catch (err) {
      console.log(err);
    }
    setLoadingComment(false);
  };

  const getArticle = async () => {
    setLoading(true);
    let config = null;
    if (token !== null) {
      config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    }
    try {
      const res = await axios.get(`/api/article/${articleId}/`, config);
      await loadArticleData(res?.data?.success);
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.detail === 'Not found.') {
        ToastMaker("Article doesn't exists!!!", 3000, {
          valign: 'top',
          styles: {
            backgroundColor: 'red',
            fontSize: '20px'
          }
        });
      }
      navigate('/404');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (commentId) {
      // Make the axios call asynchronous
      const checkCommentExists = async () => {
        try {
          // Await the response from the API call
          const res = await axios.get(`/api/article/${articleId}/comment/${commentId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          // If the comment exists, fetch the comment thread and set the parameter
          fetchCommentIdThread(commentId);
          setParamCommentId(commentId);
        } catch (err) {
          console.log(err);
          toast.error("Comment doesn't exist. Redirecting to the article page");
          navigate(`/article/${articleId}`);
        }
      };

      // Call the asynchronous function
      checkCommentExists();
    } else {
      getComments();
    }
    getArticle();
  }, [commentId, articleId, token, navigate]);

  const handleProfile = (data) => {
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

  const handleFavourites = async () => {
    if (token === null) {
      navigate('/login');
    }
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    if (article.isFavourite === false) {
      try {
        const res = await axios.post(`/api/article/favourite/`, { article: articleId }, config);
        const newArticle = {
          ...article,
          isFavourite: true,
          favourites: article.favourites + 1
        };
        await loadArticleData(newArticle);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const res = await axios.post(`/api/article/unfavourite/`, { article: articleId }, config);
        const newArticle = {
          ...article,
          isFavourite: false,
          favourites: article.favourites - 1
        };
        await loadArticleData(newArticle);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleShow = () => {
    if (token === null) {
      navigate('/login');
    }
    if (currentState === 1) {
      setShowReviewModal(true);
    } else {
      setShowCommentModal(true);
    }
  };

  const fillLoad = () => {
    if (comments.length === 0) {
      return `No comments to Load`;
    } else if (article.commentcount > comments.length) {
      return `Load ${article.commentcount - comments.length} more comments`;
    } else {
      return '';
    }
  };

  const loadMore = async () => {
    setLoadComments(true);
    let filter = null;
    if (orderOption === 'Descending') {
      filter = 'most_' + order;
    } else {
      filter = 'least_' + order;
    }
    let config = null;
    if (token !== null) {
      config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        params: {
          article: articleId,
          order: filter,
          Type: Type === 'null' ? null : Type,
          comment_type: comment_type === 'null' ? null : comment_type
        }
      };
    } else {
      config = {
        params: {
          article: articleId,
          order: filter,
          Type: Type === 'null' ? null : Type,
          comment_type: comment_type === 'null' ? null : comment_type
        }
      };
    }
    try {
      const res = await axios.get(`/api/comment/?limit=20&offset=${comments.length}`, config);
      await loadCommentData([...comments, ...(res?.data?.success?.results ?? [])]);
    } catch (err) {
      console.log(err);
    }
    setLoadComments(false);
  };

  const handleComment = async (res) => {
    const newReply = [res, ...comments];
    setComments(newReply);
  };

  const formatCount = (count) => {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return (count / 1000).toFixed(1) + 'K';
    } else {
      return (count / 1000000).toFixed(1) + 'M';
    }
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  const handleCommentTypeChange = (e) => {
    setCommentType(e.target.value);
  };

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
  };

  const handleOrderOptionChange = (e) => {
    setOrderOption(e.target.value);
  };

  const handleShare = (e) => {
    e.preventDefault();
    ToastMaker('Link Copied to Clipboard', 3500, {
      valign: 'top',
      styles: {
        backgroundColor: 'green',
        fontSize: '20px'
      }
    });
    e.stopPropagation();
    navigator.clipboard.writeText(`https://scicommons.org/article/${article.id}`);
  };


  console.log(comments, 'comments');

  return (
    <div className="bg-white min-h-screen w-full">
      {(loading || article === null || comments === null) && <Loader />}
      {!loading && article && comments && (
        <div className="bg-white">
          <div className="p-4 bg-white w-full md:w-5/6 mt-[1rem] mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl uppercase font-bold text-gray-800">
                {article.article_name.replace(/_/g, ' ')}
              </h1>
              <button onClick={handleFavourites} className="text-red-500">
                {article.isFavourite ? (
                  <Tooltip content="Remove from Favourites" position="top">
                    <AiFillHeart className="w-6 h-6" />
                  </Tooltip>
                ) : (
                  <Tooltip content="Add to Favourites" position="top">
                    <AiOutlineHeart className="w-6 h-6" />
                  </Tooltip>
                )}
              </button>
            </div>

            <div className="mb-2">
              <span className="text-lg font-semibold text-green-800">Added by: </span>
              {article.authors.map((author, i) => (
                <span
                  key={i}
                  onClick={() => handleProfile(author)}
                  className="cursor-pointer text-lg">
                  {author}
                  {i < article.authors.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>

            {article.unregistered_authors.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-bold text-green-800">Unregistered Author(s): </span>
                {article.unregistered_authors.map((author, i) => (
                  <span key={i} className="cursor-pointer text-sm">
                    {author.fullName}
                    {i < article.unregistered_authors.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm">
                {article.status === 'public' ? (
                  <Tooltip content="Public Article" position="top">
                    <LockOpenIcon className="w-4 h-4 inline" />
                  </Tooltip>
                ) : (
                  <Tooltip content="Private Article" position="top">
                    <LockClosedIcon className="w-4 h-4 inline" />
                  </Tooltip>
                )}
              </span>
              <span className="text-sm">
                <Tooltip content="Article Favourites" position="top">
                  <AiFillHeart className="w-4 h-4 inline" /> {formatCount(article.favourites)}
                </Tooltip>
              </span>
              <span className="text-sm">
                <Tooltip content="Article Views" position="top">
                  <MdOutlineViewSidebar className="w-4 h-4 inline" /> {formatCount(article.views)}
                </Tooltip>
              </span>
              <span className="text-sm">
                <Tooltip content="Article Rating" position="top">
                  <AiTwotoneStar className="w-4 h-4 inline" /> {article.rating ?? '0'}
                </Tooltip>
              </span>
            </div>

            {article.Abstract && (
              <div className="mb-2">
                <strong className="text-md font-semibold text-green-700">Abstract: </strong>
                <span className="text-md italic">{article.Abstract}</span>
              </div>
            )}

            <div className="mb-2">
              <strong className="text-md font-semibold text-green-700">Article Link: </strong>
              <a href={article.link} className="text-blue-700">
                {article.link}
              </a>
            </div>

            <div className="mb-4">
              <strong className="text-md font-semibold text-green-700">Submission Date: </strong>
              <span>{findTime(article.Public_date)}</span>
            </div>

            <div className="flex justify-center space-x-4 mb-4">
              {!article.article_file.includes('None') && (
                <button
                  onClick={handleFile}
                  className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  <AiOutlineFilePdf className="w-5 h-5 mr-2" />
                  <span>Pdf</span>
                </button>
              )}
              <button
                className="flex items-center space-x-2 p-2 bg-green-500 mr-4 text-white text-md shadow-lg rounded-md hover:bg-green-600"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  navigate(`/chat/${articleId}`);
                }}>
                <BsChatLeftText className="w-5 h-5" />
                <span className="text-md">Chat</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                <AiOutlineShareAlt className="w-5 h-5 mr-2" />
                <span>Share</span>
              </button>
            </div>

            <div className="text-right">
              <button
                onClick={handleShow}
                className="px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                <Tooltip content="Add Review" position="top">
                  {currentState === 1 ? 'Add Review' : 'Add Comment'}
                </Tooltip>
              </button>
            </div>
          </div>
          <div className="flex flex-col w-full md:w-5/6 bg-white mt-[1rem] mx-auto p-2 overflow-hidden">
            <div className="w-full">
              <div className="flex flex-row justify-center mt-4 text-4xl font-bold text-gray-600">
                Reviews
              </div>
            </div>
            <div className="w-full min-h-screen">
              <div className="flex flex-row justify-around p-3 items-center w-full mb-3 mt-3 bg-zinc-200 rounded-lg shadow-md">
                <div className="relative inline-flex mr-2">
                  <select
                    className="bg-white text-gray-800 text-sm md:text-md border-2 rounded-md border-green-600 focus:border-2 focus:border-green-600 px-4 py-1 transition duration-150 ease-in-out"
                    value={Type}
                    onChange={(e) => handleTypeChange(e)}>
                    <option value="null">All</option>
                    <option value="review">Review</option>
                    <option value="decision">Decision</option>
                  </select>
                </div>
                <div className="relative inline-flex mr-2">
                  <select
                    className="bg-white text-gray-800 text-sm md:text-md border-2 rounded-md border-green-600 focus:border-2 focus:border-green-600 px-4 py-1 transition duration-150 ease-in-out"
                    value={comment_type}
                    onChange={(e) => handleCommentTypeChange(e)}>
                    <option value="null">All</option>
                    <option value="OfficialComment">Official Comment</option>
                    <option value="PublicComment">Public Comment</option>
                  </select>
                </div>
                <div className="relative inline-flex mr-2">
                  <select
                    className="bg-white text-gray-800 text-sm md:text-md border-2 rounded-md border-green-600 focus:border-2 focus:border-green-600 px-4 py-1 transition duration-150 ease-in-out"
                    value={order}
                    onChange={(e) => handleOrderChange(e)}>
                    <option value="recent">Date</option>
                    <option value="rated">Comment Rating</option>
                    <option value="reputated">User Reputation</option>
                  </select>
                </div>
                <div className="relative inline-flex mr-2">
                  <select
                    className="bg-white text-gray-800 text-sm md:text-md border-2 rounded-md border-green-600 focus:border-2 focus:border-green-600 px-4 py-1 transition duration-150 ease-in-out"
                    value={orderOption}
                    onChange={(e) => handleOrderOptionChange(e)}>
                    <option value="Descending">Descending</option>
                    <option value="Ascending">Ascending</option>
                  </select>
                </div>
                <div className="relative inline-flex mr-2">
                  <button
                    className="text-sm md:text-md bg-green-500 rounded-lg p-1 text-white font-semibold"
                    onClick={getComments}>
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="p-3">
                {!loadingComment &&
                  comments.length > 0 &&
                  comments.map((comment) => {
                    return (
                      <Comments
                        key={comment.id}
                        comment={comment}
                        article={article}
                        colour={1}
                        paramCommentId={paramCommentId}
                      />
                    );
                  })}
                {loadingComment && <Loader />}
                {!loadingComment && comments.length === 0 && (
                  <div className="w-full flex flex-row justify-center items-center">
                    <button
                      style={{ cursor: 'pointer' }}
                      onClick={loadMore}
                      className="p-2 text-green-500 text-2xl text-center font-bold mt-2">
                      {loadComments ? 'Loading...' : fillLoad()}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {showCommentModal && (
            <ArticleCommentModal
              setShowCommentModal={setShowCommentModal}
              article={article}
              handleComment={handleComment}
            />
          )}
          {/* Opens Review Form to give a review */}
          {showReviewModal && (
            <ArticleReviewModal
              setShowReviewModal={setShowReviewModal}
              article={article}
              handleComment={handleComment}
            />
          )}
          {showDecisionModal && article.isArticleModerator && (
            <ArticleDecisionModal
              setShowDecisionModal={setShowDecisionModal}
              article={article}
              handleComment={handleComment}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ArticlePage;
