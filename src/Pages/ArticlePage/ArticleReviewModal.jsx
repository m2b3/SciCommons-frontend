import React, { useState, useEffect, useRef } from 'react';
import axios from '../../Utils/axios';
import './ArticlePage.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ToastMaker from 'toastmaker';
import 'toastmaker/dist/toastmaker.css';
import { useGlobalContext } from '../../Context/StateContext';

const ArticleReviewModal = ({ setShowReviewModal, article, handleComment }) => {
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const { token } = useGlobalContext();

  const handleBodyChange = (event) => {
    setComment(event);
  };
  const comment_Type =
    article.isArticleModerator || article.isArticleReviewer || article.isAuthor
      ? 'officialcomment'
      : 'publiccomment';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (title.length > 200) {
      ToastMaker('Title should be less than 200 characters!!!', 3000, {
        valign: 'top',
        styles: {
          backgroundColor: 'red',
          fontSize: '20px'
        }
      });
      setLoading(false);
      return;
    }
    if (comment.length > 20000) {
      ToastMaker('Comment should be less than 20000 characters!!!', 3000, {
        valign: 'top',
        styles: {
          backgroundColor: 'red',
          fontSize: '20px'
        }
      });
      setLoading(false);
      return;
    }
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const res = await axios.post(
        `/api/comment/`,
        {
          Title: title,
          Comment: comment,
          article: article.id,
          rating: rating,
          confidence: confidence,
          Type: 'review',
          comment_Type: comment_Type,
          tag: 'public',
          parent_comment: null,
          version: null
        },
        config
      );
      setLoading(false);
      setTitle('');
      setComment('');
      setRating(0);
      await handleComment(res.data.comment);
      setShowReviewModal(false);
      ToastMaker('Review Posted Successfully!!!', 3000, {
        valign: 'top',
        styles: {
          backgroundColor: 'green',
          fontSize: '20px'
        }
      });
    } catch (err) {
      setLoading(false);
      if (err.response.data.error) {
        ToastMaker(err.response.data.error, 3000, {
          valign: 'top',
          styles: {
            backgroundColor: 'red',
            fontSize: '20px'
          }
        });
      }
      console.log(err);
    }
  };

  const handleSliderChange = (event) => {
    setRating(event.target.value);
  };

  const handleSelectChange = (event) => {
    setConfidence(event.target.value);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center w-full z-50 bg-gray-800 bg-opacity-50">
        <div className="flex items-center justify-center w-5/6 my-2 p-4">
          <div className="bg-slate-200 p-6 rounded-lg max-h-5/6 overflow-hidden w-full">
            <h2 className="text-xl font-semibold mb-4">Post a Review</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block font-medium mb-1">
                  Title
                </label>
                <input
                  style={{ border: '2px solid #cbd5e0' }}
                  type="text"
                  id="Title"
                  value={title}
                  name="Title"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                />
                <span className="text-xs font-semibold">
                  Number of characters: {title.length}/200
                </span>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block font-medium mb-1">
                  Comment
                </label>
                <ReactQuill
                  theme="snow"
                  className="bg-white w-full p-2 mb-4 resize-none border rounded max-h-[40vh] overflow-y-auto"
                  value={comment}
                  onChange={handleBodyChange}
                />
                <span className="text-xs font-semibold">
                  Number of characters: {comment.length}/20000
                </span>
              </div>
              <div className="mb-1">
                <label htmlFor="rating" className="block font-medium mb-1">
                  Rating
                </label>
                <div className="w-64  my-1">
                  <input
                    style={{ border: '2px solid #cbd5e0' }}
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={rating}
                    onChange={handleSliderChange}
                    className="slider-thumb w-full appearance-none h-2 bg-gray-300 focus:outline-none"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">0</span>
                    <span className="text-sm">{rating}</span>
                    <span className="text-sm">5</span>
                  </div>
                </div>
              </div>
              <div className="w-64 my-2">
                <label htmlFor="select" className="block text-sm font-medium text-gray-700">
                  Confidence
                </label>
                <select
                  id="select"
                  value={confidence}
                  onChange={handleSelectChange}
                  className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring focus:ring-indigo-300 focus:outline-none">
                  <option value="">Select...</option>
                  <option value="5">
                    I am absolutely certain that evaluation is correct and familiar with relevant
                    literature
                  </option>
                  <option value="4">
                    I am confident but not absolutely certain that my evaluation is correct
                  </option>
                  <option value="3">I am fairly confident that review is correct</option>
                  <option value="2">
                    I am willing to defend my evaluation but Its likely that I didnt understand
                    central parts of paper
                  </option>
                  <option value="1">My review is educated guess</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-white rounded mr-2 font-semibold">
                {loading ? 'Posting...' : 'Post Review'}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                onClick={() => {
                  setShowReviewModal(false);
                }}>
                Close
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleReviewModal;
