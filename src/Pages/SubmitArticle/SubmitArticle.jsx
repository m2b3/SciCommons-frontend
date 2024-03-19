import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAddBox, MdRemoveCircle } from "react-icons/md";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import PubMedSearch from "./PubMedSearch";

const SubmitArticle = () => {
  const baseURL = `/api/article/`;
  const { token } = useGlobalContext();

  const [currentState, setCurrentState] = useState(1);
  const [authors, setAuthors] = useState([
    {
      username: "",
    },
  ]);
  const [keywords, setKeywords] = useState("");
  const [Abstract, setAbstract] = useState("");
  const [link, setLink] = useState("");
  const [video, setVideo] = useState("");
  const [Code, setCode] = useState("");
  const [name, setName] = useState("");

  const [unregistered_authors, setUnRegistredAuthors] = useState([
    {
      fullName: "",
      email: "",
    },
  ]);

  const [communities, setCommunities] = useState([
    {
      name: "",
    },
  ]);

  const [status, setStatus] = useState("public");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateKeywords = (value) => {
    // Regular expression to match characters other than alphabets, commas, and spaces
    const regex = /[^a-zA-Z, ]/;
    if (value.length > 255) {
      ToastMaker("Keywords should be less than 255 characters", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      return false;
    }
    // Check if the value contains any invalid characters
    if (regex.test(value)) {
      return false;
    }

    return true;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const form_data = new FormData(e.target);

    var authorIds = [];
    var communityIds = [];
    var unregistered = [];
    for (let i = 0; i < unregistered_authors.length; i++) {
      if (
        unregistered_authors[i].fullName === "" ||
        unregistered_authors[i].email === ""
      ) {
        continue;
      } else {
        if (
          (unregistered_authors[i].email.includes("@") &&
            unregistered_authors[i].email.includes(".")) === false
        ) {
          ToastMaker("Please enter the correct email!!!", 3500, {
            valign: "top",
            styles: {
              backgroundColor: "red",
              fontSize: "20px",
            },
          });
          setLoading(false);
          return;
        }
        if (unregistered_authors[i].email.length > 255) {
          ToastMaker("Email should be less than 255 characters", 3500, {
            valign: "top",
            styles: {
              backgroundColor: "red",
              fontSize: "20px",
            },
          });
          setLoading(false);
          return;
        }
        if (unregistered_authors[i].fullName.length > 255) {
          ToastMaker("Full Name should be less than 255 characters", 3500, {
            valign: "top",
            styles: {
              backgroundColor: "red",
              fontSize: "20px",
            },
          });
          setLoading(false);
          return;
        }
        unregistered.push(unregistered_authors[i]);
      }
    }
    if (form_data.get("Abstract").length > 5000) {
      ToastMaker("Abstract should be less than 5000 characters", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (form_data.get("article_name").length > 300) {
      ToastMaker("Abstract should be less than 300 characters", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (form_data.get("video").length > 255) {
      ToastMaker("Video Link should be less than 255 characters", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (form_data.get("link").length > 255) {
      ToastMaker("Article Link should be less than 255 characters", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (form_data.get("Code").length > 100) {
      ToastMaker("Code Link should be less than 100 characters", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (validateKeywords(form_data.get("keywords")) === false) {
      ToastMaker(
        "Please enter the correct keywords following the format specified",
        3500,
        {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        }
      );
      setLoading(false);
      return;
    }
    for (let i = 0; i < authors.length; i++) {
      if (authors[i].username === "") {
        return;
      } else {
        try {
          const response = await axios.get(`/api/user/`, {
            params: {
              search: authors[i].username,
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (
            response.data.success.results.length === 0 ||
            response.data.success.results[0].username !== authors[i].username
          ) {
            setLoading(false);
            ToastMaker("Please enter the correct usernames!!!", 3500, {
              valign: "top",
              styles: {
                backgroundColor: "red",
                fontSize: "20px",
              },
            });
            return;
          } else {
            authorIds.push(response.data.success.results[0].id);
          }
        } catch (error) {
          console.log(error);
          ToastMaker("Please enter the correct usernames!!!", 3500, {
            valign: "top",
            styles: {
              backgroundColor: "red",
              fontSize: "20px",
            },
          });
          setLoading(false);
          return;
        }
      }
    }

    form_data.delete("authors");
    form_data.delete("communities");
    form_data.delete("username");
    form_data.delete("unregistered_authors");

    form_data.append("authors[0]", JSON.stringify(0));
    form_data.append(
      "unregistered_authors[0]",
      JSON.stringify({ fullName: "", email: "" })
    );

    for (let i = 0; i < authorIds.length; i++) {
      form_data.append(`authors[${i + 1}]`, JSON.stringify(authorIds[i]));
    }

    for (let i = 0; i < unregistered.length; i++) {
      form_data.append(
        `unregistered_authors[${i + 1}]`,
        JSON.stringify(unregistered[i])
      );
    }

    form_data.append("communities[0]", JSON.stringify(0));

    setLoading(true);
    try {
      const response = await axios.post(baseURL, form_data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      ToastMaker(error.response.data.error, 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      console.log(error);
      setLoading(false);
      return;
    }
    setLoading(false);

    navigate("/articlesuccessfulsubmission");
  };

  const addAuthor = () => {
    setAuthors([
      ...authors,
      {
        username: "",
      },
    ]);
  };

  const addUnregisteredAuthor = () => {
    setUnRegistredAuthors([
      ...unregistered_authors,
      {
        fullName: "",
        email: "",
      },
    ]);
  };

  const removeUnregisteredAuthor = (index) => {
    const newUnregisteredAuthors = [...unregistered_authors];
    newUnregisteredAuthors.splice(index, 1);
    setUnRegistredAuthors([...newUnregisteredAuthors]);
  };

  const changeUnregisteredAuthor = (e, index) => {
    e.preventDefault();
    const newUnregisteredAuthors = [...unregistered_authors];
    if (e.target.name === "fullName") {
      newUnregisteredAuthors[index].fullName = e.target.value;
    } else {
      newUnregisteredAuthors[index].email = e.target.value;
    }
    setUnRegistredAuthors([...newUnregisteredAuthors]);
  };

  const removeAuthor = (index) => {
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);
    setAuthors([...newAuthors]);
  };

  const changeAuthor = (e, index) => {
    const newAuthors = [...authors];
    newAuthors[index].username = e.target.value;
    setAuthors([...newAuthors]);
  };

  const fillLoad = () => {
    if (loading) {
      return "Submitting...";
    }
    return "Submit";
  };

  const onclickFuntion = (value) => {
    setCurrentState(value);
  };

  return (
    <>
      <div className="w-full mt-4">
        <div className="flex flex-row justify-center">
          <button
            className={
              currentState === 1
                ? "mb-2 text-sm md:text-xl text-green-600 px-2 font-bold md:px-5 py-2 border-b-2 border-green-600"
                : "mb-2 text-sm font-bold md:text-xl px-2 md:px-5 text-gray-600 border-b-2 border-gray-200 py-2"
            }
            style={{
              borderBottom:
                currentState === 1 ? "2px solid #68D391" : "2px solid #000",
              cursor: "pointer",
            }}
            onClick={() => onclickFuntion(1)}
          >
            New Article
          </button>
          <button
            className={
              currentState === 2
                ? "mb-2 text-sm md:text-xl text-green-600 px-2 font-bold md:px-5 py-2 border-b-2 border-green-600"
                : "mb-2 text-sm font-bold md:text-xl px-2 md:px-5 text-gray-600 border-b-2 border-gray-200  py-2"
            }
            style={{
              borderBottom:
                currentState === 2 ? "2px solid #68D391" : "2px solid #000",
              cursor: "pointer",
            }}
            onClick={() => onclickFuntion(2)}
          >
            Existing Article
          </button>
        </div>
      </div>
      {currentState === 1 && (
        <>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 mt-4 text-center text-gray-500">
              Submit Your Article
            </h1>
            <p className="text-lg text-gray-600 text-center">
              Share your knowledge with the world.
            </p>
          </div>
          <div className="m-10 flex justify-center">
            <form onSubmit={(e) => submitForm(e)} encType="multipart/form-data">
              <div className="grid gap-6 mb-6 ">
                <div>
                  <label
                    htmlFor="article_name"
                    className="block mb-4 text-sm font-medium text-gray-900"
                  >
                    Title
                  </label>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type="text"
                    id="article_name"
                    name="article_name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                    required
                  />
                  <span className="text-xs font-semibold">
                    Number of characters: {name.length}/300
                  </span>
                </div>
                <div>
                  <label
                    htmlFor="id"
                    className=" text-base mb-2 font-medium text-gray-900 flex flex-row"
                  >
                    Author(s) (Add other authors except yourself)
                    <MdAddBox
                      className="h-7 w-7 mx-2 shadow-md fill-green-500 active:shadow-none"
                      style={{ cursor: "pointer" }}
                      onClick={addAuthor}
                    />
                  </label>
                  {authors.map((author, index) => {
                    return (
                      <div className="grid gap-2 md:grid-cols-3" key={index}>
                        <div>
                          <div className="flex flex-row justify-between">
                            <label
                              htmlFor="userName"
                              className="block mb-2 text-sm font-medium text-gray-900"
                            >
                              User Name
                            </label>
                            <MdRemoveCircle
                              className="h-5 w-5 mx-2 shadow-md fill-red-500 active:shadow-none"
                              style={{ cursor: "pointer" }}
                              onClick={() => removeAuthor(index)}
                            />
                          </div>
                          <input
                            style={{ border: "2px solid #cbd5e0" }}
                            type="text"
                            id="username"
                            name="username"
                            onChange={(e) => changeAuthor(e, index)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <label
                    htmlFor="id"
                    className=" text-base mb-2 font-medium text-gray-900 flex flex-row"
                  >
                    UnRegistered Author(s)
                    <MdAddBox
                      className="h-7 w-7 mx-2 shadow-md fill-green-500 active:shadow-none"
                      style={{ cursor: "pointer" }}
                      onClick={addUnregisteredAuthor}
                    />
                  </label>
                  {unregistered_authors.map((author, index) => {
                    return (
                      <div
                        className="grid gap-2 md:grid-cols-2 m-2"
                        key={index}
                      >
                        <div className="flex flex-row">
                          <input
                            style={{ border: "2px solid #cbd5e0" }}
                            type="text"
                            id="fullName"
                            name="fullName"
                            onChange={(e) => changeUnregisteredAuthor(e, index)}
                            placeholder="Full Name"
                            required
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm mr-2 rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                          />
                          <input
                            style={{ border: "2px solid #cbd5e0" }}
                            type="email"
                            id="username"
                            name="email"
                            onChange={(e) => changeUnregisteredAuthor(e, index)}
                            placeholder="Email"
                            required
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm mr-2 rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                          />
                          <MdRemoveCircle
                            className="h-10 w-10 mx-2 shadow-md fill-red-500 active:shadow-none"
                            style={{ cursor: "pointer" }}
                            onClick={() => removeUnregisteredAuthor(index)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="keywords"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Keywords(separated with {'","'})
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                  required
                />
                <span className="text-xs font-semibold">
                  Number of characters: {keywords.length}/255
                </span>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="link"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  URL to article (Add the Url only if it is already published,
                  else leave it empty)
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="url"
                  id="link"
                  name="link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                />
                <span className="text-xs font-semibold">
                  Number of characters: {link.length}/255
                </span>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="video"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Video Link (if any)
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="url"
                  id="video"
                  name="video"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                />
                <span className="text-xs font-semibold">
                  Number of characters: {video.length}/255
                </span>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="Code"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Code Link (if any)
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="url"
                  id="Code"
                  value={Code}
                  onChange={(e) => setCode(e.target.value)}
                  name="Code"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                />
                <span className="text-xs font-semibold">
                  Number of characters: {Code.length}/100
                </span>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="file"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  File
                </label>
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="file"
                  required
                  accept="application/pdf"
                  name="article_file"
                  className="block w-full px-5 py-2 mt-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg file:bg-gray-200 file:text-gray-700 file:text-sm file:px-4 file:py-1 file:border-none file:rounded-full  placeholder-gray-400/70  focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="Abstract"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Abstract
                </label>
                <textarea
                  id="Abstract"
                  name="Abstract"
                  rows={4}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                  value={Abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  required
                />
                <span className="text-xs font-semibold">
                  Number of characters: {Abstract.length}/5000
                </span>
              </div>
              <div className=" flex flex-row items-start space-x-5">
                <div className="max-w-xs">
                  <label
                    htmlFor="fullName"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Article Submission Type
                  </label>
                  <select
                    className="w-full p-2.5 text-gray-500 bg-gray-50 border rounded-md shadow-sm outline-none appearance-none focus:border-green-600"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                    }}
                    name="status"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              <div className="flex items-start mb-6 mt-3">
                <div className="flex items-center h-5">
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    id="remember"
                    type="checkbox"
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
                {fillLoad()}
              </button>
            </form>
          </div>
        </>
      )}
      {currentState === 2 && (
        <>
          <PubMedSearch />
        </>
      )}
    </>
  );
};

export default SubmitArticle;
