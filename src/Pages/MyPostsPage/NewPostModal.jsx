import React, { useState } from 'react';
import ToastMaker from 'toastmaker';
import ReactQuill from 'react-quill';
import 'toastmaker/dist/toastmaker.css';
import 'react-quill/dist/quill.snow.css';
import Dialog from '@mui/material/Dialog';

import axios from '../../Utils/axios';
import { useGlobalContext } from '../../Context/StateContext';
import { PlusIcon } from '@heroicons/react/solid';
import { IoClose } from 'react-icons/io5';

const NewPostModal = ({ refreshPost }) => {
  const { token } = useGlobalContext();

  const [body, setBody] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (body === '') {
      ToastMaker('Body can not be empty!!!', 3500, {
        valign: 'top',
        styles: {
          backgroundColor: 'red',
          fontSize: '20px'
        }
      });
      setLoading(false);
      return;
    } else if (body.length > 2000) {
      ToastMaker('Body can not exceed 2000 characters!!!', 3500, {
        valign: 'top',
        styles: {
          backgroundColor: 'red',
          fontSize: '20px'
        }
      });
      setLoading(false);
      return;
    }

    const form_data = new FormData(e.target);
    form_data.append('body', body);
    const file = form_data.get('image');

    if (file && file.size > 10485760) {
      ToastMaker('File size is too large. Maximum allowed size is 10 MB', 3500, {
        valign: 'top',
        styles: {
          backgroundColor: 'red',
          fontSize: '20px'
        }
      });
      e.target.reset();
      return;
    } else {
      console.log('File size is ok');
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    };

    try {
      await axios.post(`/api/feed/`, form_data, config);
      await refreshPost();

      ToastMaker('Post created successfully!!!', 3500, {
        valign: 'top',
        styles: {
          backgroundColor: 'green',
          fontSize: '20px'
        }
      });
      e.target.reset();
      setIsOpen(false);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const fillLoad = () => {
    if (loading) {
      return 'Posting...';
    }
    return 'Post';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ml-2 text-md font-semibold text-center bg-green-500 text-white rounded-md px-3 py-2 shadow-xl flex items-center gap-2">
        New Post
        <PlusIcon className="h-4 w-4" />
      </button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-8 rounded-lg">
          <div className="mb-12 flex justify-between">
            <h1 className="text-xl font-semibold">Create a new post</h1>
            <button onClick={() => setIsOpen(false)} className="text-red-900 px-2 rounded ml-2">
              <IoClose />
            </button>
          </div>
          <form
            onSubmit={(e) => handleSubmit(e)}
            encType="multipart/form-data"
            className="max-w-[400px] mx-auto">
            <input
              style={{ border: '2px solid #cbd5e0' }}
              type="file"
              accept="image/*"
              className="mb-4 rounded-xl max-w-full w-full"
              name="image"
            />
            <ReactQuill
              theme="snow"
              className="bg-white w-full p-2 mb-4 flex flex-col resize-none border rounded max-h-[40vh] overflow-y-auto min-h-[300px]"
              value={body}
              onChange={(value) => setBody(value)}
            />
            <span className="text-xs opacity-50">Number of characters: {body.length}/2000</span>
            <div className="flex flex-col justify-between items-end">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white px-5 py-2 rounded mt-6 font-semibold min-w-[100px]">
                {fillLoad()}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  );
};

export default NewPostModal;
