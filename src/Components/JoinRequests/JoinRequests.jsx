import React,{useState, useEffect} from 'react'
import axios from '../../utils/axios'
import Loader from '../Loader/Loader'
import { TECollapse } from "tw-elements-react"
import {SlUser} from "react-icons/sl";
import {useGlobalContext} from '../../Context/StateContext'


const JoinRequests = ({community}) => {

    const {user,token} = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const [requests, setRequests] = useState([])
    const [activeElement, setActiveElement] = useState("");
    const [sortedRequests, setSortedRequests] = useState([])
    const [show, setShow] = useState(false)
    const [addModalData, setAddModalData] = useState(null)
    const [reject, setReject] = useState(false)
    const [rejectModalData, setRejectModalData] = useState(null)

    const handleClick = (value) => {
        if (value === activeElement) {
        setActiveElement("");
        } else {
        setActiveElement(value);
        }
    };

    const loadData = async(res) => {
        setRequests(res)
        setSortedRequests(res)
    } 

    const getJoinRequests = async() => {
        setLoading(true)
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            const res = await axios.get(`/api/community/${community}/get_requests/`, config)
            await loadData(res.data.success)
            setLoading(false)
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        getJoinRequests();
      }, []);

    const handleChange = (e) => {
        const search = e.target.value
        const filteredRequests = requests.filter(member => {
            return member.username.toLowerCase().includes(search.toLowerCase())
        })

        setSortedRequests(filteredRequests)
    }

    const handleRank = () => {
        const sorted = [...sortedRequests].sort((a,b) => {
            return b.rank - a.rank 
        })
        setSortedRequests(sorted)
    }

    const handleDate = () => {
        const sorted = [...requests]
        setSortedRequests(sorted)
    }
    const onDelete = async(index) => {
        const members = [...requests]
        members.splice(index, 1)
        await loadData(members)
    }


    return (
        <div className="w-full">
            {loading && <Loader/>}
            {!loading && 
            
                <div className="w-full">
                    {
                        requests.length === 0 ?
                        <div className="w-full flex flex-col items-center justify-center">
                            <h1 className="text-md md:text-2xl font-bold text-gray-600">No Join Requests</h1>
                        </div>:
                        <div className="w-full">
                            <div className="w-full flex flex-row items-center justify-between mb-3">
                                <input style={{"border": "2px solid #cbd5e0"}}type="text" onChange={handleChange} className="w-5/6 md:w-1/2 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" placeholder="Search members"/>
                                <div className="flex flex-row items-center">
                                    <span className="text-gray-600 text-sm font-semibold mr-2">Sort By :</span>
                                    <button className="px-2 py-2 mr-3 bg-green-200 rounded-xl" style={{cursor:"pointer"}} onClick={()=>{handleRank()}}>Reputation</button>
                                    <button className="px-1 py-1 bg-green-200 rounded-xl" style={{cursor:"pointer"}} onClick={()=>{handleDate()}}>Date</button>
                                </div>
                            </div>

                            {sortedRequests.length!==0 ?(sortedRequests.map((request, index) => (
                                <div id={index} className="bg-gray-200 rounded-lg md:rounded-3xl shadow-md md:shadow-xl mb-2">
                                    <div className="rounded-t-lg border border-neutral-200">
                                    <h2 className="mb-0" id="headingOne">
                                        <button
                                        className={`${
                                            activeElement === "element1" &&
                                            `text-primary [box-shadow:inset_0_-1px_0_rgba(229,231,235)]`
                                        } group relative flex w-full items-center rounded-t-[15px] border-0 bg-white px-2 py-1 md:px-5 md:py-4 text-left text-base text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none`}
                                        type="button"
                                        style={{cursor:"pointer"}}
                                        onClick={() => handleClick("element1")}
                                        aria-expanded="true"
                                        aria-controls="collapseOne"
                                        >
                                        { request.profile_pic_url.includes("None")?<SlUser className="w-4 h-4 mr-2"/>:
                                            <img className="object-cover w-4 h-4 md:w-6 md:h-6 rounded-full mr-1 md:mr-3 ring ring-gray-300" src={request.profile_pic_url} alt="avatar"/>
                                        }
                                        <span className="text-md md:text-lg font-semibold"><a href={`/profile/${request.username}`} >{request.username}</a></span>
                                        <span
                                            className={`${
                                            activeElement === "element1"
                                                ? `rotate-[-180deg] -mr-1`
                                                : `rotate-0 fill-[#212529]`
                                            } ml-auto h-5 w-5 shrink-0 fill-[#336dec] transition-transform duration-200 ease-in-out motion-reduce:transition-none`}
                                        >
                                            <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="h-6 w-6"
                                            >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                            />
                                            </svg>
                                        </span>
                                        </button>
                                    </h2>
                                    <TECollapse
                                        show={activeElement === "element1"}
                                        className="!mt-0 !rounded-b-none !shadow-none"
                                    >
                                        <div className=" w-full px-2 py-1 md:px-5 md:py-4 bg-green-50">
                                            <div className="flex flex-row items-center">
                                                <div className="flex flex-col items-center mr-6">
                                                    {request.profile_pic_url.includes("None")?<SlUser className="w-6 h-6 md:w-10 md:h-10 md:w-20 md:h-20 mr-3"/>:
                                                        <img className="object-cover w-8 h-8 md:w-14 md:h-14 rounded-full mr-3 ring ring-gray-300" src={request.profile_pic_url} alt="avatar"/>
                                                    }
                                                    <span className="text-lg font-semibold"><a href={`/profile/${request.username}`} >{request.username}</a></span>
                                                </div>
                                                <div className="flex flex-col max-w-md">
                                                    <div className="flex flex-wrap items-center">
                                                        <span className="text-sm font-semibold text-gray-600">About :</span>
                                                        <div className="flex flex-wrap word-wrap truncate">{request.about}</div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center">
                                                        <span className="text-sm font-semibold text-gray-600">Summary :</span>
                                                        <div className="flex flex-wrap word-wrap truncate">{request.summary}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-center bg-green-50 p-2">
                                            <button className="px-2 py-1 mr-3 bg-green-600 rounded-xl text-white" style={{cursor:"pointer"}} onClick={()=>{setShow(true); setAddModalData({request : request,community:community, index:index})}}>Accept</button>
                                            <button className="px-2 py-1 bg-red-600 rounded-xl text-white" style={{cursor:"pointer"}} onClick={()=>{setReject(true); setRejectModalData({request:request, community:community, index:index})}}>Reject</button>
                                        </div>
                                    </TECollapse>
                                    </div>
                              </div>
                                
                            ))):(<div className="border-b flex hover:bg-green-100 text-md md:text-xl justify-center text-green-600 bg-gray-100">
                                        No Members Found
                                </div>)}
                                {show && <AcceptModal setShow={setShow} request={addModalData.request} community={community} index={addModalData.index} onDelete={onDelete} loading={loading} setLoading={setLoading}/>}
                                {reject && <RejectModal setReject={setReject} request={rejectModalData.request} community={community} index={rejectModalData.index} onDelete={onDelete} loading={loading} setLoading={setLoading}/>}   
                        </div>
                    }
                </div>
            
            }

        </div>
    )
}

export default JoinRequests;

const AcceptModal = ({setShow, request, community,index, onDelete, loading, setLoading}) => {

    const {token} = useGlobalContext();
    
    const handleAccept = async() => {
        setLoading(true)
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            const res = await axios.post(`/api/community/${community}/approve_request/`, {user: request.user_id, status: "approved"}, config)

            await onDelete(index)
            setLoading(false)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
        {loading && <Loader/>}
        {!loading && (
            <div className="w-full h-full fixed block top-0 left-0 bg-gray-900 bg-opacity-50 z-50">
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-5/6 md:w-1/2 bg-white p-5 rounded-lg flex flex-col items-center justify-center">
                        <h1 className="text-md md:text-2xl font-bold text-gray-600 mb-4">Are you sure you want to add this member to the community?</h1>
                        <div className="w-full flex flex-row items-center justify-center">
                            <button className="text-sm font-semibold text-white p-1 px-2 mr-2 md:mr-5 rounded-lg bg-green-600 flex" style={{cursor:"pointer"}} onClick={handleAccept}>Yes</button>
                            <button className="text-sm font-semibold text-white p-1 px-2 rounded-lg bg-red-600 flex ml-2" style={{cursor:"pointer"}} onClick={() => {setShow(false)}}>No</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

const RejectModal = ({setReject, request, community,index, onDelete, loading, setLoading}) => {

    const {token} = useGlobalContext()

    const handleReject = async() => {
        setLoading(true)
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            const res = await axios.post(`/api/community/${community}/approve_request/`, {user: request.user_id, status: "rejected"}, config)

            await onDelete(index)
            setLoading(false)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
        {loading && <Loader/>}
        {!loading && (
            <div className="w-full h-full fixed block top-0 left-0 bg-gray-900 bg-opacity-50 z-50">
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-5/6 md:w-1/2 bg-white p-5 rounded-lg flex flex-col items-center justify-center">
                        <h1 className="text-md  md:text-xl font-bold text-gray-600 mb-4">Are you sure you want to reject this member's request?</h1>
                        <div className="w-full flex flex-row items-center justify-center">
                            <button className="text-sm font-semibold text-white p-1 px-2 mr-2 rounded-lg bg-green-600 flex" style={{cursor:"pointer"}} onClick={handleReject}>Yes</button>
                            <button className="text-sm font-semibold text-white p-1 px-2 rounded-lg bg-red-600 flex ml-2" style={{cursor:"pointer"}} onClick={() => {setReject(false)}}>No</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}