import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../services/api";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ForumDiscussionDetail() {
  const { id } = useParams(); // récupère l'ID de la question depuis l'URL
  const {user} = useAuth();
  const [question, setQuestion] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestion = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`http://localhost:3000/forum/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur réseau ou autorisation");
        }

        const data = await response.json();
        setQuestion(data.forums);
      } catch (err) {
        toast.error("Impossible de charger la question !" + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id, user]);

  if (loading) return <p>Chargement...</p>;
  if (!question) return <p>Aucune donnée trouvée.</p>;

  // Fonction pour envoyer une réponse
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset erreurs
    const token = localStorage.getItem("token");

    if (!response.trim()) return; // évite les messages vides

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/forum/${id}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: response }),
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
    setResponse(""); // reset le champ
    toast.success("Réponse envoyée !");

     // Re-fetch de la discussion complète avec toutes les réponses à jour
     const updatedRes = await fetch(`${import.meta.env.VITE_API_URL}/forum/${id}`, {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     });

    if (!updatedRes.ok) throw new Error("Erreur lors du rechargement");

    const updatedData = await updatedRes.json();
    setQuestion(updatedData.forums); // on remplace les données par celles à jour

    } catch (error) {
      console.error(error);
      toast.error("Impossible d'envoyer la réponse.");
    }
  }
    // Supprimer une réponse
    
    const handleClickDelete = async (questionId,responseId) => { 
      let isSure = confirm("Etes-vous sûr(e) ?");
      if(!isSure) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/forum/${questionId}/${responseId}`,{
  
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
         // body: JSON.stringify({user }),
        });
          if (!response.ok) {
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
          <h3>{question.title.replace(/^./, (match) => match.toUpperCase())}</h3>
          <section className="category-box">
            <div className="category-box__title">
              <p className="forum-post__datas">
                Créé par : {question.users?.pseudo || "Utilisateur inconnu"}
              </p>
              <p className="forum-post__datas">
                Le : {new Date(question.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="category-box__desc">
              <h4>{question.text.replace(/^./, (match) => match.toUpperCase())}</h4>
              
            </div>
          </section>
        </section>
        {/* Réponses */}
        <section className="list-category">
          {question.responses.map((response) => (
            <section className="category-box" key={response.id}>
              <div className="category-box__title">
                <p className="forum-post__datas">
                  Posté par : {response.users?.pseudo || "Utilisateur inconnu"}
                </p>
                <p className="forum-post__datas">
                  Le : {new Date(response.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="category-box__desc">
                <p>{response.text.replace(/^./, (match) => match.toUpperCase())}</p>

                {/* Affiche les boutons de CRD si l'utilisateur a les droits d'admin*/}
                {user ? (
                  <a onClick={() => handleClickDelete(question.id,response.id)} style={{ cursor: 'pointer' }}>
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
                  id="response"
                  placeholder="Votre message"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  required
                />
              {errors.text && (
                <p style={{ color: "red" }}> {typeof errors.text === "string" ? errors.text : JSON.stringify(errors.text)}</p>)}
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