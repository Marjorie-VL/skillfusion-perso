import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { toast } from "react-toastify";
import { forumService } from "../services/forumService.js";

export default function ForumNewDiscussion() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset erreurs


    try {
      await forumService.createTopic({ title, content });

      // Message de succès et redirection
      toast.success("Sujet créé avec succès !");
      navigate("/forum");
    } catch (err) {
      console.error("❌ Erreur création sujet →", err);
      
      if (err.response && err.response.data) {
        const { data } = err.response;
        
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de la création du sujet");
        }
      } else if (err.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    }
  };

  return (
    <>
      <Header />
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] mb-8">
        <section className="flex flex-col justify-center items-center">
          <h2 className="font-display text-center text-2xl md:text-4xl my-8">Nouveau sujet</h2>
        </section>

        <section className="w-full max-w-[900px] mx-auto px-4">
          <div className="bg-skill-tertiary border-2 border-skill-success/50 rounded-lg p-6 md:p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="title" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">Sujet :</label>
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
              <label htmlFor="new-discussion" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">Message :</label>
              <textarea
                id="new-discussion"
                placeholder="Message"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="h-32 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent resize-y"
              ></textarea>
              {errors.text && <p className="text-red-600 text-sm mt-2">{errors.text}</p>}
            </div>

            <section className="flex flex-row justify-center items-center w-full">
              <button 
                type="submit" 
                className="font-display text-base sm:text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-full sm:w-auto min-w-[200px] sm:min-w-[250px] m-4 rounded hover:bg-skill-accent transition-colors"
              >
                Envoyer
              </button>
            </section>
          </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
