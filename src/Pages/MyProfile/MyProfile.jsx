import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../../Components/Loader/Loader";
import { useGlobalContext } from "../../Context/StateContext";
import { SlUser } from "react-icons/sl";

const MyProfile = () => {
  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [institute, setInstitute] = useState("");
  const [google_scholar, setGoogleScholar] = useState("");
  const [pubmed, setPubmed] = useState("");
  const [profile_pic_url, setProfilePicUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState(null);
  const { token } = useGlobalContext();

  useEffect(() => {
    setLoading(true);
    fetchProfile();
    setLoading(false);
  }, []);

  const loadProfile = async (res) => {
    setUser(res);
    setEmail(res.email);
    setFirstName(res.first_name === null ? "" : res.first_name);
    setLastName(res.last_name === null ? "" : res.last_name);
    setInstitute(res.institute === null ? "" : res.institute);
    setGoogleScholar(res.google_scholar === null ? "" : res.google_scholar);
    setPubmed(res.pubmed === null ? "" : res.pubmed);
    setProfilePicUrl(res.profile_pic_url === null ? "" : res.profile_pic_url);
    setEdit(false);
  };

  const fetchProfile = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/get_current_user/`,
        config
      );
      await loadProfile(response.data.success);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form_data = new FormData(e.target);
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/${user.id}/`,
        form_data,
        config
      );
      await loadProfile(response.data.success);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!edit) {
      const forminputs = document.querySelectorAll('input[type="text"]');
      forminputs.forEach((input) => {
        input.removeAttribute("disabled");
      });
    } else {
      const forminputs = document.querySelectorAll('input[type="text"]');
      forminputs.forEach((input) => {
        input.setAttribute("disabled", true);
      });
    }
    setEdit(!edit);
  };

  const handleShow = () => {
    if (!edit) {
      return "Edit";
    } else {
      return "Cancel";
    }
  };

  return (
    <div>
      {(loading || user === null) && <Loader />}
      {!loading && user !== null && (
        <div className="flex flex-col items-center h-full mb-5">
          <h1 className="text-3xl font-bold mt-5 mb-5">My Profile</h1>
          <div className="flex flex-col justify-center md:flex-row md:items-center">
            <div className="flex flex-col mr-3 mt-3 items-center md:mr-10">
              <form
                className="flex flex-col items-center"
                onSubmit={(e) => handleSubmit(e)}
                encType="multipart/form-data"
              >
                {profile_pic_url.includes("None") ? (
                  <SlUser className="w-[200px] h-[200px]" />
                ) : (
                  <img
                    className="w-[200px] h-[200px]"
                    src={profile_pic_url}
                    alt="Profile Picture"
                  />
                )}
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  className="border-2 border-gray-400 rounded-md w-full h-10 px-2 mt-3"
                  name="profile_pic_url"
                  type="file"
                />
                <button
                  className="bg-green-500 text-white rounded-md w-1/2 h-10 mt-3"
                  type="submit"
                >
                  Upload
                </button>
              </form>
            </div>
            <form
              onSubmit={(e) => handleSubmit(e)}
              className="flex flex-col justify-start"
              encType="multipart/form-data"
            >
              <div className="flex flex-col justify-start">
                <div className="flex flex-row mt-3">
                  <label className="text-lg font-bold mr-2 text-green-500">
                    Email{" "}
                  </label>
                  <p className="text-md">{email}</p>
                </div>
                <div className="flex flex-row mt-3">
                  <label
                    className="text-lg font-bold mr-2 text-green-500"
                    htmlFor="first_name"
                  >
                    FirstName
                  </label>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    className={`border-2 border-gray-400 rounded-md w-4/5 ${
                      edit ? "bg-white" : "bg-gray-200"
                    } h-7 px-2`}
                    name="first_name"
                    type="text"
                    value={first_name}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    disabled
                  />
                </div>
                <div className="flex flex-row mt-3">
                  <label
                    className="text-lg font-bold mr-2 text-green-500"
                    htmlFor="last_name"
                  >
                    LastName
                  </label>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    className={`border-2 border-gray-400 ${
                      edit ? "bg-white" : "bg-gray-200"
                    } rounded-md w-4/5 h-7 px-2`}
                    name="last_name"
                    type="text"
                    value={last_name}
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                    disabled
                  />
                </div>
                <div className="flex flex-row mt-3">
                  <label
                    className="text-lg font-bold mr-2 text-green-500"
                    htmlFor="institute"
                  >
                    Institute
                  </label>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    className={`border-2 border-gray-400 rounded-md ${
                      edit ? "bg-white" : "bg-gray-200"
                    } w-4/5 h-7 px-2`}
                    name="institute"
                    type="text"
                    value={institute}
                    onChange={(e) => {
                      setInstitute(e.target.value);
                    }}
                    disabled
                  />
                </div>
                <div className="flex flex-row mt-3">
                  <label
                    className="text-lg font-bold mr-2 text-green-500"
                    htmlFor="google_scholar"
                  >
                    GoogleScholar
                  </label>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    className={`border-2 border-gray-400 rounded-md ${
                      edit ? "bg-white" : "bg-gray-200"
                    } w-4/5 h-7 px-2`}
                    name="google_scholar"
                    type="text"
                    value={google_scholar}
                    onChange={(e) => {
                      setGoogleScholar(e.target.value);
                    }}
                    disabled
                  />
                </div>
                <div className="flex flex-row mt-3">
                  <label
                    className="text-lg font-bold mr-2 text-green-500"
                    htmlFor="pubmed"
                  >
                    Pubmed
                  </label>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    className={`border-2 border-gray-400 rounded-md ${
                      edit ? "bg-white" : "bg-gray-200"
                    } w-4/5 h-7 px-2`}
                    name="pubmed"
                    type="text"
                    value={pubmed}
                    onChange={(e) => {
                      setPubmed(e.target.value);
                    }}
                    disabled
                  />
                </div>
                <div className="flex flex-row justify-around">
                  <button
                    className="bg-green-600 text-white rounded-md w-[50px] h-10 mt-3"
                    type="submit"
                  >
                    Save
                  </button>
                  <button
                    className={`${
                      !edit ? "bg-gray-600" : "bg-red-600"
                    } text-white rounded-md w-[50px] h-10 mt-3`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit();
                    }}
                  >
                    {handleShow()}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
