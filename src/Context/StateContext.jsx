import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from '../Utils/axios';
import { cookies, localStorage } from '../Utils/Services/StorageService';

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(cookies.get('token') || null);
  const [loading, setLoading] = useState(false);

  const loadUserData = async (res) => {
    setUser(res);
  };

  const getCurrentUser = async () => {
    try {
      const token = cookies.get('token');

      const response = await axios.get(`/api/user/get_current_user/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const user = response.data.success;
      await loadUserData(user);
    } catch (error) {
      setUser(null);
      setToken(null);
      cookies.remove('token');
      localStorage.remove('user');
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      getCurrentUser();
    };
    fetchData();
    setLoading(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        setToken,
        setUser
      }}>
      {children}
    </AppContext.Provider>
  );
};
export const useGlobalContext = () => {
  return useContext(AppContext);
};
export { AppContext, AppProvider };
