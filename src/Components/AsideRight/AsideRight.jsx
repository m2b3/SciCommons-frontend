
import React from "react";
import Userdetails from "../Userdetails/Userdetails";
import { useEffect } from "react";

const AsideRight = () => {



    return (
        <aside className="w-full basis-2/6 flex-col ml-7 hidden lg:flex md:mt-2">

            <div className="sticky mt-3 flex items-center pl-4 pr-10 w-full rounded-md">
                <div className="flex-1">
                    <input
                        style={{"border": "2px solid #cbd5e0"}}
                        className="w-full bg-slate-200 text-center p-2 rounded-3xl placeholder:text-black cursor-pointer text-md"
                        type="search"
                        placeholder="Search"
                    />
                </div>
            </div>

            <div className="mt-2 ">

                {/* {true && (

                    <div>

                        {searchResults?.length === 0 && (
                            <h2 className="text-lg w-full text-center font-semi-bold">No user found</h2>
                        )} 

                        {searchResults.map(user => (
                            <Userdetails key={user._id} currentUser={user} />
                        ))}
                    </div>
                ) : (<></>
                    <div>
                        <h1 className="text-xl mt-6 text-center font-bold">Suggestions for you</h1>
                        <ul className="">
                            {suggestionList.map(user => (
                                <Userdetails key={user._id} currentUser={user} />
                            ))}
                        </ul>
                    </div>
                )} */}
            </div>
        </aside>
    )
};

export default AsideRight;