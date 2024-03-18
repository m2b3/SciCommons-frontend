import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";

const CreateCommunity = () => {
  const baseURL = `/api/community/`;
  const { token } = useGlobalContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [Community_name, setCommunity_name] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");

  const [errors, setErrors] = useState({
    Community_name: "",
  });

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form_data = new FormData(e.target);
    if (email.length > 100) {
      ToastMaker("Email is too long", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (Community_name.length > 300) {
      ToastMaker("Community name is too long", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (subtitle.length > 300) {
      ToastMaker("Subtitle is too long", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (location.length > 100) {
      ToastMaker("Location is too long", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (github.length > 200) {
      ToastMaker("Github link is too long", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (website.length > 300) {
      ToastMaker("Website link is too long", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(baseURL, form_data, {
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setLoading(false);
        navigate("/communitysuccessfulcreated");
      }
    } catch (error) {
      setLoading(false);
      if (error.response.data.error) {
        ToastMaker(error.response.data.error, 3500, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
        return;
      }
      setErrors(error.response.data);
      console.log(error);
      return;
    }
  };

  const fillLoad = () => {
    if (loading) {
      return "Submitting";
    }
    return "Submit";
  };

  return (
    <div style={{ paddingBottom: "40px" }}>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4 mt-4 text-center text-gray-500">
          Create a Community
        </h1>
      </div>
      <div className="m-10 flex justify-center">
        <form
          onSubmit={(e) => submitForm(e)}
          encType="multipart/form-data"
          className="w-full md:w-2/3"
        >
          <div className="grid gap-6 mb-6">
            <div>
              <label
                htmlFor="Community_name"
                className="block mb-4 text-sm font-medium text-gray-900"
              >
                Community Name
              </label>
              <input
                style={{ border: "2px solid #cbd5e0" }}
                type="text"
                id="Community_name"
                name="Community_name"
                value={Community_name}
                onChange={(e) => {
                  setCommunity_name(e.target.value);
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                required
              />
              {errors.Community_name && (
                <p className="text-red-500 text-xs italic">
                  {errors.Community_name}
                </p>
              )}
              <span className="text-xs font-semibold">
                Number of characters: {Community_name.length}/300
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="subtitle"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Subtitle
            </label>
            <input
              style={{ border: "2px solid #cbd5e0" }}
              type="text"
              id="subtitle"
              name="subtitle"
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
              required
            />
            <span className="text-xs font-semibold">
              Number of characters: {subtitle.length}/300
            </span>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={8}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
              placeholder=""
              required
            />
            <span className="text-xs font-semibold">
              Number of characters: {description.length}
            </span>
          </div>
          <div className="mb-6">
            <label
              htmlFor="location"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Location
            </label>
            <input
              style={{ border: "2px solid #cbd5e0" }}
              type="test"
              id="location"
              name="location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
              required
            />
            <span className="text-xs font-semibold">
              Number of characters: {location.length}/100
            </span>
          </div>

          <div className="mb-6">
            <label
              htmlFor="github"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Github Link (if any)
            </label>
            <input
              style={{ border: "2px solid #cbd5e0" }}
              type="url"
              id="github"
              name="github"
              value={github}
              onChange={(e) => {
                setGithub(e.target.value);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
            />
            <span className="text-xs font-semibold">
              Number of characters: {github.length}/200
            </span>
          </div>

          <div className="mb-6">
            <label
              htmlFor="website"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Website Link
            </label>
            <input
              style={{ border: "2px solid #cbd5e0" }}
              type="url"
              id="website"
              name="website"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
              required
            />
            <span className="text-xs font-semibold">
              Number of characters: {website.length}/300
            </span>
          </div>

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Email (of the Community)
            </label>
            <input
              style={{ border: "2px solid #cbd5e0" }}
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
              required
            />
            <span className="text-xs font-semibold">
              Number of characters: {email.length}/100
            </span>
          </div>

          <div className="flex items-start mb-6 mt-3">
            <div className="flex items-center h-5">
              <input
                style={{ border: "2px solid #cbd5e0" }}
                id="remember"
                type="checkbox"
                value=""
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-green-300"
                required
              />
            </div>
            <label
              htmlFor="remember"
              className="ml-2 text-sm font-medium text-gray-900"
            >
              I agree with the{" "}
              <a
                href="/terms-and-conditions"
                className="text-green-600 hover:underline"
              >
                terms and conditions
              </a>
              .
            </label>
          </div>

          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {loading && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="rounded-full border-2 border-t-2 border-green-100 h-4 w-4 animate-spin"></div>
              </div>
            )}
            {fillLoad()}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunity;
