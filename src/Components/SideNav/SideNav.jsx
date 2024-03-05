import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SideNav.css";
import { Sidebar } from "flowbite-react";
import { HiUserGroup } from "react-icons/hi";
import { AiOutlineUsergroupAdd, AiOutlineHeart } from "react-icons/ai";
import { CgFeed } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import { MdExplore } from "react-icons/md";
import { TbMessageCircle2 } from "react-icons/tb";
import { BsBookmarkCheck } from "react-icons/bs";
import { MdPostAdd } from "react-icons/md";
import { GrArticle } from "react-icons/gr";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

const SideNav = ({ isMenuOpen, onMenuChange }) => {
  const [isOpen, setIsMenuOpen] = useState(isMenuOpen);
  const tabs = [
    {
      text: "My TimeLine",
      icon: CgFeed,
      href: "/mytimeline",
    },
    {
      text: "Explore",
      icon: MdExplore,
      href: "/explore",
    },
    {
      text: "Create Community",
      icon: AiOutlineUsergroupAdd,
      href: "/createcommunity",
    },
    {
      text: "My Community",
      icon: HiUserGroup,
      href: "/mycommunity",
    },
    {
      text: "My Articles",
      icon: GrArticle,
      href: "/myarticles",
    },
    {
      text: "Favourites",
      icon: AiOutlineHeart,
      href: "/favourites",
    },
    {
      text: "My Posts",
      icon: MdPostAdd,
      href: "/myposts",
    },
    {
      text: "Bookmarks",
      icon: BsBookmarkCheck,
      href: "/bookmarks",
    },
    /* {
    text: "Messages",
    icon: TbMessageCircle2,
    href: "/messages",
  }, */
  ];

  return (
    <Drawer open={isOpen} onClose={() => onMenuChange(false)}>
      <Link to="/" className="text-3xl font-bold text-green-600 m-6">
        Scicommons
      </Link>
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          {tabs.map((tab, index) => (
            <ListItem key={index} disablePadding>
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
  );

  /* return (
    <div className="sidenav">
      <Sidebar
        aria-label="Sidebar with logo branding example"
        className="w-full h-full bg-white"
      >
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <div className="flex flex-row items-center justify-between">
              <Sidebar.Item href="/">
                <p className="text-3xl font-bold text-green-600">Scicommons</p>
              </Sidebar.Item>
              <button style={{ cursor: "pointer" }} onClick={onMenuChange}>
                <RxCross2 className="h-5 w-5 mt-2 mr-3 active:shadow-none text-gray-500" />
              </button>
            </div>
            <Sidebar.Item href="/mytimeline" icon={CgFeed} className="mt-5">
              <p className="font-semibold">My TimeLine</p>
            </Sidebar.Item>
            <Sidebar.Item href="/explore" icon={MdExplore}>
              <p className="font-semibold">Explore</p>
            </Sidebar.Item>
            <Sidebar.Item href="/createcommunity" icon={AiOutlineUsergroupAdd}>
              <p className="font-semibold">Create Community</p>
            </Sidebar.Item>
            <Sidebar.Item href="/mycommunity" icon={HiUserGroup}>
              <p className="font-semibold">My Community</p>
            </Sidebar.Item>
            <Sidebar.Item href="/myarticles" icon={GrArticle}>
              <p className="font-semibold">My Articles</p>
            </Sidebar.Item>
            <Sidebar.Item href="/favourites" icon={AiOutlineHeart}>
              <p className="font-semibold">Favourites</p>
            </Sidebar.Item>
            <Sidebar.Item href="/myposts" icon={MdPostAdd}>
              <p className="font-semibold">My Posts</p>
            </Sidebar.Item>
            <Sidebar.Item href="/bookmarks" icon={BsBookmarkCheck}>
              <p className="font-semibold">Bookmarks</p>
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  ); */
};

export default SideNav;
