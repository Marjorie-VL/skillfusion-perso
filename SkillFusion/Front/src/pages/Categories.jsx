import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ContainerCategories from "../components/ContainerCategories.jsx";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
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
    <>
      <Header />
      <main>
        <section className="head-banner">
          <h2>Nos catégories</h2>
        </section>

        {loading && <div>Chargement des catégories...</div>}
        {error && <div>Erreur : {error}</div>}
        {!loading && !error && (
          <ContainerCategories categories={categories} />
        )}
      </main>
      <Footer />
    </>
  );
}

