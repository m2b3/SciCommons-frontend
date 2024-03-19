import React from "react";
import { AiFillEye } from "react-icons/ai";
import dayjs from "dayjs";

const MyArticleCard = ({ articles }) => {
  const formatCount = (count) => {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return (count / 1000).toFixed(1) + "K";
    } else {
      return (count / 1000000).toFixed(1) + "M";
    }
  };

  return (
    <ul className="mt-2 grid gap-2 xs-grid-cols-1 sm-grid-cols-2 md:grid-cols-2 lg:grid-cols-4 space-y-3 w-full">
      {articles.length > 0 ? (
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
                      {item.authors.map((author, index) => (
                        <span key={index} className="font-bold mr-2">
                          {author}
                        </span>
                      ))}
                    </p>
                    <p className="text-gray-500 mt-2 pr-2">
                      <span className="text-green-700">Keywords : </span>
                      {item.keywords.replace(/[\[\]"_\|\|]/g, "")}
                    </p>
                    <p className="text-gray-500 mt-2 pr-2">
                      <span className="text-green-700">Added On : </span>
                      {dayjs(item.Public_date).format("MMMM D, YYYY HH:mm A")}
                    </p>
                    <div className="flex flex-row">
                      <span className="flex items-center text-gray-500 mr-4">
                        <AiFillEye className="w-4 h-4 mr-2" />
                        <span className="text-lg font-bold">
                          {item.views == null ? 0 : formatCount(item.views)}
                        </span>
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
                        <span className="text-lg font-bold">
                          {item.favourites == null ? 0 : formatCount(item.favourites)}
                        </span>
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
        ))
      ) : (
        <h1 className="text-2xl font-bold text-gray-500 min-h-screen">No Articles Found</h1>
      )}
    </ul>
  );
};

export default MyArticleCard;
