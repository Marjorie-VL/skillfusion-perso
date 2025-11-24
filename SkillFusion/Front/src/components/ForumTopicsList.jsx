import React, { useState, useEffect} from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { toast } from "react-toastify";
import { forumService } from "../services/forumService.js";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";


export default function ForumTopicsList({topics}) {

  const [topicsList, setTopicsList] = useState(Array.isArray(topics) ? topics : []);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Récupération des données utilisateur
  const {user} = useAuth();

  // Récupération de la liste des sujets
useEffect(() => {
  const fetchTopics = async () => {
    try {
      const data = await forumService.getAllTopics();
      console.log(data);

      setTopicsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(" Erreur de récupération :", err);
    }
  };
  
  fetchTopics();
}, []);

  // Modifier un sujet
  const handleClickEdit = (topicId) => {
    navigate(`/forum/edit/${topicId}`);
  };

  // Supprimer un sujet
  const handleClickDelete = (topicId) => { 
    setDeleteTargetId(topicId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await forumService.deleteTopic(deleteTargetId);
      
      // Mise à jour de la liste locale après suppression
      setTopicsList((prev) => prev.filter((topic) => topic.id !== deleteTargetId));
      toast.success("Sujet supprimé avec succès !");
      setShowDeleteModal(false);
    } catch (err) {
      console.error("❌ Erreur suppression →", err);
      toast.error("Erreur lors de la suppression : " + (err.response?.data?.error || err.message));
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] mb-8">
      <section className="flex flex-row justify-end items-center w-full h-20 mb-4 px-4">
          <Link to="/forum-new-discussion" className="m-2 sm:m-4">
            <button className="font-display text-base sm:text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-full sm:w-auto min-w-[200px] sm:min-w-[250px] rounded hover:bg-skill-accent transition-colors">
            Créer un nouveau sujet
            </button>
          </Link>
        </section>
        <section className="flex flex-col justify-center items-center">
          <h2 className="font-display text-center text-2xl md:text-4xl my-8">Nos sujets</h2>
        </section>

        <section className="flex flex-col justify-center items-center w-full mb-8">       
          {topicsList.length === 0 ? (
            <p className="text-center p-8 text-skill-text-primary">Aucun sujet pour le moment.</p>
          ) : topicsList.map((topic) => (
            <section className="h-32 my-4 flex flex-row justify-center items-center w-full" key={topic.id}>
              <Link
                to={`/forum/${topic.id}`}
                className="h-full w-[75vw] bg-skill-tertiary border border-skill-success/50 rounded mx-4 px-3 sm:px-4 flex flex-col justify-center items-center hover:bg-skill-tertiary/70 hover:border-skill-success transition-colors cursor-pointer no-underline text-inherit relative overflow-hidden"
              >
                {/* Affiche les boutons de modification/suppression si l'utilisateur est propriétaire ou admin */}
                {user && (user.id === topic.user_id || user.role_id === 1) && (
                  <div className="absolute top-2 right-2 flex gap-1 sm:gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClickEdit(topic.id);
                      }}
                      className="bg-skill-secondary text-white p-1 sm:p-1.5 rounded-lg hover:bg-skill-accent transition-colors cursor-pointer shadow-md active:scale-95 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
                      title="Modifier ce sujet"
                      aria-label="Modifier ce sujet"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClickDelete(topic.id);
                      }}
                      className="bg-red-600 text-white p-1 sm:p-1.5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow-md active:scale-95 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
                      title="Supprimer ce sujet"
                      aria-label="Supprimer ce sujet"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
                <h4 className={`font-display text-base sm:text-xl md:text-2xl mb-2 text-center w-full px-2 ${user && (user.id === topic.user_id || user.role_id === 1) ? 'pt-10 sm:pt-12' : ''}`}>{(topic.title || "").replace(/^./, (match) => match.toUpperCase())}</h4>
                <div className="w-full flex flex-col items-center">
                  <p className="text-center px-2 sm:px-4 w-full text-sm sm:text-base text-skill-text-primary break-words">{(topic.content || "").replace(/^./, (match) => match.toUpperCase())}</p>
                </div>
              </Link>
            </section>
          ))}
        </section>
      </main>
      <Footer />
      
      {/* Modale de confirmation suppression sujet */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer le sujet"
        message="Êtes-vous sûr(e) de vouloir supprimer ce sujet ?"
      />
    </>
  );
}
