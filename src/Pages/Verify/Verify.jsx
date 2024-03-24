import React, { useState, useEffect } from "react";
import axios from "../../Utils/axios";
import ToastMaker from "toastmaker";
import "toastmaker/dist/toastmaker.css";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../Context/StateContext";

const Verify = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [otp, setOtp] = useState("");
  const { token } = useGlobalContext();

  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    isValidEmail(email);
    if (email !== "") {
      setDisabled(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    isValidEmail(email);
    try {
      const response = await axios.post(`/api/user/verifyrequest/`, {
        email: email,
      });
      ToastMaker("Otp sent to email!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
      setDisabled(true);
    } catch (error) {
      ToastMaker(error.response.data.error, 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      console.log(error);
    }
    setLoading(false);
  };

  const handleChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (otp.length !== 6) {
      ToastMaker("OTP must have 6 digits", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      setLoading(false);
      return;
    }
    if (isNaN(otp)) {
      ToastMaker("OTP must be a number", 3000, {
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
      const response = await axios.post(`/api/user/verify_email/`, {
        email: email,
        otp: otp,
      });
      ToastMaker("Email Verified Successfully!!!", 3000, {
        valign: "top",
        styles: {
          backgroundColor: "green",
          fontSize: "20px",
        },
      });
      navigate("/login");
    } catch (error) {
      ToastMaker(error.response.data.error, 3000, {
        valign: "top",
        styles: {
          backgroundColor: "red",
          fontSize: "20px",
        },
      });
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <div
      className="w-full h-screen flex flex-col
     items-center justify-center bg-green-50"
    >
      <div
        className="text-center"
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
      >
        <img
          src={process.env.PUBLIC_URL + "/logo.png"}
          width={150}
          className="mx-auto"
          alt="logo"
        />
      </div>
      <br />
      <div className="w-full md:w-1/2 mx-auto bg-white rounded-lg shadow-xl p-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Verify your account
        </h1>
        <div className="w-full mx-auto">
          <div className="m-2">
            <button
              className="w-full px-4 py-2 text-white font-medium bg-green-600 hover:bg-green-500 active:bg-green-600 rounded-lg duration-150"
              style={{ cursor: "pointer" }}
              onClick={handleSubmit}
            >
              Send One Time Password To Verify
            </button>
          </div>
        </div>
        <div className="w-full mx-auto mt-6">
          <div className="flex items-center text-gray-700 border rounded-md m-2">
            <input
              style={{ border: "2px solid #cbd5e0" }}
              type="text"
              placeholder="Enter the one time password"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
              }}
              className="w-full bg-transparent outline-none rounded-lg"
            />
          </div>
          <div className="m-2">
            <button
              className="w-full px-4 py-2 text-white font-medium bg-green-600 hover:bg-green-500 active:bg-green-600 rounded-lg duration-150"
              style={{ cursor: "pointer" }}
              onClick={handleChange}
            >
              Verify One time password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
