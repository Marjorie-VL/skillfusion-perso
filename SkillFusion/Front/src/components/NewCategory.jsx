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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`, {
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
      <main className="flex flex-col justify-between items-center mb-4">
        <section className="flex flex-col justify-center items-center">
          <h2 className="font-['Lobster'] text-center text-2xl md:text-4xl my-8">Nouvelle catégorie</h2>
        </section>
        <section className="w-screen flex flex-col md:flex-row md:flex-wrap justify-center items-center">
          <form onSubmit={handleSubmit} className="w-full max-w-[850px] flex flex-col items-center">
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="name" className="text-xl md:text-2xl mb-1">Nom de la catégorie :</label>
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                type="text"
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nouvelle catégorie"
                required
              />
            </div>
            {errors.name && <p className="text-red-600 text-sm mt-2">{errors.name}</p>}
            <section className="flex flex-row justify-center items-center">
            <button 
              type="submit" 
              className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors"
            >
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
  