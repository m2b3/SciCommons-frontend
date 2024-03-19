import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SideNav.css";
import { HiUserGroup } from "react-icons/hi";
import { AiOutlineUsergroupAdd, AiOutlineHeart } from "react-icons/ai";
import { CgFeed } from "react-icons/cg";
import { MdExplore } from "react-icons/md";
import { BsBookmarkCheck } from "react-icons/bs";
import { MdPostAdd } from "react-icons/md";
import { GrArticle } from "react-icons/gr";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { sidenavLargeWidth, sidenavSmallWidth } from "../../Utils/Constants/Globals";
import { closeIcon, hamburgerIcon } from "../../Utils/Constants/Navbar";
import useWindowSize from "../../Utils/Hooks/useWindowSize";

const SideNav = () => {
  const windowWidth = useWindowSize().width;
  const [sidenavWidth, setSidenavWidth] = useState();
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  useEffect(() => {
    setSidenavWidth(windowWidth > 768 ? sidenavLargeWidth : sidenavSmallWidth);
    if (windowWidth <= 500) {
      setIsSidenavOpen(false);
      setSidenavWidth(0);
    }
  }, [windowWidth]);
  const tabs = [
    {
      text: "My TimeLine",
      icon: CgFeed,
      href: "/mytimeline"
    },
    {
      text: "Explore",
      icon: MdExplore,
      href: "/explore"
    },
    {
      text: "Create Community",
      icon: AiOutlineUsergroupAdd,
      href: "/createcommunity"
    },
    {
      text: "My Community",
      icon: HiUserGroup,
      href: "/mycommunity"
    },
    {
      text: "My Articles",
      icon: GrArticle,
      href: "/myarticles"
    },
    {
      text: "Favourites",
      icon: AiOutlineHeart,
      href: "/favourites"
    },
    {
      text: "My Posts",
      icon: MdPostAdd,
      href: "/myposts"
    },
    {
      text: "Bookmarks",
      icon: BsBookmarkCheck,
      href: "/bookmarks"
    }
    /* {
    text: "Messages",
    icon: TbMessageCircle2,
    href: "/messages",
  }, */
  ];

  return (
    windowWidth > 500 && (
      <Drawer
        sx={{
          width: sidenavWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidenavWidth,
            boxSizing: "border-box",
            transition: "width 0.2s ease",
            zIndex: 50
          }
        }}
        variant="permanent"
        anchor="left"
        onMouseOver={() => {
          setIsSidenavOpen(true);
          windowWidth <= 768 && setSidenavWidth(sidenavLargeWidth);
        }}
        onMouseOut={() => {
          setIsSidenavOpen(false);
          windowWidth <= 768 && setSidenavWidth(sidenavSmallWidth);
        }}
      >
        <Link
          to="/"
          className="font-bold text-green-600 md:py-4 py-2.5 flex flex-row items-center"
          style={{ textDecoration: "none", justifyContent: "center" }}
        >
          {windowWidth > 768 ? (
            <>
              <img
                src={process.env.PUBLIC_URL + "/logo.png"}
                width={40}
                height={20}
                alt="logo"
                className="mr-2"
              />
              <span className="text-2xl">SciCommons</span>
            </>
          ) : null}
        </Link>
        {windowWidth <= 768 && (
          <div className="flex flex-row items-center justify-end">
            <div className="px-4">
              {isSidenavOpen ? (
                <button
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSidenavWidth(sidenavSmallWidth);
                    setIsSidenavOpen(false);
                  }}
                >
                  {closeIcon()}
                </button>
              ) : (
                <button
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSidenavWidth(sidenavLargeWidth);
                    setIsSidenavOpen(true);
                  }}
                >
                  {hamburgerIcon()}
                </button>
              )}
            </div>
          </div>
        )}
        <Box sx={{ width: 240, marginTop: 1 }} role="presentation">
          <List>
            {tabs.map((tab, index) => (
              <ListItem key={index} disablePadding sx={{ marginTop: 1 }}>
                <ListItemButton component={Link} to={tab.href}>
                  <ListItemIcon>
                    {tab.icon && <tab.icon style={{ fontSize: "25px" }} />}
                  </ListItemIcon>
                  <ListItemText primary={tab.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    )
  );
};

export default SideNav;
