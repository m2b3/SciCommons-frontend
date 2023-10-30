import React, {useEffect, useState} from "react";
import NavBar from "../../Components/NavBar/NavBar";
import axios from "axios";
import Loader from "../../Components/Loader/Loader";
import Footer from "../../Components/Footer/Footer";
import {AiFillEye} from "react-icons/ai";
import dayjs from 'dayjs';
import {useGlobalContext} from '../../Context/StateContext'

const ArticleCard = ({articles}) => {

    const formatCount = (count)=>{
        if (count < 1000) {
            return count.toString();
        } else if (count < 1000000) {
            return (count / 1000).toFixed(1) + 'K';
        } else {
            return (count / 1000000).toFixed(1) + 'M';
        }
    }

    return (
        <ul className="mt-2 grid gap-2 xs-grid-cols-1 sm-grid-cols-2 md:grid-cols-2 lg:grid-cols-4 space-y-3 w-full">
        {
            articles.length > 0 ? (
            articles.map((item) => (
            <li key={item.id} className="p-5 bg-white rounded-md shadow-md">
            <a href={"/myarticles/" + `${item.id}`}>
                <div>
                <div className="justify-between sm:flex">
                    <div className="flex-1">
                    <h3 className="text-md md:text-xl font-medium text-green-600">
                        {item.article_name.replace(/_/g, " ")}
                    </h3>
                    <p className="text-gray-500 mt-2 pr-2">
                        <span className="text-green-700">Authors : </span>
                        {item.authors.map((author,index) => (<span key={index} className="font-bold mr-2">{author}</span>))}
                    </p>
                    <p className="text-gray-500 mt-2 pr-2">
                        <span className="text-green-700">Keywords : </span>
                        {item.keywords.replace(/[\[\]"_\|\|]/g, "")}
                    </p>
                    <p className="text-gray-500 mt-2 pr-2">
                        <span className="text-green-700">Added On : </span>
                        { dayjs(item.Public_date).format('MMMM D, YYYY HH:mm A')}
                    </p>
                    <div className="flex flex-row">
                        <span className="flex items-center text-gray-500 mr-4">
                            <AiFillEye className="w-4 h-4 mr-2" />
                            <span className="text-lg font-bold">{item.views == null ? 0 : formatCount(item.views)}</span>
                        </span>
                        <span className="flex items-center text-gray-500">
                            <svg
                            className="text-rose-500 w-4 h-4 mr-2 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                            </svg>
                            <span className="text-lg font-bold">{item.favourites == null ? 0 : formatCount(item.favourites)}</span>

                        </span>
                    </div>
                    </div>
                </div>
                <div className="mt-4 items-center space-y-4 text-sm sm:flex sm:space-x-4 sm:space-y-0">
                    <div className="flex items-center">
                    <div className="flex mr-2">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (item.rating == null ? 0 : item.rating) >= 1
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>

                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (item.rating == null ? 0 : item.rating) >= 2
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (item.rating == null ? 0 : item.rating) >= 3
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (item.rating == null ? 0 : item.rating) >= 4
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 ${
                            (item.rating == null ? 0 : item.rating) >= 5
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                        >
                        <path d="M12 1l2.753 8.472h8.938l-7.251 5.269 2.753 8.472L12 18.208l-7.193 5.005 2.753-8.472L.309 9.472h8.938z" />
                        </svg>
                        <span className="font-bold ml-3">
                            {item.rating == null ? 0 : item.rating}/5
                        </span>
                    </div>
                    </div>
                </div>
                </div>
            </a>
            </li>
            ))):(<h1 className="text-2xl font-bold text-gray-500 min-h-screen">No Articles Found</h1>)
        }
        </ul>
  );
};


const MyArticlesPage = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortedArticles, setSortedArticles] = useState([]);
    const {token} = useGlobalContext();

    const loadData = async (res) => {
        setArticles(res);
        setSortedArticles(res);
    }

    const loadSortedArticles = async (res) => {
        setSortedArticles(res);
    }

    const fetchArticles = async () => {
        setLoading(true)

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            const response = await axios.get(
                `https://scicommons-backend-vkyc.onrender.com/api/user/articles/`,
                config
            );
            await loadData(response.data.success);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }   
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleSearch = async(e) => {
        e.preventDefault();
        setLoading(true);
        const newArticles = [...articles].filter((article) => {
            return article.article_name.toLowerCase().includes(searchTerm.toLowerCase()) || article.authors.join(" ").toLowerCase().includes(searchTerm.toLowerCase()) || article.keywords.toLowerCase().includes(searchTerm.toLowerCase());
        });
        await loadSortedArticles(newArticles);
        setLoading(false);
    }
    
    const sortRated = (e) => {
        e.preventDefault();
        setLoading(true)
        const sortedByRating = [...articles].sort((a, b) => b.rating - a.rating);
        setSortedArticles(sortedByRating);
        setLoading(false)
    }
    const sortFavourite = (e) => {
        e.preventDefault();
        setLoading(true)
        const sortedByFavourite = [...articles].sort((a, b) => b.favourites - a.favourites);
        setSortedArticles(sortedByFavourite);

        setLoading(false)
    }
    const sortViews = (e) => {
        e.preventDefault();
        setLoading(true)
        const sortedByViews = [...articles].sort((a, b) => b.views - a.views);
        setSortedArticles(sortedByViews);

        setLoading(false)
    }
    const sortDate = (e) => {
        e.preventDefault();
        setLoading(true)
        const sortedByDate = [...articles].sort((a, b) => {
            const dateA = new Date(a.Public_date);
            const dateB = new Date(b.Public_date);
            return dateB - dateA;
        });
        setSortedArticles(sortedByDate);
        setLoading(false)
    }        

    return (
        <>
            <NavBar />
            <div className="flex flex-col items-center justify-center w-full bg-gray-50">
                <h1 className="text-3xl font-bold text-gray-700 mt-10">My Articles</h1>
                <form className="w-5/6 px-4 mt-3 md:w-2/3" onSubmit={handleSearch}>
                    <div className="relative">
                        <div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                            style={{"border": "2px solid #cbd5e0"}}
                                type="text"
                                placeholder="Search using keywords, authors, articles"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-3 pl-12 pr-4 text-green-600 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-green-600"
                            />
                        </div>
                        <button
                            type="submit"
                            onClick={handleSearch}
                            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:bg-gray-700"
                        >
                            Search
                        </button>
                    </div>
                </form>
                <div className="flex flex-row justify-end mb-5 w-full md:w-2/3">
                    <button className="mx-1 px-3 mt-4 text-black bg-green-100 rounded-md hover:bg-green-400" style={{cursor:"pointer"}} onClick={sortRated}>Most Rated</button>
                    <button className="mx-1 px-3 mt-4 text-black bg-green-100 rounded-md hover:bg-green-400" style={{cursor:"pointer"}} onClick={sortFavourite}>Most Favourite</button>
                    <button className="mx-1 px-3 mt-4 text-black bg-green-100 rounded-md hover:bg-green-400" style={{cursor:"pointer"}} onClick={sortViews}>Most Views</button>
                    <button className="mx-1 px-3 mt-4 text-black bg-green-100 rounded-md hover:bg-green-400" style={{cursor:"pointer"}} onClick={sortDate}>Most Recent</button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center w-full bg-gray-50 mb-5">
                { loading ? <Loader /> :  <ArticleCard articles={sortedArticles} /> }
            </div>
        </>
    )
}

export default MyArticlesPage;