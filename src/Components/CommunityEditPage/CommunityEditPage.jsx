import React, {useState,useEffect} from 'react';
import axios from 'axios';
import ToastMaker from 'toastmaker';
import "toastmaker/dist/toastmaker.css";
import Loader from '../Loader/Loader';
import {MdLocationPin, MdSubscriptions} from 'react-icons/md';
import {BsFillCloudArrowDownFill, BsGithub} from 'react-icons/bs';
import {BiLogoGmail} from 'react-icons/bi';
import {CgWebsite} from 'react-icons/cg';
import {FaUsers, FaBook, FaPencilAlt} from 'react-icons/fa';
import { useGlobalContext} from '../../Context/StateContext';

const CommunityEditPage = () => {

    const [community, setCommunity] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [subtitle, setSubtitle] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [github, setGithub] = useState('')
    const [website, setWebsite] = useState('')
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const {token} = useGlobalContext();

    const loadData = async(res)=>{
        setCommunity(res)
        setSubtitle(res.subtitle)
        setDescription(res.description)
        setLocation(res.location)
        setGithub(res.github)
        setWebsite(res.website)
        setEmail(res.email)
        setName(res.Community_name)
    }

    const loadData1 = async(res)=>{
        setCommunity(res)
    }
    useEffect(() => {
        setLoading(true)
        const getCommunity = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
                const res = await axios.get('https://scicommons-backend-vkyc.onrender.com/api/community/mycommunity',config)

                await loadData(res.data.success)
        
            } catch (error) {
                console.log(error)
            }
        }
        getCommunity()

        setLoading(false)
    },[])

    const submitForm = async(e) => {
        e.preventDefault();
        
        setLoading(true)
        const form_data = new FormData(e.target);
        if(subtitle.length > 300){
            ToastMaker("Subtitle should be less than 300 characters", 3500,{
                valign: 'top',
                styles : {
                    backgroundColor: 'red',
                    fontSize: '20px',
                }
            })
            setLoading(false)
            return;
        }
        if(name.length > 300) {
            ToastMaker("Community Name should be less than 300 characters", 3500,{
                valign: 'top',
                styles : {
                    backgroundColor: 'red',
                    fontSize: '20px',
                }
            })
            setLoading(false)
            return;
        }
        if(location.length > 100) {
            ToastMaker("location should be less than 100 characters", 3500,{
                valign: 'top',
                styles : {
                    backgroundColor: 'red',
                    fontSize: '20px',
                }
            })
            setLoading(false)
            return;
        }
        if(github.length > 200) {
            ToastMaker("Github link should be less than 200 characters", 3500,{
                valign: 'top',
                styles : {
                    backgroundColor: 'red',
                    fontSize: '20px',
                }
            })
            setLoading(false)
            return;
        }
        if(website.length > 300) {
            ToastMaker("Website link should be less than 300 characters", 3500,{
                valign: 'top',
                styles : {
                    backgroundColor: 'red',
                    fontSize: '20px',
                }
            })
            setLoading(false)
            return;
        }
        if(email.length > 100) {
            ToastMaker("Email should be less than 100 characters", 3500,{
                valign: 'top',
                styles : {
                    backgroundColor: 'red',
                    fontSize: '20px',
                }
            })
            setLoading(false)
            return;
        }

        try {
          const response = await axios.put(`https://scicommons-backend-vkyc.onrender.com/api/community/${community.Community_name}/`, form_data, {
            headers: {
              "Content-type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });
          if(response.data.success){
            setLoading(false)
            setShowModal(false)
            await loadData1(response.data.success)
            ToastMaker("Community Details Updated Successfully", 3500,{
                valign: 'top',
                  styles : {
                      backgroundColor: 'green',
                      fontSize: '20px',
                  }
              })
          }
        } catch (error) {
          setLoading(false)
          if(error.response.data.error){
            ToastMaker("Could not update the details", 3500,{
                valign: 'top',
                styles : {
                    backgroundColor: 'red',
                    fontSize: '20px',
                }
            })
            return;
          }
          console.log(error);

          return;
        }
    };
    const handleSubtitleChange = (e) => {
        setSubtitle(e.target.value)
    }
    const handleDescriptionChange = (e) => {
        setDescription(e.target.value)
    }
    const handleLocationChange = (e) => {
        setLocation(e.target.value)
    }
    const handleGithubChange = (e) => {
        setGithub(e.target.value)
    }
    const handleWebsiteChange = (e) => {
        setWebsite(e.target.value)
    }
    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const fillLoad = () => {
        if(loading){
            return "Saving";
        }
        return "Save";
    }

  return (
    <div className='w-full'>
    {(loading || community===null) && <div className="w-full"><Loader/></div> }
    {!loading && community!==null &&
        <div className="w-full">
                <div className="w-full p-3 md:p-6">
                    <div className="w-4/5 md:w-2/3 flex flex-col justify-center mx-auto mb-10">
                        <div className="m-4 flex flex-col justify-center">
                            <h1 className="text-7xl font-bold text-center text-gray-500">{community?.Community_name}</h1>
                        </div>
                        <div className="mt-4">
                            <p className="text-md text-left text-gray-500"><span className="text-lg text-left font-bold text-green-700">Subtitle : </span>{community?.subtitle}</p>
                            <p className="text-md text-left text-gray-500"><span className="text-lg text-center font-bold text-green-700">Description : </span>{community?.description}</p>
                        </div>
                            <div className="mt-4 flex flex-wrap justify-between">
                                <div className="mt-4 flex">
                                    <MdLocationPin className="text-xl text-green-700 md:mr-3" /> <span className="text-sm md:text-md text-left text-gray-500">{community?.location}</span>
                                </div>
                                <div className="mt-4 flex">
                                    <BsGithub className="text-xl text-green-700 md:mr-3" /> <a className="text-sm md:text-md text-left text-gray-500" href={community?.github}>{community?.github}</a>
                                </div>
                                <div className="mt-4 flex">
                                    <BiLogoGmail className="text-xl text-green-700 md:mr-3" /> <span className="text-sm md:text-md text-left text-gray-500">{community?.email}</span>
                                </div>
                                <div className="mt-4 flex">
                                    <CgWebsite className="text-xl text-green-700 md:mr-3" /> <a className="text-sm md:text-md text-left text-gray-500" href={community?.website}>{community?.website}</a>
                                </div>
                            </div>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button className="bg-green-600 text-white text-sm md:text-lg font-semibold py-2 px-2 rounded-xl" style={{width:'auto',cursor:"pointer"}} onClick={() => setShowModal(true)}>Edit Details</button>
                    </div>
                </div>

            {showModal ? (
                <div className="w-full flex flex-row items-center justify-center">
                    <div className="w-4/5 z-50 p-5 bg-white absolute top-20 overflow-y-auto h-3/4 mx-auto rounded">
                        <div className="mb-6">
                            <h1 className="text-md md:text-2xl font-semibold text-green-700 text-center">Edit Community Details</h1>
                            <button
                                className="bg-transparent border-0 text-red-600 float-right"
                                style={{cursor:"pointer"}}
                                onClick={() => setShowModal(false)}
                            >
                                <span className="text-red-600 opacity-7 h-6 w-6 text-sm py-0 font-bold rounded-full">
                                     Close
                                </span>
                            </button>
                        </div>
                        <div>
                            <form onSubmit={(e) => submitForm(e)} encType="multipart/form-data" className="w-full">
                            <label
                                htmlFor="Community_name"
                                className="block mb-4 text-lg font-medium text-gray-900"
                                >
                                Community Name
                                </label>
                                <input
                                style={{"border": "2px solid #cbd5e0"}}
                                type="text"
                                id="Community_name"
                                name="Community_name"
                                value={community?.Community_name}
                                onChange={(e)=>{setName(e.target.value)}}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                disabled
                                />
                                <span className="text-xs font-semibold">Number of characters: {name.length}/300</span>
                                <div className="mb-6">
                                <label
                                    htmlFor="subtitle"
                                    className="block mb-2 text-lg font-medium text-gray-900"
                                >
                                    Subtitle
                                </label>
                                <input
                                style={{"border": "2px solid #cbd5e0"}}
                                    type="text"
                                    id="subtitle"
                                    name="subtitle"
                                    value={subtitle}
                                    onChange={handleSubtitleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                    required
                                />
                                <span className="text-xs font-semibold">Number of characters : {subtitle.length}/300</span>
                                </div>

                                <div className="mb-6">
                                <label
                                    htmlFor="description"
                                    className="block mb-2 text-lg font-medium text-gray-900"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={8}
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                    placeholder=""
                                    required
                                />
                                <span className="text-xs font-semibold">Number of characters : {description.length}</span>
                                </div>
                                <div className="mb-6">
                                <label
                                    htmlFor="location"
                                    className="block mb-2 text-lg font-medium text-gray-900"
                                >
                                    Location
                                </label>
                                <input
                                    style={{"border": "2px solid #cbd5e0"}}
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={location}
                                    onChange={handleLocationChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                    required
                                />
                                <span className="text-xs font-semibold">Number of characters : {location.length}/100</span>
                                </div>

                                <div className="mb-6">
                                <label
                                    htmlFor="github"
                                    className="block mb-2 text-lg font-medium text-gray-900"
                                >
                                    Github Link (if any)
                                </label>
                                <input
                                style={{"border": "2px solid #cbd5e0"}}
                                    type="url"
                                    id="github"
                                    name="github"
                                    value={github}
                                    onChange={handleGithubChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                />
                                <span className="text-xs font-semibold">Number of characters : {github.length}/200</span>
                                </div>

                                <div className="mb-6">
                                <label
                                    htmlFor="website"
                                    className="block mb-2 text-lg font-medium text-gray-900"
                                >
                                    Website Link
                                </label>
                                <input
                                style={{"border": "2px solid #cbd5e0"}}
                                    type="url"
                                    id="website"
                                    name="website"
                                    value={website}
                                    onChange={handleWebsiteChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                    required
                                />
                                <span className="text-xs font-semibold">Number of characters : {website.length}/300</span>
                                </div>

                                <div className="mb-6">
                                <label
                                    htmlFor="email"
                                    className="block mb-2 text-lg font-medium text-gray-900"
                                >
                                    Email (of the Community)
                                </label>
                                <input
                                style={{"border": "2px solid #cbd5e0"}}
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                                    required
                                />
                                <span className="text-xs font-semibold">Number of characters : {email.length}/100</span>
                                </div>

                                <button
                                type="submit"
                                className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                                >
                                    {loading && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="rounded-full border-2 border-t-2 border-green-100 h-4 w-4 animate-spin"></div>
                                </div>
                                )}
                                {fillLoad()}
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="fixed inset-0 bg-black bg-opacity-50"></div>
                </div>
            ) : null}
        </div>}
    </div>
  )
}

export default CommunityEditPage