import React, { useState, useRef, useEffect } from "react";
import "./Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/Loader/Loader";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useGlobalContext } from "../../Context/StateContext";
import { Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [isPasswordHidden, setPasswordHidden] = useState(false);
  const [isPasswordHidden2, setPasswordHidden2] = useState(false);
  const [loading, setLoading] = useState(false);
  const username = useRef(null);
  const password = useRef(null);
  const password2 = useRef(null);
  const first_name = useRef(null);
  const last_name = useRef(null);
  const email = useRef(null);
  const { token } = useGlobalContext();

  useEffect(() => {
    if (token !== null) {
      navigate("/");
    }
  }, []);

  const validatePassword = (password) => {
    const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\|'"\-=]/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /[0-9]/;

    const hasSpecialChar = specialCharRegex.test(password);
    const hasUppercase = uppercaseRegex.test(password);
    const hasLowercase = lowercaseRegex.test(password);
    const hasDigit = digitRegex.test(password);
    const isLengthValid = password.length >= 8;

    return (
      hasSpecialChar &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      isLengthValid
    );
  };

  const validations = (data) => {
    if ((data.email.includes("@") && data.email.includes(".")) === false) {
      ToastMaker("Invalid Email", 3500, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      return false;
    }

    if (validatePassword(data.password) === false) {
      ToastMaker(
        "Password must contain at least 8 characters, one uppercase, one lowercase, one digit and one special character",
        3500,
        {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        }
      );
      return false;
    }

    if (validatePassword(password2.current.value) === false) {
      ToastMaker(
        "Re-Entered Password must contain at least 8 characters, one uppercase, one lowercase, one digit and one special character",
        3500,
        {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        }
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      username: username.current.value,
      password: password.current.value,
      email: email.current.value,
      first_name: first_name.current.value,
      last_name: last_name.current.value,
    };

    if (validations(data) === false) {
      setLoading(false);
      return;
    }

    if (password.current.value !== password2.current.value) {
      ToastMaker("Passwords do not match", 3500, {
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
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Perform any additional actions after successful register, e.g., navigate to the home page
      navigate("/registersuccessful");
    } catch (error) {
      // Handle register error
      if (
        error.response &&
        error.response.data &&
        error.response.data.username &&
        error.response.data.username[0]
      ) {
        // Handle specific username error
        console.log("Username error:", error.response.data.username[0]);
        ToastMaker(error.response.data.username[0], 3500, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
      } else if (error.response && error.response.data) {
        // Handle general error
        console.log("General error:", error.response.data);
        ToastMaker(error.response.data, 3500, {
          valign: "top",
          styles: {
            backgroundColor: "red",
            fontSize: "20px",
          },
        });
      } else {
        // Handle other errors
        console.log(error);
      }
    } finally {
      setLoading(false); // Hide the loader after the register request completes, whether it succeeded or failed
    }
  };

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <main className="w-full flex flex-col items-center justify-center bg-green-50 py-3 sm:px-4">
          <div className="w-full space-y-6 text-gray-600 sm:max-w-md">
            <div
              className="text-center"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "./logo.png"}
                width={150}
                className="mx-auto"
                alt="logo"
              />
            </div>
            <div className="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
              <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="text"
                  required
                  placeholder="Username"
                  ref={username}
                  className="w-full mt-2 px-3 py-2 text-gray-700 bg-transparent outline-none border focus:border-green-600 shadow-sm rounded-lg"
                />
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="text"
                  required
                  placeholder="First Name"
                  ref={first_name}
                  className="w-full mt-2 px-3 py-2 text-gray-700 bg-transparent outline-none border focus:border-green-600 shadow-sm rounded-lg"
                />
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="text"
                  required
                  placeholder="Last Name"
                  ref={last_name}
                  className="w-full mt-2 px-3 py-2 text-gray-700 bg-transparent outline-none border focus:border-green-600 shadow-sm rounded-lg"
                />
                <input
                  style={{ border: "2px solid #cbd5e0" }}
                  type="email"
                  required
                  placeholder="Email"
                  ref={email}
                  className="w-full mt-2 px-3 py-2 text-gray-700 bg-transparent outline-none border focus:border-green-600 shadow-sm rounded-lg"
                />
                <div className="relative max-w-screen mt-2">
                  <button
                    className="text-gray-400 absolute right-3 inset-y-0 my-auto active:text-gray-600"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      setPasswordHidden(!isPasswordHidden);
                    }}
                  >
                    {isPasswordHidden ? (
                      <svg
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    )}
                  </button>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type={!isPasswordHidden ? "password" : "text"}
                    required
                    placeholder="Password"
                    ref={password}
                    className="w-full pr-12 pl-3 py-2 text-gray-700 bg-transparent outline-none border focus:border-green-600 shadow-sm rounded-lg"
                  />
                </div>
                <div className="relative max-w-screen mt-2">
                  <button
                    className="text-gray-400 absolute right-3 inset-y-0 my-auto active:text-gray-600"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      setPasswordHidden2(!isPasswordHidden2);
                    }}
                  >
                    {isPasswordHidden2 ? (
                      <svg
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    )}
                  </button>
                  <input
                    style={{ border: "2px solid #cbd5e0" }}
                    type={!isPasswordHidden2 ? "password" : "text"}
                    required
                    placeholder="Confirm Password"
                    ref={password2}
                    className="w-full pr-12 pl-3 py-2 text-gray-700 bg-transparent outline-none border focus:border-green-600 shadow-sm rounded-lg"
                  />
                </div>
                <div className="relative max-w-screen mt-2">
                  <span className="text-green-600 text-sm font-bold">
                    Note :{" "}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">
                    Passwords must be at least 8 characters long, contain at
                    least one uppercase, one lowercase, one digit and one
                    special character
                  </span>
                </div>
                <button className="w-full px-4 py-2 text-white font-medium bg-green-600 hover:bg-green-500 active:bg-green-600 rounded-lg duration-150">
                  Create account
                </button>
              </form>
              <hr className="my-6 border-gray-200 w-full" />
              <p className="text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default Register;
