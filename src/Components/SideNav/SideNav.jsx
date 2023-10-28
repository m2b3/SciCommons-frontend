import React from "react";
import "./SideNav.css";
import { Sidebar } from "flowbite-react";
import {
  HiUserGroup,
} from "react-icons/hi";
import {AiOutlineUsergroupAdd, AiOutlineHeart} from 'react-icons/ai';
import { CgFeed } from "react-icons/cg";
import {RxCross2} from 'react-icons/rx';
import {MdExplore} from 'react-icons/md';
import {TbMessageCircle2} from 'react-icons/tb';
import {BsBookmarkCheck} from 'react-icons/bs';
import {MdPostAdd} from 'react-icons/md';
import {GrArticle} from 'react-icons/gr';



const SideNav = ({onMenuChange}) => {
  return (
    <div className="sidenav">
      <Sidebar aria-label="Sidebar with logo branding example" className="w-full h-full bg-white">
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <div className="flex flex-row items-center justify-between">
                <Sidebar.Item href="/">
                <p className="text-3xl font-bold text-green-600">Scicommons</p>
                </Sidebar.Item>
                <button style={{cursor:"pointer"}} onClick={onMenuChange}>
                    <RxCross2 className="h-5 w-5 mt-2 mr-3 active:shadow-none text-gray-500"/>
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
            {/* <Sidebar.Item href="/messages" icon={TbMessageCircle2}>
              <p className="font-semibold">Messages</p>
            </Sidebar.Item> */}
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
};

export default SideNav;
