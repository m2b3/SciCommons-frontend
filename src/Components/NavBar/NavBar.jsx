import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SlUser } from "react-icons/sl";
import { IoMdMore } from "react-icons/io";
import axios from "../../Utils/axios";
import Popper from "popper.js";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useGlobalContext } from "../../Context/StateContext";
import { navbarNavigationRoutes, arrowHeadNextIcon } from "../../Utils/Constants/Navbar";
import { getContainerStyles } from "../../Utils/Constants/Globals";
import useWindowSize from "../../Utils/Hooks/useWindowSize";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

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
  const windowSize = useWindowSize();
  const [state, setState] = useState(false);
  //const [Menu, setMenu] = useState(false);
  const [isAuth, setIsAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  let open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };

  //const navigation = navbarNavigationRoutes;

  const loadUserData = async (res) => {
    setUser(res);
    setIsAuth(true);
  };

  const getCurrentUser = async () => {
    try {
      const response = await axios.get(`/api/user/get_current_user/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
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
    navigate("/", { replace: true });
    window.location.reload();
  };

  /* const handleChange = () => {
    setMenu(!Menu);
  }; */

  return (
    <>
      <nav
        className="sticky top-0 bg-white md:text-sm z-50 border-b-2 py-3"
        style={getContainerStyles(windowSize.width)}
      >
        <div
          className="gap-x-7 items-center pl-4 pr-2 md:pr-6 flex flex-row"
          style={{ justifyContent: "space-between" }}
        >
          <div className="flex items-center justify-between py-1 md:hidden">
            <div className="flex flex-row items-center justify-between">
              {windowSize.width < 768 && (
                <Link
                  to="/"
                  className="font-bold text-green-600 flex flex-row items-center"
                  style={{ textDecoration: "none", justifyContent: "center" }}
                >
                  <img
                    src={process.env.PUBLIC_URL + "/logo.png"}
                    width={40}
                    height={20}
                    alt="logo"
                    className="mr-2"
                  />
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-row hidden md:block">
            {navbarNavigationRoutes.map((link, index) => {
              return (
                <Link
                  to={link.path}
                  className="text-sm text-green-600 font-semibold p-2"
                  key={index}
                >
                  {link.title}
                </Link>
              );
            })}
          </div>
          <div
            className="flex flex-row items-center justify-end md:gap-x-6"
            style={{ justifySelf: "flex-end" }}
          >
            {(loading || isAuth === null) && <Spinner />}
            {!loading && isAuth && (
              <div className=" flex items-center">
                <Dropdown
                  color="orange"
                  onLogout={handleLogout}
                  User={user.profile_pic_url.includes("None") ? null : user.profile_pic_url}
                />
              </div>
            )}

            {!loading && isAuth !== null && !isAuth && (
              <div className="gap-x-4 flex flex-row items-center">
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
              </div>
            )}
            <div
              className="flex flex-row items-center justify-between md:hidden text-2xl ml-2"
              onClick={(e) => handleClick(e)}
            >
              <IoMdMore />
            </div>
          </div>

          {/* <div
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
          </div> */}
        </div>
        {isMenuOpen && (
          <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={() => handleClose()}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
          >
            <Link to="/submitarticle" className="block">
              <MenuItem onClick={() => handleClose()} sx={{ padding: "8px 28px" }}>
                Submit Article
              </MenuItem>
            </Link>
            <Link to="/communities" className="block">
              <MenuItem onClick={() => handleClose()} sx={{ padding: "8px 28px" }}>
                Communities
              </MenuItem>
            </Link>
            <Link to="/articles" className="block">
              <MenuItem onClick={() => handleClose()} sx={{ padding: "8px 28px" }}>
                Articles
              </MenuItem>
            </Link>
          </Menu>
        )}
      </nav>
      {/* {Menu && <SideNav isMenuOpen={Menu} onMenuChange={handleChange} />} */}
    </>
  );
};

const Dropdown = ({ color, onLogout, User }) => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();
  const openDropdownPopover = () => {
    new Popper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start"
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpen = (event) => {
    //console.log(event);
    setAnchorEl(event.currentTarget);
    setDropdownPopoverShow(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setDropdownPopoverShow(false);
  };

  return (
    <>
      <div className="flex flex-wrap relative">
        <div className="w-full sm:w-6/12 md:w-4/12">
          <div className="relative inline-flex align-middle w-full">
            <button
              className={
                "text-white font-bold uppercase text-sm rounded-full outline-none focus:outline-none bg-slate-200"
              }
              style={{ transition: "all .15s ease", cursor: "pointer" }}
              type="button"
              ref={btnDropdownRef}
              onClick={(e) => handleOpen(e)}
            >
              <span className="p-2 inline-block flex items-center justify-items-center">
                {User === null ? (
                  <SlUser className="text-black w-4 h-4 inline-block" />
                ) : (
                  <img className="object-cover w-10 h-4 mt-1" src={User} alt="avatar" />
                )}
              </span>
            </button>

            {dropdownPopoverShow && (
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={dropdownPopoverShow}
                onClose={() => handleClose()}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left"
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "left"
                }}
              >
                <Link to="/myprofile" className="block">
                  <MenuItem onClick={() => handleClose()} sx={{ padding: "8px 28px" }}>
                    Your Profile
                  </MenuItem>
                </Link>
                <Link to="/notifications" className="block">
                  <MenuItem onClick={() => handleClose()} sx={{ padding: "8px 28px" }}>
                    Notifications
                  </MenuItem>
                </Link>
                <Link to="" className="block">
                  <MenuItem
                    onClick={(e) => {
                      handleClose();
                      onLogout(e);
                    }}
                    sx={{ padding: "8px 28px" }}
                  >
                    <FiLogOut className="w-4 h-4 mr-1" />
                    Log Out
                  </MenuItem>
                </Link>
              </Menu>
            )}

            {/* <div
              ref={popoverDropdownRef}
              className={
                (dropdownPopoverShow ? "block " : "hidden ") +
                "text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1 bg-white"
              }
              style={{ minWidth: "8rem", zIndex: 70 }}
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
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
