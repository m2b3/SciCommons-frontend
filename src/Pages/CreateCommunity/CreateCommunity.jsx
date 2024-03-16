import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateCommunity.css";
import Footer from "../../Components/Footer/Footer";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import { getContainerStyles } from "../../Utils/Constants/Globals";
import useWindowSize from "../../Utils/Hooks/useWindowSize";
import Select from "react-tailwindcss-select";
import countries from "../../Utils/Constants/Countries";
import InputField from "../../Components/InputField/InputField";
import TextareaField from "../../Components/TextArea/TextAreaField";

const options = countries.map((country) => ({
  value: country.code,
  label: `${country.map} ${country.value}`,
}));

const CreateCommunity = () => {
  const baseURL = `/api/community/`;
  const { token } = useGlobalContext();
  const windowSize = useWindowSize();
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

  const handleChange = (value) => {
    console.log("value:", value);
    setLocation(value);
  };

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
          <InputField
            id="Community_name"
            name="Community_name"
            type="text"
            value={Community_name}
            onChange={(e) => setCommunity_name(e.target.value)}
            label="Community Name"
            error={errors.Community_name}
            characterCount={true}
            maxLength={300}
          />

          <InputField
            id="subtitle"
            name="subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            label="Subtitle"
            characterCount={true}
            maxLength={300}
          />
          <TextareaField
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            label="Description"
            characterCount={true}
          />

          <div className="mb-6">
            <label
              htmlFor="location"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Location
            </label>
            {/* Add a location picker */}
            <Select
              value={location}
              onChange={handleChange}
              options={options}
              isSearchable
            />
          </div>

          <InputField
            id="github"
            name="github"
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            label="Github Link (if any)"
            characterCount={true}
            maxLength={200}
            required={false}
          />

          <InputField
            id="website"
            name="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            label="Website Link"
            characterCount={true}
            maxLength={300}
          />

          <InputField
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email (of the Community)"
            characterCount={true}
            maxLength={100}
          />

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
