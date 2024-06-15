import { useEffect, useState } from 'react';
import { useGlobalContext } from '../../Context/StateContext';
import axios from '../../Utils/axios';
import Loader from '../../Components/Loader/Loader';
import Post from '../../Components/Post/Post';
import PageHeader from '../../Components/PageHeader';
import NewPostModal from '../MyPostsPage/NewPostModal';

const Feed = () => {
  const { token } = useGlobalContext();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    try {
      const res = await axios.get(`/api/feed/`, config);
      await setPosts(res.data.success.results);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onDeletePost = async (id) => {
    const updatedPosts = posts.filter((post) => post.id !== id);
    await setPosts(updatedPosts);
  };

  const handleEditChange = async (postId, body, image) => {
    const updatedPosts = [...posts];
    const index = updatedPosts.findIndex((post) => post.id === postId);
    updatedPosts[index].body = body;
    updatedPosts[index].image = image;
    await setPosts(updatedPosts);
  };

  if (loading) return <Loader />;

  return (
    <div className="h-full flex-grow">
      <PageHeader
        title="Explore"
        subtitle="View posts of all users."
        sidebarRenderer={() => <NewPostModal refreshPost={fetchPosts} />}
      />
      <div className="container mx-auto px-4 w-full md:w-1/2 md:!py-12 lg:!py-20">
        {posts.length > 0 &&
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onDeletePost={onDeletePost}
              handleEditChange={handleEditChange}
            />
          ))}
        {posts.length === 0 && (
          <div className="flex justify-center h-screen">
            <p className="text-2xl font-semibold">No Posts to show</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
