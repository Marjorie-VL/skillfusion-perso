import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function NewCategoryForm() {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset erreurs

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name: categoryName }),
        });


      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.error || data.message) {
          toast.error(data.error || data.message);
        } else {
          toast.error("Erreur inconnue lors de la création de la catégorie.");
        }
        return;
      }

      toast.success("Catégorie créée !");
      setCategoryName("");
      navigate("/categories");
    } catch (err) {
      toast.error("Erreur réseau : " + err.message);
    }
  };

  return (
    <>
      <Header />
      <main>
        <section className="head-banner">
          <h2>Nouvelle catégorie</h2>
        </section>
        <section className="lessons">
          <form onSubmit={handleSubmit}>
            <div className="form">
              <label htmlFor="name">Nom de la catégorie :</label>
              <input
                className="search-bar input-bar"
                type="text"
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nouvelle catégorie"
                required
              />
            </div>
            {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
            <section className="see-more">
            <button type="submit" className="main-button">
                Envoyer
              </button>
            </section>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};
  