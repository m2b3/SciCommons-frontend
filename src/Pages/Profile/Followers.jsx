import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "../../Utils/axios";
import { SlUser } from "react-icons/sl";
import "toastmaker/dist/toastmaker.css";
import { RxCross2 } from "react-icons/rx";
import { useGlobalContext } from "../../Context/StateContext";
import Loading from "./Loading";

const Followers = ({ setFollowersModal, User }) => {
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const { token, user } = useGlobalContext();
  const navigate = useNavigate();
  const { username } = useParams();

  const loadData = async (res) => {
    setFollowers(res);
  };

  const handleFollow = async (e, index) => {
    e.preventDefault();
    if (token === null) {
      navigate("/login");
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };
    if (!followers[index].isFollowing) {
      try {
        const res = await axios.post(
          `/api/user/follow/`,
          { followed_user: followers[index].user },
          config
        );
        let updatedFollowers = [...followers];
        updatedFollowers[index].isFollowing = !updatedFollowers[index].isFollowing;
        await loadData(updatedFollowers);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const res = await axios.post(
          `/api/user/unfollow/`,
          { followed_user: followers[index].user },
          config
        );
        let updatedFollowers = [...followers];
        updatedFollowers[index].isFollowing = !updatedFollowers[index].isFollowing;
        await loadData(updatedFollowers);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const fillFollow = (follower) => {
    if (follower.isFollowing) {
      return "Unfollow";
    }
    return "Follow";
  };

  const fetchFollowers = async () => {
    setLoading(true);
    let config = null;
    if (token === null) {
      config = {
        headers: {
          "Content-Type": "application/json"
        },
        params: {
          username: username
        }
      };
    } else {
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        params: {
          username: username
        }
      };
    }
    try {
      const res = await axios.get(`/api/user/followers/`, config);
      await loadData(res.data.success);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFollowers();
  }, []);

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div className="bg-white rounded-lg w-5/6 h-5/6 md:w-1/2 md:h-3/4 overflow-y-auto">
          <div className="flex flex-col items-center p-4">
            <div className="flex flex-row justify-between  w-full mb-2">
              <h1 className="text-md md:text-xl font-bold">Followers</h1>
              <button className="text-xl font-bold" onClick={() => setFollowersModal(false)}>
                <RxCross2 className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col items-center w-full">
              {loading ? (
                <Loading />
              ) : (
                <>
                  {followers.length > 0 &&
                    followers.map((follower, index) => (
                      <div key={follower.id} className="flex flex-row items-center w-full">
                        {follower.avatar.includes("None") ? (
                          <SlUser className="w-6 h-6 md:w-10 md:h-10 text-black-800 mr-2 md:mr-4" />
                        ) : (
                          <img
                            src={follower.avatar}
                            alt={follower.username}
                            className="w-6 h-6 md:w-10 md:h-10 rounded-full mr-2 md:mr-4"
                          />
                        )}
                        <div className="flex flex-row justify-between w-full">
                          <Link
                            to={`/profile/${follower.username}`}
                            className="text-lg font-bold text-green-600"
                          >
                            {follower.username}
                          </Link>

                          {User.username !== follower.username && (
                            <button
                              className={`rounded-lg ${
                                follower.isFollowing ? "bg-gray-500" : "bg-green-500"
                              } text-xs md:text-sm text-white px-2 py-1`}
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                handleFollow(e, index);
                              }}
                            >
                              {fillFollow(follower)}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  {followers.length === 0 && (
                    <div className="flex justify-center h-full w-full">
                      <p className="text-sm md:text-md font-semibold">No Followers to show</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Followers;
