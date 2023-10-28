import { Link, NavLink } from "react-router-dom";
import CreatePostModal from "../CreatePostModal/CreatePostModal";
import { BiEditAlt } from "react-icons/bi";
import { AiOutlineHome, AiFillHome  } from "react-icons/ai";
import { MdOutlineExplore, MdExplore, MdOutlineBookmarkBorder, MdOutlineBookmark } from "react-icons/md";
import { FaRegUser, FaUser } from "react-icons/fa";

const AsideLeft = () => {

    return (
        <aside className="hidden sm:block basis-1/6 lg:basis-1/5">

            <CreatePostModal />

            <nav>
                <ul className="px-2 mr-1">
                    <li >
                        <NavLink to="/feed" className="flex py-4 gap-3 px-3 cursor-pointer hover:bg-slate-200 rounded-[15rem] active:bg-slate-100">
                            {({ isActive }) => 
                                isActive ? (
                                    <>
                                        <AiFillHome className="text-[1.6rem] font-bold"/>  
                                        <h2 className="text-xl px-1 hidden xl:block font-bold"> Home </h2>
                                    </>
                                ) : (
                                    <>
                                        <AiOutlineHome className="text-[1.6rem]"/>
                                        <h2 className="text-xl px-1 hidden xl:block"> Home </h2>
                                    </>
                                )}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/bookmarks" className="flex py-4 gap-3 px-3 cursor-pointer hover:bg-slate-200 rounded-[15rem] active:bg-slate-100">
                            {({ isActive }) => 
                                isActive ? (
                                    <>
                                        <MdOutlineBookmark className="text-[1.6rem] font-bold"/> 
                                        <h2 className="text-xl px-1 hidden xl:block font-bold"> Bookmarks </h2>
                                    </>
                                ) : (
                                    <>
                                        <MdOutlineBookmarkBorder className="text-[1.6rem]"/>
                                        <h2 className="text-xl px-1 hidden xl:block"> Bookmarks </h2>  
                                    </>
                                )}
                        </NavLink>
                    </li>
                    <li className="my-2 mx-1">

                        <BiEditAlt 
                            className="w-9 h-9 pl-0 rounded-full block xl:hidden cursor-pointer" >
                        </BiEditAlt>
                    </li>
                </ul>
            </nav>
        </aside>
    )
};

export default AsideLeft;