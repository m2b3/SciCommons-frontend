import './App.css';
import Home from './Pages/Home/Home';
import Login from './Pages/Login/Login';
import Register from './Pages/Register/Register';
import ErrorPage from './Pages/ErrorPage/ErrorPage';
import AllArticlesPage from './Pages/AllArticlesPage/AllArticlesPage';
import Communities from './Pages/Communities/Communities';
import SubmitArticle from './Pages/SubmitArticle/SubmitArticle';
import SuccessfulSubmission from './Components/SuccessfulSubmission';
import SuccessfulRegistration from './Components/SuccessfulRegistration';
import CommunityCreation from './Components/CommunityCreation';
import CreateCommunity from './Pages/CreateCommunity/CreateCommunity';
import Notifications from './Pages/Notifications/Notifications';
import Feed from './Pages/Feed/Feed';
import CommunityPage from './Pages/CommunityPage/CommunityPage';
import JoinRequest from './Pages/JoinRequest/JoinRequest';
import SinglePost from './Pages/SinglePost/SinglePost';
import CommunityAdminPage from './Pages/CommunityAdminPage/CommunityAdminPage';
import Profile from './Pages/Profile/Profile';
import Timeline from './Pages/Timeline/Timeline';
import BookMarks from './Pages/Bookmarks/Bookmarks';
import ArticlePage from './Pages/ArticlePage/ArticlePage';
import FavouritePage from './Pages/FavouritePage/FavouritePage';
import MyPostsPage from './Pages/MyPostsPage/MyPostsPage';
import MyArticlesPage from './Pages/MyArticlesPage/MyArticlesPage';
import AuthorArticlePage from './Pages/AuthorArticlePage/AuthorArticlePage';
import CommunityArticlePage from './Pages/CommunityArticlePage/CommunityArticlePage';
import MyProfile from './Pages/MyProfile/MyProfile';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import Verify from './Pages/Verify/Verify';
import PrivateRoute from './Pages/PrivateRoute/PrivateRoute';
// import AllMessages from './Pages/AllMessagesPage/AllMessagesPage';
import ChatPage from './Pages/ChatPage/ChatPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/articles' element={<AllArticlesPage />} />
        <Route path='/communities' element={<Communities/>}/>
        <Route path='/submitarticle' element={<PrivateRoute redirectTo="/login" component={<SubmitArticle/>}/>}/>
        <Route path='/articlesuccessfulsubmission' element={<PrivateRoute redirectTo="/login" component={<SuccessfulSubmission/>}/>}/>
        <Route path='/registersuccessful' element={<PrivateRoute redirectTo="/login" component={<SuccessfulRegistration/>}/>}/>
        <Route path='/createcommunity' element={<PrivateRoute redirectTo="/login" component={<CreateCommunity/>}/>}/>
        <Route path='/communitysuccessfulcreated' element={<PrivateRoute redirectTo="/login" component={<CommunityCreation/>}/>}/>
        <Route path='/notifications' element={<PrivateRoute redirectTo="/login" component={<Notifications/>}/>}/>
        <Route path='/explore' element={<Feed/>}/>
        <Route path='/mytimeline' element={<PrivateRoute redirectTo="/login" component={<Timeline/>}/>}/>
        <Route path='/bookmarks' element={<PrivateRoute redirectTo="/login" component={<BookMarks/>}/>}/>
        <Route path="/community/:communityName" element={<CommunityPage/>}/>
        <Route path="/join-community/:communityName" element={<PrivateRoute redirectTo="/login" component={<JoinRequest/>}/>}/>
        <Route path="/mycommunity" element={<PrivateRoute redirectTo="/login" component={<CommunityAdminPage/>}/>}/>
        <Route path="/post/:postId" element={<SinglePost/>}/>
        <Route path="/profile/:username" element={<Profile/>}/>
        <Route path="/article/:articleId" element={<ArticlePage/>}/>
        <Route path="/favourites" element={<PrivateRoute redirectTo="/login" component={<FavouritePage/>}/>} />
        <Route path="/myposts" element={<PrivateRoute redirectTo="/login" component={<MyPostsPage/>}/>}/>
        <Route path="/myarticles" element={<PrivateRoute redirectTo="/login" component={<MyArticlesPage/>}/>}/>
        <Route path="/myarticles/:articleId" element={<PrivateRoute redirectTo="/login" component={<AuthorArticlePage/>} />}/>
        {/* <Route path="/myactivity" element={<PrivateRoute redirectTo="/login" component={<UserActivity/>}/>}/> */}
        <Route path="/community/:communityName/:articleId" element={<PrivateRoute redirectTo="/login" component={<CommunityArticlePage/>}/>}/>
        <Route path="/chat/:id" element={<PrivateRoute redirectTo="/login" component={<ChatPage/>}/>}/>
        {/* <Route path="/messages" element={<PrivateRoute redirectTo="/login" component={<AllMessages/>}/>}/> */}
        <Route path="/myprofile" element={<PrivateRoute redirectTo="/login" component={<MyProfile/>}/>}/> 
        <Route path="/forgotpassword" element={<ForgotPassword/>}/>
        <Route path="/verify" element={<Verify/>}/>
        <Route path = "*" element={<ErrorPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
