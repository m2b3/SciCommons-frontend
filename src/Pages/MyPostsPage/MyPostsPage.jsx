import React, {useState, useEffect} from 'react'
import axios from 'axios';
import Post from '../../Components/Post/Post';
import Loader from '../../Components/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import 'react-toggle/style.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './MyPostsPage.css';
import ToastMaker from 'toastmaker';
import "toastmaker/dist/toastmaker.css";
import {useGlobalContext} from '../../Context/StateContext';

const PostModal = ({setIsAccordionOpen, getPosts}) => {

  const handleBodyChange = (event) => {
    setBody(event);
  }

  const [body, setBody] = useState('');
  const {token} = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    setLoading(true);
    if(token===null) {
      navigate('/login')
    }
    if(body===""){
      ToastMaker('Body can not be empty!!!', 3500,{
        valign: 'top',
          styles : {
              backgroundColor: 'red',
              fontSize: '20px',
          }
      })
      setLoading(false);
      return;
    }
    if(body.length>2000){
      ToastMaker('Body can not exceed 2000 characters!!!', 3500,{
        valign: 'top',
          styles : {
              backgroundColor: 'red',
              fontSize: '20px',
          }
      })
      setLoading(false);
      return;
    }
    e.preventDefault();
    const form_data = new FormData(e.target);
    form_data.append('body', body);
    const file = form_data.get('image');
    if (file && file.size > 10485760) {
      ToastMaker('File size is too large. Maximum allowed size is 10 MB', 3500,{
        valign: 'top',
          styles : {
              backgroundColor: 'red',
              fontSize: '20px',
          }
      })
      e.target.reset()
      return;
    } else {
      console.log('File size is ok')
    }
    
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
    
        },
    };
    try{
        const res = await axios.post("https://scicommons-backend-vkyc.onrender.com/api/feed/", form_data, config);
        await getPosts();
        ToastMaker('Post created successfully!!!', 3500,{
          valign: 'top',
            styles : {
                backgroundColor: 'green',
                fontSize: '20px',
            }
        })
        e.target.reset()
        setIsAccordionOpen(false)
    }
    catch(err) {
        console.log(err)
    }
    setLoading(false);
  };

  const fillLoad = () => {
    if(loading){
      return "Posting...";
    }
    return "Post";
  }

  return (
    <>
      <div className="w-full h-full fixed block top-0 left-0 bg-gray-900 bg-opacity-50 z-50 flex flex-row items-center justify-center">
          <div className="p-4 bg-slate-100 w-5/6 md:w-1/2 rounded-md shadow-md max-h-4/5">
          <form onSubmit={(e)=>handleSubmit(e)} encType="multipart/form-data">
                <ReactQuill theme="snow" className="bg-white w-full p-2 mb-4 resize-none border rounded max-h-[40vh] overflow-y-auto" value={body} onChange={handleBodyChange}/>
                <span className="text-xs font-semibold">Number of characters: {body.length}/2000</span>
                <div className="flex flex-col justify-between items-center">
                    <input
                    style={{"border": "2px solid #cbd5e0"}}
                    type="file"
                    accept="image/*"
                    className="mb-4 rounded-xl"
                    name="image"
                    />
                    <div className="flex flex-row justify-between">
                      <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-700 text-white h-8 px-2 rounded"
                      >
                      {fillLoad()}
                      </button>
                      <button
                      onClick={()=>{setIsAccordionOpen(false)}}
                      className="bg-red-500 text-white h-8 px-2 rounded ml-2"
                      >
                      Close
                      </button>
                    </div>
                </div>
            </form>
          </div>
      </div>
    </>
  )
}
  


const MyPostsPage = () => {


    const [loading, setLoading] = useState(true);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [posts, setPosts] = useState(null);
    const {token,user} = useGlobalContext();

    const loadData = async(res) => {
        setPosts(res);
    }

    const fetchPosts = async () => {
        setLoading(true);
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };
        try{
            const res = await axios.get(`https://scicommons-backend-vkyc.onrender.com/api/user/myposts/`, config);
            await loadData(res.data.success);
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchPosts();
    },[]);
    
      const onDeletePost = async(id) => {
        const updatedPosts = posts.filter(post => post.id !== id);
        await loadData(updatedPosts);
      }
      
      const handleEditChange = async(postId,body,image) => {
        const updatedPosts = [...posts];
        const index = updatedPosts.findIndex(post => post.id === postId);
        updatedPosts[index].body = body;
        updatedPosts[index].image = image;
        await loadData(updatedPosts);
      }


  return (
    <>
     {(loading || posts===null) && <Loader/>}
    { !loading && posts!==null && 
        <> 
        <div className="p-4 w-full md:w-1/2 mx-auto">
            <h1 className="text-3xl font-semibold text-center">My Posts</h1>
            <div className="w-full mx-auto">
                <div className="flex flex-row justify-end items-center mb-1">
                    <button onClick={()=>{setIsAccordionOpen(!isAccordionOpen)}} className="ml-2 text-md font-semibold text-center bg-green-500 text-white rounded-md p-1 shadow-xl float-right">Add Post</button>
                </div>
                  {isAccordionOpen && <PostModal setIsAccordionOpen={setIsAccordionOpen} getPosts={fetchPosts}/>}
            </div>
  
        </div>
        <div className="container mx-auto px-4 w-full md:w-1/2">
          {
            posts.length > 0 && posts.map((post) => (
                <Post key={post.id} post={post} onDeletePost={onDeletePost} handleEditChange={handleEditChange} />
            ))
          }
          {
            posts.length === 0 && <div className="flex justify-center h-screen">
              <p className="text-2xl font-semibold">No Posts to show</p>
            </div>
          }

        </div>
        </>
        }
    </>
  )
}

export default MyPostsPage