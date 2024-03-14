import React, { useState, useEffect } from "react";
import "./App.css";

// import AllMessages from './Pages/AllMessagesPage/AllMessagesPage';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./Components/NavBar/NavBar";
import { useLocation } from "react-router-dom";
import SideNav from "./Components/SideNav/SideNav";
import useWindowSize from "./Utils/Hooks/useWindowSize";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
//
import { styled } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

// Bottom Navigation Icons
import { MdExplore } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi";
import { AiOutlineUsergroupAdd, AiOutlineHeart } from "react-icons/ai";
import { MdPostAdd } from "react-icons/md";
import {
  IoIosArrowDropupCircle,
  IoIosArrowDropdownCircle,
} from "react-icons/io";
import { BsBookmarkCheck } from "react-icons/bs";
import { CgFeed } from "react-icons/cg";
import { GrArticle } from "react-icons/gr";
import RoutesContainer from "./RoutesContainer";
import { getContainerStyles } from "./Utils/Constants/Globals";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const showNavBar = location.pathname !== "/login" && location.pathname !== "/register";
  //const showNavBar = true;
  const [value, setValue] = useState();
  const [activeBottomNavTab, setActiveBottomNavTab] = useState();
  const [activeBottomSheetTab, setActiveBottomSheetTab] = useState();
  const windowSize = useWindowSize();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const bottomNavRoutes = [
    {
      text: "Explore",
      icon: MdExplore,
      route: "/explore",
    },
    {
      text: "Community",
      icon: HiUserGroup,
      route: "/mycommunity",
    },
    {
      text: "",
      icon: IoIosArrowDropupCircle,
      route: "",
    },
    {
      text: "My Posts",
      icon: MdPostAdd,
      route: "/myposts",
    },
    {
      text: "Favourites",
      icon: AiOutlineHeart,
      route: "/favourites",
    },
  ];

  const bottomSheetRoutes = [
    {
      text: "My Timeline",
      icon: CgFeed,
      route: "/mytimeline",
    },
    {
      text: "Create Community",
      icon: AiOutlineUsergroupAdd,
      route: "/createcommunity",
    },
    {
      text: "My Articles",
      icon: GrArticle,
      route: "/myarticles",
    },
    {
      text: "Bookmarks",
      icon: BsBookmarkCheck,
      route: "/bookmarks",
    },
  ];

  const container =
    window !== undefined ? () => window.document.body : undefined;
  const drawerBleeding = 0;
  const Puller = styled("div")(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: theme.palette.mode === "light" ? grey[300] : grey[900],
    borderRadius: 3,
    position: "absolute",
    top: 8,
    left: "calc(50% - 15px)",
  }));

  return (
    <div className="relative min-h-screen flex flex-col">
      {showNavBar && <NavBar />}
      {showNavBar && <SideNav />}
      <RoutesContainer />
      {windowSize.width < 500 && showNavBar && (
        <Box
          sx={{
            width: "100%",
            position: "fixed",
            zIndex: 60,
            bottom: 0,
            right: 0,
            borderTop: "1px solid rgb(228,231,235)",
          }}
        >
          <BottomNavigation
            showLabels
            value={activeBottomNavTab}
            onChange={(event, newValue) => {
              setActiveBottomNavTab(newValue);
            }}
          >
            {bottomNavRoutes.map((route, index) =>
              route.text === "" ? (
                <BottomNavigationAction
                  label={route.text}
                  icon={<route.icon style={{ fontSize: "48px" }} />}
                  onClick={() => setIsBottomSheetOpen(prev => !prev)}
                />
              ) : (
                <BottomNavigationAction
                  label={route.text}
                  icon={<route.icon style={{ fontSize: "24px" }} />}
                  onClick={() => navigate(route.route)}
                />
              )
            )}
          </BottomNavigation>
        </Box>
      )}
      <SwipeableDrawer
        container={container}
        anchor="bottom"
        open={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
        }}
        onOpen={() => setIsBottomSheetOpen(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={true}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <div
          sx={{
            position: "absolute",
            top: -drawerBleeding,
            /* borderTopLeftRadius: 8,
            borderTopRightRadius: 8, */
            visibility: "visible",
            right: 0,
            left: 0,
          }}
        >
          <Puller />
          <Typography sx={{ p: 2, color: "text.secondary" }}>
          </Typography>
          <div>
            <BottomNavigation
              showLabels
              value={activeBottomSheetTab}
              onChange={(event, newValue) => {
                setActiveBottomSheetTab(newValue);
                setActiveBottomNavTab(null);
              }}
              style={{
                marginBottom: "20px",
              }}
            >
              {bottomSheetRoutes.map((route, index) => (
                <BottomNavigationAction
                  label={route.text}
                  icon={<route.icon style={{ fontSize: "24px" }} />}
                  onClick={() => navigate(route.route)}
                />
              ))}
            </BottomNavigation>
            <BottomNavigation
              showLabels
              value={activeBottomNavTab}
              onChange={(event, newValue) => {
                setActiveBottomNavTab(newValue);
                setActiveBottomSheetTab(null);
              }}
            >
              {bottomNavRoutes.map((route, index) =>
                route.text === "" ? (
                  <BottomNavigationAction
                    key={index}
                    label={route.text}
                    icon={
                      isBottomSheetOpen ? (
                        <IoIosArrowDropdownCircle style={{ fontSize: "48px" }} />
                      ) : (
                        <IoIosArrowDropupCircle style={{ fontSize: "48px" }} />
                      )
                    }
                    onClick={() => setIsBottomSheetOpen(prev => !prev)}
                  />
                ) : (
                  <BottomNavigationAction
                    key={index}
                    label={route.text}
                    icon={
                      route.icon && <route.icon style={{ fontSize: "24px" }} />
                    }
                    onClick={() => navigate(route.route)}
                  />
                )
              )}
            </BottomNavigation>
          </div>
        </div>
      </SwipeableDrawer>
    </div>
  );
}

export default App;
