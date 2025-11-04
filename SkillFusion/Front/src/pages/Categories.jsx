import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ContainerCategories from "../components/ContainerCategories.jsx";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupère la liste de toutes les catégories
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des catégories");
        }
        return response.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-col justify-center items-center mb-4 flex-grow">
        <section className="flex flex-col justify-center items-center w-full">
          <h2 className="font-display text-center text-2xl md:text-4xl my-8">Nos catégories</h2>
          
          {loading && <div className="text-center p-8 text-skill-text-primary">Chargement des catégories...</div>}
          {error && <div className="text-center p-8 text-skill-danger">Erreur : {error}</div>}
          {!loading && !error && (
            <ContainerCategories categories={categories} />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

