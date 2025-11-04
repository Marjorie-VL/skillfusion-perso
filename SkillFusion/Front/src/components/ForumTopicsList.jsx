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
      <section className="flex flex-row justify-end items-center w-full h-20 mb-4">
          <Link to="/forum-new-discussion" className="m-4">
            <button className="font-display text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors">
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
                className="h-full w-[75vw] bg-skill-tertiary border border-skill-success/50 rounded mx-4 px-4 flex flex-col justify-center items-center hover:bg-skill-tertiary/70 hover:border-skill-success transition-colors cursor-pointer no-underline text-inherit"
              >
                <h4 className="font-display text-xl md:text-2xl mb-2">{(topic.title || "").replace(/^./, (match) => match.toUpperCase())}</h4>
                <div className="w-full flex flex-col items-center relative">
                  <p className="text-center px-4 w-full text-skill-text-primary">{(topic.content || "").replace(/^./, (match) => match.toUpperCase())}</p>
                  {/* Affiche les boutons de modification/suppression si l'utilisateur est propriétaire ou admin */}
                  {user && (user.id === topic.user_id || user.role_id === 1) && (
                    <div className="absolute top-0 right-0 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleClickEdit(topic.id);
                        }}
                        className="cursor-pointer bg-transparent border-none text-xl text-blue-500 hover:text-blue-700 transition-colors"
                        title="Modifier ce sujet"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleClickDelete(topic.id);
                        }}
                        className="cursor-pointer bg-transparent border-none text-xl text-skill-danger hover:text-red-700 transition-colors"
                        title="Supprimer ce sujet"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
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
