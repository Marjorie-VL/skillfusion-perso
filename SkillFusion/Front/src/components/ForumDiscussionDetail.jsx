import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../services/api";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ForumDiscussionDetail() {
  const { topicId } = useParams(); // récupère l'ID du sujet de la discussion depuis l'URL
  const {user} = useAuth();
  const [topic, setTopic] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTopic = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/forum/${topicId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur réseau ou autorisation");
        }

        const data = await response.json();
        console.log(data);
        
        setTopic(data);
      } catch (err) {
        toast.error("Impossible de charger la question !" + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  if (loading) return <p>Chargement...</p>;
  if (!topic) return <p>Aucune donnée trouvée.</p>;

  // Fonction pour envoyer une réponse
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset erreurs
    const token = localStorage.getItem("token");

    if (!reply.trim()) return; // évite les messages vides

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/forum/${topicId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: reply }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.error || data.message) {
          toast.error(data.error || data.message);
        } else {
          toast.error("Erreur inconnue lors de la création du message.");
        }
        return;
      }

    // Message de succès
    setReply(""); // reset le champ
    toast.success("Réponse envoyée !");

     // Re-fetch de la discussion complète avec toutes les réponses à jour
     const updatedRes = await fetch(`${import.meta.env.VITE_API_URL}/forum/${topicId}`, {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     });

    if (!updatedRes.ok) throw new Error("Erreur lors du rechargement");

    const updatedData = await updatedRes.json();
    setTopic(updatedData.topics); // on remplace les données par celles à jour

    } catch (error) {
      console.error(error);
      toast.error("Impossible d'envoyer la réponse.");
    }
  }
    // Supprimer une réponse
    
    const handleClickDelete = async (topicId, replyId) => { 
      let isSure = confirm("Etes-vous sûr(e) ?");
      if(!isSure) return;

      try {
        const reply = await fetch(`${import.meta.env.VITE_API_URL}/forum/${topicId}/${replyId}`,{
  
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
         // body: JSON.stringify({user }),
        });
          if (!reply.ok) {
       //     throw new Error("Erreur lors de la suppression du message");
          }
          toast.success("Suppression du message réussie !");

          // Redirection vers la liste des réponses
          navigate(0);


        } catch (err) {
        (err.message);
      }
    }

  return (
    <>
      <Header />
      <main>
        <section className="head-button">
          <Link to="/forum">
            <button className="main-button">
                Retour à la liste des sujets
            </button>
          </Link>
        </section>
        {/* Sujet */}
        <section className="head-banner">
          <h3>{topic.title.replace(/^./, (match) => match.toUpperCase())}</h3>
          <section className="category-box">
            <div className="category-box__title">
              <p className="forum-post__datas">
                Créé par : {topic.users?.user_name || "Utilisateur inconnu"}
              </p>
              <p className="forum-post__datas">
                Le : {new Date(topic.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="category-box__desc">
              <h4>{topic.content.replace(/^./, (match) => match.toUpperCase())}</h4>
              
            </div>
          </section>
        </section>
        {/* Réponses */}
        <section className="list-category">
          {topic.replies.map((reply) => (
            <section className="category-box" key={reply.id}>
              <div className="category-box__title">
                <p className="forum-post__datas">
                  Posté par : {reply.users?.user_name || "Utilisateur inconnu"}
                </p>
                <p className="forum-post__datas">
                  Le : {new Date(reply.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="category-box__desc">
                <p>{reply.content.replace(/^./, (match) => match.toUpperCase())}</p>

                {/* Affiche les boutons de CRD si l'utilisateur a les droits d'admin*/}
                {user ? (
                  <a onClick={() => handleClickDelete(topic.id,reply.id)} style={{ cursor: 'pointer' }}>
                    <div className="crud">
                      <p></p>
                      <h4>{((user.role_id === 1)) ?("\ud83d\uddd1"):(" ")}</h4>
                    </div>
                  </a>
                  ):(
                  <p></p>
                  )
                }
              </div>
            </section>
          ))}

          {/* Formulaire pour envoyer une réponse */}
          <section className="forum-post__form">
            <form onSubmit={handleSubmit}>
              <div className="forum-post__textarea">
                <textarea
                  id="reply"
                  placeholder="Votre message"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  required
                />
              {errors.content && (
                <p style={{ color: "red" }}> {typeof errors.content === "string" ? errors.content : JSON.stringify(errors.content)}</p>)}
              </div>
              <div className="forum-post__button">
                <button className="main-button" type="submit">
                  Envoyer
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}