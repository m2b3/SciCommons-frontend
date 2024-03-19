import React, { useState, useEffect, useRef } from "react";
import axios from "../../Utils/axios";
import Loader from "../../Components/Loader/Loader";
import { useGlobalContext } from "../../Context/StateContext";
import EmptyProfileImage from "./assets/profile-img.png";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [isComponentLoad, setIsComponentLoad] = useState(false);
  const [showLoadingProgress, setShowLoadingProgress] = useState(false);
  const [edit, setEdit] = useState(false);
  const { token } = useGlobalContext();
  const [selectedImage, setSelectedImage] = useState(null);
  const [userInfo, setUserInfo] = useState({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    institute: "",
    googleScholar: "",
    pubmed: "",
    profilePicUrl: "",
    rank: "",
    followers: "",
    following: "",
    posts: ""
  });
  /* const [userArticles, setUserArticles] = useState([]); */
  const imageRef = useRef();

  useEffect(() => {
    setIsComponentLoad(true);
    fetchProfile();
    /* fetchArticles(); */
  }, []);

  const loadProfile = async (res) => {
    setUser(res);
    const profileUrl =
      res?.profile_pic_url?.includes("None") || !res.profile_pic_url ? "" : res?.profile_pic_url;
    setUserInfo((prevUserInfo) => ({
      email: res?.email ?? "",
      firstName: res?.first_name ?? "",
      lastName: res?.last_name ?? "",
      institute: res?.institute ?? "",
      googleScholar: res?.google_scholar ?? "",
      pubmed: res?.pubmed ?? "",
      profilePicUrl: profileUrl,
      rank: res?.rank !== undefined ? res.rank : prevUserInfo.rank,
      followers: res?.followers !== undefined ? res.followers : prevUserInfo.followers,
      following: res?.following !== undefined ? res.following : prevUserInfo.following,
      posts: res?.posts !== undefined ? res.posts : prevUserInfo.posts
    }));
    setEdit(false);
  };

  const handleEdit = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleEditCancel = () => {
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      email: user?.email ?? "",
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      institute: user?.institute ?? "",
      googleScholar: user?.google_scholar ?? "",
      pubmed: user?.pubmed ?? "",
      profilePicUrl: user?.profile_pic_url?.includes("None") ? "" : user?.profile_pic_url
    }));
    setEdit(false);
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      console.log(imageUrl);
      setUserInfo({
        ...userInfo,
        profilePicUrl: imageUrl
      });
      setSelectedImage(file);
    }
  };

  const fetchProfile = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const response = await axios.get(`/api/user/get_current_user/`, config);
      await loadProfile(response.data.success);
    } catch (error) {
      console.log(error);
      toast.error("Profile Fetch Failed");
    } finally {
      setIsComponentLoad(false);
      setShowLoadingProgress(false);
    }
  };

  const handleSave = async () => {
    setShowLoadingProgress(true);
    const updatedUserInfo = {
      email: userInfo?.email ?? "",
      first_name: userInfo?.firstName ?? "",
      last_name: userInfo?.lastName ?? "",
      institute: userInfo?.institute ?? "",
      google_scholar: userInfo?.googleScholar ?? "",
      pubmed: userInfo?.pubmed ?? ""
      //profile_pic_url: userInfo?.profilePicUrl ?? "",
    };
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const response = await axios.put(`/api/user/${user.id}/`, updatedUserInfo, config);
      await loadProfile(response.data.success);
      toast.success("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Profile Update Failed");
    } finally {
      setShowLoadingProgress(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageRef.current.value === "") {
      toast.error("Please select an image to upload");
      return;
    }
    setShowLoadingProgress(true);
    const form_data = new FormData(e.target);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    };
    try {
      const response = await axios.put(`/api/user/${user.id}/`, form_data, config);
      await loadProfile(response.data.success);
    } catch (error) {
      console.log(error);
      toast.error("Image Update Failed");
      setUserInfo({
        ...userInfo,
        profilePicUrl: ""
      });
    } finally {
      setShowLoadingProgress(false);
    }
    imageRef.current.value = null;
  };

  /* const fetchArticles = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(`/api/user/articles/`, config);
      setUserArticles(response.data.success);
      console.log("articles: ", response.data.success);
    } catch (error) {
      console.log(error);
    } finally {
      //setLoading(false);
    }
  }; */

  return (
    <div>
      {isComponentLoad && <Loader />}
      {!isComponentLoad && userInfo && (
        <Box
          sx={{
            width: "100%",
            opacity: showLoadingProgress ? 0.3 : 1,
            pointerEvents: showLoadingProgress ? "none" : "auto",
            marginBottom: "70px"
          }}
        >
          {showLoadingProgress && <LinearProgress color="success" />}
          <div className="flex flex-col items-center h-full mb-5 px-2 mt-5">
            <div className="w-[95%] bg-slate-50 shadow-md rounded-md p-5 m-2">
              <div className="border-b border-b-gray-200 pb-2 flex flex-row items-center justify-between w-full">
                <span className="text-3xl font-bold">My Profile</span>
                <div className="flex flex-row items-center gap-x-2">
                  <div
                    className={`flex flex-row items-center justify-end p-2 rounded ${
                      edit
                        ? "bg-blue-600 cursor-pointer hover:bg-blue-500"
                        : "bg-blue-300 hover:bg-blue-300 cursor-not-allowed"
                    }`}
                    onClick={() => edit && handleSave()}
                  >
                    <span className="text-sm text-white px-3">Save</span>
                  </div>
                  <div
                    className={`flex flex-row items-center justify-end p-2 rounded bg-green-600 cursor-pointer hover:bg-green-500 ${
                      edit && "bg-red-600 hover:bg-red-500"
                    }`}
                    onClick={() => {
                      edit ? handleEditCancel() : setEdit(true);
                    }}
                  >
                    <span className="text-sm text-white px-3">{edit ? "Cancel" : "Edit"}</span>
                  </div>
                </div>
              </div>
              <div className="flex md:flex-row flex-col items-center mt-5">
                <div className="flex flex-col items-center p-5">
                  <div className="relative md:size-56 size-40 rounded-full overflow-hidden">
                    <img
                      src={userInfo?.profilePicUrl ? userInfo?.profilePicUrl : EmptyProfileImage}
                      alt="Profile Image"
                    />
                  </div>
                  <form
                    className="flex flex-col items-center"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                    encType="multipart/form-data"
                  >
                    <input
                      style={{ border: "2px solid #cbd5e0" }}
                      className="border-2 border-gray-400 rounded-md w-full h-10 px-2 mt-3"
                      name="profile_pic_url"
                      type="file"
                      ref={imageRef}
                      onChange={(e) => handleProfilePicChange(e)}
                    />
                    <button
                      className="bg-green-500 text-white rounded-md w-1/2 h-10 mt-3"
                      type="submit"
                    >
                      Upload
                    </button>
                  </form>
                </div>
                <div className="w-full pl-5 md:border-l md:border-l-gray-200">
                  <div className="flex md:flex-row md:items-center justify-between flex-col w-full mb-5 flex-wrap">
                    <span className="md:text-lg text-base">First Name:</span>
                    <input
                      type="text"
                      name="firstName"
                      placeholder=""
                      value={userInfo?.firstName}
                      disabled={!edit}
                      className={`lg:w-[70%] md:w-full rounded-md border border-gray-300 ${
                        !edit && "bg-slate-300"
                      }`}
                      onChange={(e) => handleEdit(e)}
                    />
                  </div>
                  <div className="flex md:flex-row md:items-center justify-between flex-col w-full mb-5 flex-wrap">
                    <span className="md:text-lg text-base">Last Name:</span>
                    <input
                      type="text"
                      name="lastName"
                      placeholder=""
                      value={userInfo?.lastName}
                      disabled={!edit}
                      className={`lg:w-[70%] md:w-full rounded-md border border-gray-300 ${
                        !edit && "bg-slate-300"
                      }`}
                      onChange={handleEdit}
                    />
                  </div>
                  <div className="flex md:flex-row md:items-center justify-between flex-col w-full mb-5 flex-wrap">
                    <span className="md:text-lg text-base">Email:</span>
                    <input
                      type="email"
                      name="email"
                      placeholder=""
                      value={userInfo?.email}
                      disabled={!edit}
                      className={`lg:w-[70%] md:w-full rounded-md border border-gray-300 ${
                        !edit && "bg-slate-300"
                      }`}
                      onChange={handleEdit}
                    />
                  </div>
                  <div className="flex md:flex-row md:items-center justify-between flex-col w-full mb-5 flex-wrap">
                    <span className="md:text-lg text-base">Institute:</span>
                    <input
                      type="text"
                      name="institute"
                      placeholder=""
                      value={userInfo?.institute}
                      disabled={!edit}
                      className={`lg:w-[70%] md:w-full rounded-md border border-gray-300 ${
                        !edit && "bg-slate-300"
                      }`}
                      onChange={handleEdit}
                    />
                  </div>
                  <div className="flex md:flex-row md:items-center justify-between flex-col w-full mb-5 flex-wrap">
                    <span className="md:text-lg text-base">Google Scholar:</span>
                    <input
                      type="text"
                      name="googleScholar"
                      placeholder=""
                      value={userInfo?.googleScholar}
                      disabled={!edit}
                      className={`lg:w-[70%] md:w-full rounded-md border border-gray-300 ${
                        !edit && "bg-slate-300"
                      }`}
                      onChange={handleEdit}
                    />
                  </div>
                  <div className="flex md:flex-row md:items-center justify-between flex-col w-full mb-5 flex-wrap">
                    <span className="md:text-lg text-base">Pubmed:</span>
                    <input
                      type="text"
                      name="pubmed"
                      placeholder=""
                      value={userInfo?.pubmed}
                      disabled={!edit}
                      className={`lg:w-[70%] md:w-full rounded-md border border-gray-300 ${
                        !edit && "bg-slate-300"
                      }`}
                      onChange={handleEdit}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[95%] bg-slate-50 shadow-md rounded-md p-5 m-2 grid md:grid-cols-4 grid-cols-2 gap-4">
              <div className="bg-white rounded-md px-4 py-2 flex flex-row items-center justify-center">
                <span className="text-lg font-semibold mr-2">Rank:</span>
                <span>{userInfo?.rank}</span>
              </div>
              <div className="bg-white rounded-md px-4 py-2 flex flex-row items-center justify-center">
                <span className="text-lg font-semibold mr-2">Followers:</span>
                <span>{userInfo?.followers}</span>
              </div>
              <div className="bg-white rounded-md px-4 py-2 flex flex-row items-center justify-center">
                <span className="text-lg font-semibold mr-2">Following:</span>
                <span>{userInfo.following}</span>
              </div>
              <div className="bg-white rounded-md px-4 py-2 flex flex-row items-center justify-center">
                <span className="text-lg font-semibold mr-2">Posts:</span>
                <span>{userInfo.posts}</span>
              </div>
            </div>
            {/* {userArticles && (
              <div className="w-[95%] bg-slate-50 shadow-md rounded-md p-5 m-2">
                <div className="border-b border-b-gray-200 pb-2 mb-2 flex flex-row items-center justify-between w-full">
                  <span className="text-3xl font-bold">My Articles</span>
                </div>
                {userArticles?.map((article) => {
                  return (
                    <div
                      className="flex flex-col gap-x-2 w-full bg-white rounded-md p-3 mb-3"
                      key={article.id}
                    >
                      <p
                        className="text-base mb-2 font-semibold text-green-600 overflow-hidden"
                        style={{ textOverflow: "ellipsis" }}
                      >
                        {article.article_name}
                      </p>
                      <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-row">
                          <div className="mr-3">
                            <span className="text-green-500 text-sm mr-1">
                              Authors:
                            </span>
                            {article?.authors?.map((author) => (
                              <span className="text-slate-500 text-sm font-bold" key={author}>
                                {author}
                              </span>
                            ))}
                          </div>
                          <div className="mr-3">
                            <span className="text-green-500 text-sm mr-1">
                              Keywords:
                            </span>
                            <span className="text-slate-500 text-sm font-bold">
                              {article?.keywords}
                            </span>
                          </div>
                          <div className="mr-3">
                            <span className="text-green-500 text-sm mr-1">
                              Added on:
                            </span>
                            <span className="text-slate-500 text-sm font-bold">
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )} */}
          </div>
        </Box>
      )}
    </div>
  );
};

export default MyProfile;
