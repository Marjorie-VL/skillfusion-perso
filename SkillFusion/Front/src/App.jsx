import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Lessons from "./pages/Lessons.jsx";
import LessonDetail from "./pages/LessonDetail.jsx";
import Categories from "./pages/Categories.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Contact from "./components/contact.jsx";
import ErrorPage from "./components/ErrorPage.jsx";
import ErrorMaintenance from "./components/ErrorMaintenance.jsx";

import NewLesson from "./components/NewLesson.jsx";
import EditLesson from "./components/EditLesson.jsx";
import NewCategory from "./components/NewCategory.jsx";
import ForumDiscussionDetail from "./components/ForumDiscussionDetail.jsx";
import ForumNewDiscussion from "./components/ForumNewDiscussion.jsx";
import ForumTopicsList from "./components/ForumTopicsList.jsx";
import EditTopic from "./components/EditTopic.jsx";
import EditReply from "./components/EditReply.jsx";
import Board from "./pages/Board.jsx";
import CategoryDetail from "./pages/CategoryDetail.jsx";
import ProfilChange from "./pages/ProfilChanges.jsx";
import RoleChange from "./pages/RoleChange.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ProtectedRoute from "./services/ProtectedRoute.jsx";
import PublicRoute from "./services/PublicRoute.jsx";
import MentionsLegales from "./pages/MentionsLegales.jsx";
import FAQ from "./pages/FAQ.jsx";

export default function App() {
  return (   
      <Routes>

        {/* Routes publiques accessibles à tous */}
        <Route path="/" element={<Home />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lesson/:id" element={<LessonDetail />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:id/lessons" element={<CategoryDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Routes protégées accessibles uniquement si connecté */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
        <Route path="/profil-changes" element={<ProtectedRoute><ProfilChange /></ProtectedRoute>} />
        <Route path="/new-lesson" element={<ProtectedRoute><NewLesson /></ProtectedRoute>} /> 
        <Route path="/edit-lesson/:id" element={<ProtectedRoute><EditLesson /></ProtectedRoute>} /> 
        <Route path="/new-category" element={<ProtectedRoute><NewCategory /></ProtectedRoute>} /> 
        <Route path="/forum/:topicId" element={<ProtectedRoute><ForumDiscussionDetail/></ProtectedRoute>} /> 
        <Route path="/forum/edit/:topicId" element={<ProtectedRoute><EditTopic /></ProtectedRoute>} /> 
        <Route path="/forum/:topicId/edit-reply/:replyId" element={<ProtectedRoute><EditReply /></ProtectedRoute>} /> 
        <Route path="/forum-new-discussion" element={<ProtectedRoute><ForumNewDiscussion /></ProtectedRoute>} /> 
        <Route path="/forum" element={<ProtectedRoute><ForumTopicsList /></ProtectedRoute>} /> 
        <Route path="/roleChange/:id" element={<ProtectedRoute><RoleChange/></ProtectedRoute>} />
        
        {/* Routes accessibles uniquement si NON connecté */}
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Page 404 */}
        <Route path="*" element={< ErrorPage />} /> 

        <Route path="erreurMaintenance" element={< ErrorMaintenance />} /> 


      </Routes>

  );
}
