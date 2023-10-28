import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';


const AppContext = React.createContext()



const AppProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  const loadUserData = async (res) => {
    setUser(res);
  }

  const getCurrentUser = async () => {
      try {
          const token = localStorage.getItem('token'); 
    
          const response = await axios.get('https://scicommons-backend-vkyc.onrender.com/api/user/get_current_user/', {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          }); 
          const user = response.data.success;
          await loadUserData(user);
      } catch (error) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.error(error);
      }
    };

  useEffect(()=> {
    setLoading(true);
    const fetchData = async() => {
       getCurrentUser();
    }
    fetchData();
    setLoading(false);
  },[])


  return (
    <AppContext.Provider value={{
      user, token, setToken, setUser
    }}>
      {children}
    </AppContext.Provider>
  )
}
export const useGlobalContext = () => {
  return useContext(AppContext);
}
export { AppContext, AppProvider }
