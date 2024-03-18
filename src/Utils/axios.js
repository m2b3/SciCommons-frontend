import { default as AxiosClient } from 'axios';

const axios = AxiosClient.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'https://scicommons-backend-vkyc.onrender.com',
    // baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axios;