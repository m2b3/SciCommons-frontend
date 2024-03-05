import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import { SlUser } from "react-icons/sl";
import axios from "axios";
import Popper from "popper.js";
import { useNavigate } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import SideNav from "../SideNav/SideNav";
import { FiLogOut } from "react-icons/fi";
import { useGlobalContext } from "../../Context/StateContext";
import { navbarNavigationRoutes, closeIcon, hamburgerIcon, arrowHeadNextIcon } from "../../Utils/Constants/Navbar";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full border-t-2 border-b-2 border-gray-900 h-6 w-6"></div>
    </div>
  );
};

const NavBar = () => {
  const { setToken, token } = useGlobalContext();
  const navigate = useNavigate();
  const [state, setState] = useState(false);
  const [Menu, setMenu] = useState(false);
  const [isAuth, setIsAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = navbarNavigationRoutes;

  const loadUserData = async (res) => {
    setUser(res);
    setIsAuth(true);
  };

  const getCurrentUser = async () => {
    try {
      const response = await axios.get(
        "https://scicommons-backend-vkyc.onrender.com/api/user/get_current_user/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const user = response.data.success;
      await loadUserData(user);
    } catch (error) {
      setIsAuth(false);
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      await getCurrentUser();
    };
    fetchData();
    setLoading(false);
  }, []);

  const handleLogout = (e) => {
    setIsAuth(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("Menu");
    setToken(null);
    setIsOpen(false);
    navigate("/");
  };

  const handleChange = () => {
    setMenu(!Menu);
  };

  return (
    <>
      <nav className="sticky top-0 bg-white md:text-sm z-50 shadow-lg">
        <div className="gap-x-7 items-center px-4 md:flex md:px-8">
          <div className="flex items-center justify-between py-5 md:block">
            <div className="flex flex-row items-center  justify-between">
              <button style={{ cursor: "pointer" }} onClick={handleChange}>
                <CiMenuFries
                  id="menu"
                  className="h-5 w-5 mx-2 active:shadow-none"
                />
              </button>
              <Link to="/">
                <img
                  src={process.env.PUBLIC_URL + "/logo.png"}
                  width={40}
                  height={20}
                  alt="logo"
                />
              </Link>
            </div>
            <div className="md:hidden">
              <button
                className="menu-btn text-gray-500 hover:text-gray-800"
                style={{ cursor: "pointer" }}
                onClick={() => setState(!state)}
              >
                {state ? (
                  closeIcon()
                ) : (
                  hamburgerIcon()
                )}
              </button>
            </div>
          </div>
          <div
            className={`flex-1 items-center mt-8 md:mt-0 md:flex ${
              state ? "block" : "hidden"
            } `}
          >
            <ul className="justify-center items-center space-y-6 md:flex space-x-3 md:space-x-6 md:space-y-0">
              {navigation.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className="text-sm text-green-600 font-semibold hover:text-green-800"
                  >
                    <Link to={item.path} className="block">
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="profile flex-1 gap-x-6 items-center justify-end mt-6 space-y-6 md:flex md:space-y-0 md:mt-0">
              {(loading || isAuth === null) && <Spinner />}
              {!loading && isAuth && (
                <div className=" flex items-center">
                  <Dropdown
                    color="orange"
                    onLogout={handleLogout}
                    User={
                      user.profile_pic_url.includes("None")
                        ? null
                        : user.profile_pic_url
                    }
                  />
                </div>
              )}

              {!loading && isAuth !== null && !isAuth && (
                <>
                  <Link
                    to="/login"
                    className="block text-sm text-base text-green-500 font-semibold hover:text-green-700"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="flex text-sm items-center bottom-2 justify-center gap-x-1 py-2 px-4 text-white font-medium bg-green-600 hover:bg-green-700 active:bg-green-900 rounded-full md:inline-flex"
                  >
                    Register
                    {arrowHeadNextIcon()}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      {Menu && <SideNav isMenuOpen={Menu} onMenuChange={handleChange} />}
    </>
  );
};

const Dropdown = ({ color, onLogout, User }) => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();
  const openDropdownPopover = () => {
    new Popper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-6/12 md:w-4/12 px-4">
          <div className="relative inline-flex align-middle w-full">
            <button
              className={
                "text-white font-bold uppercase text-sm px-6 rounded outline-none focus:outline-none bg-white"
              }
              style={{ transition: "all .15s ease", cursor: "pointer" }}
              type="button"
              ref={btnDropdownRef}
              onClick={() => {
                dropdownPopoverShow
                  ? closeDropdownPopover()
                  : openDropdownPopover();
              }}
            >
              <span className="w-8 h-8 inline-block ml-1">
                {User === null ? (
                  <SlUser className="text-black w-6 h-6 inline-block ml-1" />
                ) : (
                  <img
                    className="object-cover w-6 h-6 rounded-full ring ring-gray-300 mt-1"
                    src={User}
                    alt="avatar"
                  />
                )}
              </span>
            </button>
            <div
              ref={popoverDropdownRef}
              className={
                (dropdownPopoverShow ? "block " : "hidden ") +
                "text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1 bg-white"
              }
              style={{ minWidth: "8rem" }}
            >
              <Link
                to="/myprofile"
                className="text-sm py-2 px-4 font-normal block w-full whitespace-no-wrap bg-white text-gray-800 hover:bg-gray-200"
              >
                Your Profile
              </Link>
              <Link
                to="/notifications"
                className="text-sm py-2 px-4 font-normal block w-full whitespace-no-wrap bg-white text-gray-800 hover:bg-gray-200"
              >
                Notifications
              </Link>
              <button
                className={
                  "text-sm py-2 px-4 w-full font-normal flex bg-white text-gray-800 hover:bg-gray-200"
                }
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  onLogout(e);
                }}
              >
                <FiLogOut className="w-4 h-4 mr-1" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
