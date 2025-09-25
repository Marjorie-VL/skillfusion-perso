import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { toast } from "react-toastify";

export default function ForumNewDiscussion() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset erreurs


    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forum`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, content: content }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.error || data.message) {
          toast.error(data.error || data.message);
        } else {
          toast.error("Erreur inconnue lors de la création du sujet.");
        }
        return;
      }

      // Message de succès et redirection
      toast.success("Sujet créé avec succès !");
      navigate("/forum");
    } catch (err) {
      console.error("❌ Erreur création sujet →", err.message);
      toast.error("Erreur lors de la création du sujet : " + err.message);
    }
  };

  return (
    <>
      <Header />
      <main>
        <section className="head-banner">
          <h2>Nouveau sujet</h2>
        </section>

        <section className="lessons">
          <form onSubmit={handleSubmit}>
            <div className="form">
              <label htmlFor="title">Sujet :</label>
              <input
                className="search-bar input-bar"
                type="text"
                id="title"
                placeholder="Titre du sujet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {errors.title && <p style={{ color: "red" }} className="text-red-500">{errors.title}</p>}
            </div>

            <div className="form">
              <label htmlFor="new-discussion">Message :</label>
              <textarea
                id="new-discussion"
                placeholder="Message"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              {errors.text && <p style={{ color: "red" }} className="text-red-500">{errors.text}</p>}
            </div>

            <div className="see-more">
              <button type="submit" className="main-button">
                Envoyer
              </button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}