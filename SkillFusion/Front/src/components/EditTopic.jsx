import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { toast } from "react-toastify";
import { forumService } from "../services/forumService.js";
import { useAuth } from "../services/api.jsx";

export default function EditTopic() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Charger les données du sujet à modifier
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const topic = await forumService.getTopicById(topicId);
        
        // Vérifier que l'utilisateur peut modifier ce sujet
        if (user.id !== topic.user_id && user.role_id !== 1) {
          toast.error("Vous n'avez pas l'autorisation de modifier ce sujet");
          navigate("/forum");
          return;
        }

        setTitle(topic.title);
        setContent(topic.content);
      } catch (err) {
        console.error("❌ Erreur récupération sujet →", err);
        toast.error("Erreur lors du chargement du sujet");
        navigate("/forum");
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await forumService.updateTopic(topicId, { title, content });
      toast.success("Sujet modifié avec succès !");
      navigate(`/forum/${topicId}`);
    } catch (err) {
      console.error("❌ Erreur modification sujet →", err);
      
      if (err.response && err.response.data) {
        const { data } = err.response;
        
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de la modification du sujet");
        }
      } else if (err.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex flex-col justify-between items-center mb-4">
          <div className="text-center p-8">
            <p>Chargement...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex flex-col justify-between items-center mb-4">
        <section className="flex flex-col justify-center items-center">
          <h2 className="font-display text-center text-2xl md:text-4xl my-8">Modifier le sujet</h2>
        </section>

        <section className="w-screen flex flex-col md:flex-row md:flex-wrap justify-center items-center">
          <form onSubmit={handleSubmit} className="w-full max-w-[850px] flex flex-col items-center">
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="title" className="text-xl md:text-2xl mb-1">Sujet :</label>
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                type="text"
                id="title"
                placeholder="Titre du sujet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {errors.title && <p className="text-red-600 text-sm mt-2">{errors.title}</p>}
            </div>

            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="content" className="text-xl md:text-2xl mb-1">Message :</label>
              <textarea
                id="content"
                placeholder="Message"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="h-32 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent resize-y"
              ></textarea>
              {errors.text && <p className="text-red-600 text-sm mt-2">{errors.text}</p>}
            </div>

            <section className="flex flex-row justify-center items-center gap-4">
              <button 
                type="submit" 
                className="font-display text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors"
              >
                Modifier le sujet
              </button>
              <button 
                type="button" 
                className="font-display text-xl md:text-2xl py-2 px-4 bg-gray-600 text-white w-[20vw] m-4 rounded hover:bg-gray-700 transition-colors" 
                onClick={() => navigate(`/forum/${topicId}`)}
              >
                Annuler
              </button>
            </section>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
