import React, { useState, useEffect } from "react";
import axios from "../../Utils/axios";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../Context/StateContext";
import { Link } from "react-router-dom";
import {
  Input,
  validatePassword,
  validateConfirmPassword,
  validateEmail,
  validateUsername,
  validateFirstName,
  validateLastName,
} from "./Input";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  // Validation for each input so we can enable/disable the submit button
  const [errors, setErrors] = useState([]);

  const { token } = useGlobalContext();

  useEffect(() => {
    if (token !== null) {
      navigate("/");
    }
  }, [token]);

  const handleValidation = () => {
    const validationErrors = [];
    if (validateEmail) {
      const emailError = validateEmail(email);
      if (emailError) {
        validationErrors.push(emailError);
      }
    }
    if (validateUsername) {
      const usernameError = validateUsername(username);
      if (usernameError) {
        validationErrors.push(usernameError);
      }
    }
    if (validatePassword) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        validationErrors.push(passwordError);
      }
    }
    if (validateConfirmPassword) {
      const confirmPasswordError = validateConfirmPassword(
        confirmPassword,
        password
      );
      if (confirmPasswordError) {
        validationErrors.push(confirmPasswordError);
      }
    }
    setErrors(validationErrors);
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      username,
      password,
      email,
      first_name: firstName,
      last_name: lastName,
    };

    try {
      const response = await axios.post(`/api/user/`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status) {
        // Redirect to the verify page after successful registration
        navigate("/verify");
      }
      setLoading(false);
      toast.success(
        "Thank you for registering!. Verify your email to complete the registration process.",
        {duration: 5000}
      );
    } catch (error) {
      setLoading(false);
      if (error.response) {
        if (error.response.data) {
          if (error.response.data.username && error.response.data.username[0]) {
            // Handle specific username error
            console.log("Username error:", error.response.data.username[0]);
            toast.error(error.response.data.username[0]);
          } else {
            // Handle general error from the response data
            console.log("Error:", error.response.data);
            const errorMessage = Object.values(error.response.data)
              .flat()
              .join(" ");
            toast.error(errorMessage || "An error occurred. Please try again.");
          }
        } else {
          // Handle error with no response data
          console.log("Error:", error.response);
          toast.error("An error occurred. Please try again.");
        }
      } else {
        // Handle error with no response
        console.log("Error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  useEffect(() => {
    handleValidation();
  }, [email, username, password, confirmPassword, firstName, lastName]);

  const isDisabled = errors.length > 0;

  return (
      <main className="w-full flex flex-col h-screen items-center justify-center bg-green-50 py-3 sm:px-4">
        <div className="w-full space-y-6 text-gray-600 sm:max-w-md">
          <div
            className="text-center"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <img src="/logo.png" width={150} className="mx-auto" alt="logo" />
          </div>
          <div className="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
            <Input label="Username" placeholder="johndoe" type="text" value={username} setValue={setUsername} validate={validateUsername} />
            <Input label="First Name" placeholder="John" type="text" value={firstName} setValue={setFirstName} validate={validateFirstName} />
            <Input label="Last Name" placeholder="Doe" type="text" value={lastName} setValue={setLastName} validate={validateLastName} />
            <Input label="Email" placeholder="johndoe@example.com" type="email" value={email} setValue={setEmail} validate={validateEmail} />
            <Input label="Password" placeholder="********" type="password" value={password} setValue={setPassword} validate={validatePassword} />
            <Input label="Confirm Password" placeholder="********" type="password" value={confirmPassword} setValue={setConfirmPassword} validate={(value) => validateConfirmPassword(value, password)} />
            <button
                type="submit"
                disabled={isDisabled}
                className={`bg-green-500 w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  isDisabled || loading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? "Registering..." : "Register"}
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
  );
};

export default Register;
