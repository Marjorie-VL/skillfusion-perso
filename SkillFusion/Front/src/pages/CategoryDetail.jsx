import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LessonContainer from "../components/LessonContainer";

export default function CategoryPage() {
  const { id } = useParams(); // Récupère l'ID de la catégorie
  const [lessons, setLessons] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchCategoryLessons = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/categories/${id}/lessons`
        );
        const data = await res.json();
        if (data.lessons) {
          setLessons(data.lessons);
          setCategoryName(data.categoryName || "Nom de la catégorie");
        }
        setLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des cours de la catégorie :",
          error
        );
        setLoading(false);
      }
    };


    fetchCategoryLessons();
  }, [id]);

  return (
    <>
      <Header />
      <main>
        <section className="home__articles">
          <h2>{loading ? "Chargement..." : categoryName}</h2>
          <article className="lessons">
            {loading && <p>Chargement des cours...</p>}
            {lessons.length > 0 ? (
              <LessonContainer lessons={lessons} categoryName={categoryName}/>
            ) : (
              <p>Aucun cours disponible pour cette catégorie.</p>
            )}
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
