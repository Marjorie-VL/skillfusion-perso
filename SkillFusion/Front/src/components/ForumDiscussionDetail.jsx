import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../services/api";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forumService } from "../services/forumService.js";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";
// import { useNavigate } from "react-router-dom"; // Non utilisé pour le moment

export default function ForumDiscussionDetail() {
  const { topicId } = useParams(); // récupère l'ID du sujet de la discussion depuis l'URL
  const {user} = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false);
  const [showDeleteReplyModal, setShowDeleteReplyModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ topicId: null, replyId: null });
  
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        console.log("🌐 Récupération du topic:", topicId);
        const data = await forumService.getTopicById(topicId);
        console.log("📊 Données reçues du backend:", data);
        console.log("📊 Structure des données:", {
          id: data.id,
          title: data.title,
          content: data.content,
          user: data.user,
          replies: data.replies,
          repliesCount: data.replies?.length || 0
        });
        
        setTopic(data);
      } catch (err) {
        console.error("❌ Erreur récupération →", err);
        
        if (err.response && err.response.status === 401) {
          console.error("❌ Token invalide ou expiré");
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          toast.error("Impossible de charger la question ! " + (err.response?.data?.error || err.message));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  if (loading) return (
    <>
      <Header />
      <main className="flex flex-col justify-between items-center mb-4">
        <div className="text-center p-8">
          <p className="text-skill-text-primary">Chargement...</p>
        </div>
      </main>
      <Footer />
    </>
  );
  if (!topic) return (
    <>
      <Header />
      <main className="flex flex-col justify-between items-center mb-4">
        <div className="text-center p-8">
          <p className="text-skill-text-primary">Aucune donnée trouvée.</p>
        </div>
      </main>
      <Footer />
    </>
  );
  
  // Debug: Vérifier la structure du topic
  console.log("🔍 Topic actuel:", topic);
  console.log("🔍 Topic.replies:", topic.replies);

  // Fonction pour envoyer une réponse
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset erreurs

    if (!reply.trim()) return; // évite les messages vides

    try {
      await forumService.addReply(topicId, { content: reply });

      // Message de succès
      setReply(""); // reset le champ
      toast.success("Réponse envoyée !");

      // Re-fetch de la discussion complète avec toutes les réponses à jour
      const updatedData = await forumService.getTopicById(topicId);
      console.log("🔄 Données mises à jour après ajout de réponse:", updatedData);
      setTopic(updatedData);

    } catch (error) {
      console.error("❌ Erreur ajout réponse →", error);
      
      if (error.response && error.response.data) {
        const { data } = error.response;
        
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de l'envoi de la réponse");
        }
      } else if (error.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    }
    }

    // Modifier une réponse
    const handleClickEditReply = (topicId, replyId) => {
      navigate(`/forum/${topicId}/edit-reply/${replyId}`);
    };

    // Supprimer un sujet
    const handleClickDeleteTopic = (topicId) => { 
      setDeleteTarget({ topicId, replyId: null });
      setShowDeleteTopicModal(true);
    };

    const confirmDeleteTopic = async () => {
      try {
        await forumService.deleteTopic(deleteTarget.topicId);
        toast.success("Sujet supprimé avec succès !");
        setShowDeleteTopicModal(false);
        navigate("/forum");
      } catch (err) {
        console.error("❌ Erreur suppression →", err);
        toast.error("Erreur lors de la suppression : " + (err.response?.data?.error || err.message));
        setShowDeleteTopicModal(false);
      }
    };

    // Supprimer une réponse
    const handleClickDelete = (topicId, replyId) => { 
      setDeleteTarget({ topicId, replyId });
      setShowDeleteReplyModal(true);
    };

    const confirmDeleteReply = async () => {
      try {
        await forumService.deleteReply(deleteTarget.topicId, deleteTarget.replyId);
        toast.success("Réponse supprimée avec succès !");
        setShowDeleteReplyModal(false);

        // Re-fetch de la discussion complète avec toutes les réponses à jour
        const updatedData = await forumService.getTopicById(deleteTarget.topicId);
        setTopic(updatedData);
      } catch (err) {
        console.error("❌ Erreur suppression →", err);
        toast.error("Erreur lors de la suppression : " + (err.response?.data?.error || err.message));
        setShowDeleteReplyModal(false);
      }
    };

  return (
    <>
      <Header />
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] mb-8">
        <section className="flex flex-row justify-end items-center w-full h-20 mb-4 px-4">
          <Link to="/forum" className="m-2 sm:m-4">
            <button className="font-display text-base sm:text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-full sm:w-auto min-w-[200px] sm:min-w-[250px] rounded hover:bg-skill-accent transition-colors">
                Retour à la liste des sujets
            </button>
          </Link>
        </section>
        {/* Sujet */}
        <section className="flex flex-col justify-center items-center w-full mb-8">
          <h3 className="font-display text-center text-2xl md:text-4xl mb-4">{topic.title.replace(/^./, (match) => match.toUpperCase())}</h3>
          <section className="h-32 my-4 flex flex-row justify-center items-center w-full">
            <div className="w-40 h-full bg-skill-primary border-2 border-skill-secondary rounded-lg m-4 flex flex-col justify-center items-center p-2">
              <p className="text-sm text-skill-text-primary text-center mb-1">
                Créé par : {topic.user?.user_name?.replace(/^./, (match) => match.toUpperCase()) || "Utilisateur inconnu"}
              </p>
              <p className="text-sm text-skill-text-primary text-center mb-1">
                Le : {new Date(topic.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="h-full w-[75vw] bg-skill-tertiary border border-skill-success/50 rounded mx-4 px-3 sm:px-4 flex flex-col justify-center items-start relative overflow-hidden">
              {/* Affiche les boutons de modification/suppression si l'utilisateur est propriétaire ou admin */}
              {user && (user.id === topic.user_id || user.role_id === 1) && (
                <div className="absolute top-2 right-2 flex gap-1 sm:gap-2 z-10">
                  <button 
                    onClick={() => navigate(`/forum/edit/${topic.id}`)} 
                    className="bg-skill-secondary text-white p-1 sm:p-1.5 rounded-lg hover:bg-skill-accent transition-colors cursor-pointer shadow-md active:scale-95 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
                    title="Modifier ce sujet"
                    aria-label="Modifier ce sujet"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleClickDeleteTopic(topic.id)} 
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
              <div className={`flex-1 min-w-0 w-full pr-0 sm:pr-12 ${user && (user.id === topic.user_id || user.role_id === 1) ? 'pt-10 sm:pt-12' : ''}`}>
                <h4 className="font-display text-base sm:text-xl md:text-2xl mb-2 text-skill-text-primary break-words">{topic.content.replace(/^./, (match) => match.toUpperCase())}</h4>
              </div>
            </div>
          </section>
        </section>
        {/* Réponses */}
        <section className="flex flex-col justify-center items-center w-full mb-8">
          {topic.replies && topic.replies.length > 0 ? (
            topic.replies.map((reply) => (
            <section className="h-32 my-4 flex flex-row justify-center items-center w-full" key={reply.id}>
              <div className="w-40 h-full bg-skill-primary border-2 border-skill-secondary rounded-lg m-4 flex flex-col justify-center items-center p-2">
                <p className="text-sm text-skill-text-primary text-center mb-1">
                  Posté par : {reply.user?.user_name?.replace(/^./, (match) => match.toUpperCase()) || "Utilisateur inconnu"}
                </p>
                <p className="text-sm text-skill-text-primary text-center mb-1">
                  Le : {new Date(reply.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="h-full w-[75vw] bg-skill-tertiary/50 border border-skill-success/50 rounded mx-4 px-3 sm:px-4 flex flex-col justify-center items-start relative overflow-hidden">
                {/* Affiche les boutons de modification/suppression si l'utilisateur est propriétaire ou admin */}
                {user && (user.id === reply.user_id || user.role_id === 1) && (
                  <div className="absolute top-2 right-2 flex gap-1 sm:gap-2 z-10">
                    <button 
                      onClick={() => handleClickEditReply(topic.id, reply.id)} 
                      className="bg-skill-secondary text-white p-1 sm:p-1.5 rounded-lg hover:bg-skill-accent transition-colors cursor-pointer shadow-md active:scale-95 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
                      title="Modifier cette réponse"
                      aria-label="Modifier cette réponse"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleClickDelete(topic.id, reply.id)} 
                      className="bg-red-600 text-white p-1 sm:p-1.5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow-md active:scale-95 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
                      title="Supprimer cette réponse"
                      aria-label="Supprimer cette réponse"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className={`flex-1 min-w-0 w-full pr-0 sm:pr-12 ${user && (user.id === reply.user_id || user.role_id === 1) ? 'pt-10 sm:pt-12' : ''}`}>
                  <p className="text-justify text-sm sm:text-base px-2 sm:px-4 text-skill-text-primary break-words">{reply.content.replace(/^./, (match) => match.toUpperCase())}</p>
                </div>
              </div>
            </section>
            ))
          ) : (
            <p className="text-center text-skill-text-secondary italic p-8">
              Aucune réponse pour le moment. Soyez le premier à répondre !
            </p>
          )}

          {/* Formulaire pour envoyer une réponse */}
          <section className="w-full max-w-[850px] flex flex-col items-center mt-8">
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
              <div className="w-3/4 mb-4">
                <label htmlFor="reply" className="text-xl md:text-2xl mb-1 block text-skill-text-primary font-display font-semibold">Votre réponse :</label>
                <textarea
                  id="reply"
                  placeholder="Votre message"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  required
                  className="h-32 text-base md:text-xl p-1 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent resize-y"
                />
              {errors.content && (
                <p className="text-skill-danger text-sm mt-2"> {typeof errors.content === "string" ? errors.content : JSON.stringify(errors.content)}</p>)}
              </div>
              <div className="flex justify-center w-full">
                <button 
                  className="font-display text-base sm:text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-full sm:w-auto min-w-[200px] sm:min-w-[250px] m-4 rounded hover:bg-skill-accent transition-colors" 
                  type="submit"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
      <Footer />
      
      {/* Modale de confirmation suppression sujet */}
      <ConfirmDeleteModal
        show={showDeleteTopicModal}
        onCancel={() => setShowDeleteTopicModal(false)}
        onConfirm={confirmDeleteTopic}
        title="Supprimer le sujet"
        message="Êtes-vous sûr(e) de vouloir supprimer ce sujet ? Cette action supprimera également toutes les réponses associées."
      />

      {/* Modale de confirmation suppression réponse */}
      <ConfirmDeleteModal
        show={showDeleteReplyModal}
        onCancel={() => setShowDeleteReplyModal(false)}
        onConfirm={confirmDeleteReply}
        title="Supprimer la réponse"
        message="Êtes-vous sûr(e) de vouloir supprimer cette réponse ?"
      />
    </>
  );
}
