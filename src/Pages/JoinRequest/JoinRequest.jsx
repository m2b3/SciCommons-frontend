import React, {useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import axios from 'axios'
import ToastMaker from 'toastmaker';
import "toastmaker/dist/toastmaker.css";
import {useGlobalContext} from '../../Context/StateContext';


const JoinRequest = () => {

    const {communityName} = useParams() 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [community, setCommunity] = useState(null);
    const {token} = useGlobalContext();
    const [about, setAbout] = useState("");
    const [summary, setSummary] = useState("");


    const loadCommunity = async (res) => {
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
                const res = await axios.get(`https://scicommons-backend-vkyc.onrender.com/api/community/${communityName}/`, config )
                await loadCommunity(res.data.success)
            } catch (error) {
                console.log(error)
                if(error.response.data.detail==="Not found."){
                    ToastMaker("Community doesn't exists!!!", 3000, {
                        valign: "top",
                        styles: {
                          backgroundColor: "red",
                          fontSize: "20px",
                        },
                      });
                    navigate('/communities');
                }
            }
        }

        const fetchData = async () => {
            await getCommunity()
        }
        fetchData()
        setLoading(false)
    }, [communityName])
  
    const submitForm = async(e) => {
      e.preventDefault();
      setLoading(true)
      const form_data = new FormData(e.target);
      if(form_data.get('about').length >5000) {
        ToastMaker("About yourself should be less than 5000 characters", 3500,{
          valign: 'top',
          styles : {
              backgroundColor: 'red',
              fontSize: '20px',
          }
      })
        setLoading(false)
        return;
      }
        if(form_data.get('summary').length >5000) {
            ToastMaker("Summary should be less than 5000 characters", 3500,{
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
        const response = await axios.post(`https://scicommons-backend-vkyc.onrender.com/api/community/${communityName}/join_request/`, form_data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if(response.data.success) {
          setLoading(false)
          ToastMaker("Submitted your request", 3500,{
                valign: 'top',
                styles : {
                    backgroundColor: 'green',
                    fontSize: '20px',
                }
            })
        }
        navigate(`/community/${communityName}`)
      } catch (error) {
        setLoading(false)

        ToastMaker(error.response.data.error, 3500,{
              valign: 'top',
              styles : {
                  backgroundColor: 'red',
                  fontSize: '20px',
              }
          })
        console.log(error);
        return;
      }
        setLoading(false);
    };

    const fillLoad = () => {
        if(loading){
            return "Submitting";
        }
        return "Submit";
    }

  return (
    <>
            <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 mt-4 text-center text-gray-500">
                {communityName} Join Request Form
            </h1>
            </div>
            <div className="m-10 flex justify-center">
            <form onSubmit={(e) => submitForm(e)} className="w-full md:w-2/3">
                <div className="mb-6">
                <label
                    htmlFor="about"
                    className="block mb-2 text-sm font-medium text-gray-900"
                >
                    Tell us about yourself?
                </label>
                <textarea
                    id="about"
                    name="about"
                    rows={12}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                    placeholder=""
                    required
                />
                <span className="text-xs font-semibold">Number of characters: {about.length}/5000</span>
                </div>

                <div className="mb-6">
                <label
                    htmlFor="summary"
                    className="block mb-2 text-sm font-medium text-gray-900"
                >
                    Why do you want to join this community?
                </label>
                <textarea
                    id="summary"
                    name="summary"
                    rows={12}
                    value={summary}
                    onChange={(e)=> setSummary(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                    placeholder=""
                    required
                />
                <span className="text-xs font-semibold">Number of characters: {summary.length}/5000</span>
                </div>

                <div className="flex items-start mb-6 mt-3">
                <div className="flex items-center h-5">
                    <input
                    style={{"border": "2px solid #cbd5e0"}}
                    id="remember"
                    type="checkbox"
                    value=""
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-green-300"
                    required
                    />
                </div>
                <label
                    htmlFor="remember"
                    className="ml-2 text-sm font-medium text-gray-900"
                >
                    I agree with the{" "}
                    <a
                    href="/terms-and-conditions"
                    className="text-green-600 hover:underline"
                    >
                    terms and conditions
                    </a>
                    .
                </label>
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
    </>
  )
}

export default JoinRequest