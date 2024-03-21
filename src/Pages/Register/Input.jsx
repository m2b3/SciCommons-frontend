import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Input = ({
  label,
  placeholder,
  type,
  value,
  setValue,
  validate,
  handleChange,
}) => {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateInput = () => {
    if (!validate) return; // If no validation function is provided, don't validate

    const error = validate(value);
    if (error && (touched || (value && !touched))) {
      // Display error if input is touched or submitted with invalid value
      return <p className="text-red-500 text-sm mt-1">{error}</p>;
    }
  };

  let handleInputChange = handleChange;

  if (!handleChange && setValue) {
    handleInputChange = (event) => {
      setValue(event.target.value);
      setTouched(true);
    };
  }

  return (
    <div className="mb-4">
      <label
        htmlFor={label}
        className="block text-gray-700 dark:text-white font-semibold mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={label}
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          value={value}
          onChange={handleInputChange}
          onBlur={() => setTouched(true)} // Mark input as touched when it loses focus
          placeholder={placeholder}
          className={`shadow rounded border-slate-300	w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:shadow-outline transition-all ${
            validate
              ? validate(value) && touched
                ? "focus:ring-red-500 dark:focus:ring-red-500"
                : ""
              : ""
          } `}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute right-0 mr-3 text-gray-500 text-xl top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        )}
      </div>
      {validateInput()}
    </div>
  );
};

const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    return "Email is invalid";
  }
};

const validateUsername = (username) => {
  if (!username) {
    return "Username is required";
  } else if (username.length < 3) {
    return "Username must be at least 3 characters long";
  }
};

const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  } else if (password.length < 8) {
    return "Password must be at least 8 characters long";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) {
    return "Password must contain at least one lowercase letter, one uppercase letter, and one number";
  }
};

const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) {
    return "Confirm password is required";
  } else if (confirmPassword !== password) {
    return "Passwords do not match";
  }
};

const validateFirstName = (firstName) => {
  if (!firstName) {
    return "First name is required";
  }
};

const validateLastName = (lastName) => {
  if (!lastName) {
    return "Last name is required";
  }
};

export {
  Input,
  validateEmail,
  validateUsername,
  validateFirstName,
  validateLastName,
  validatePassword,
  validateConfirmPassword,
};
