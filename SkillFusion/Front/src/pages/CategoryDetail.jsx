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
          `${import.meta.env.VITE_API_URL}/api/categories/${id}/lessons`
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

  // Rafraîchir les données quand on revient sur la page (focus)
  useEffect(() => {
    const handleFocus = () => {
      const fetchCategoryLessons = async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/categories/${id}/lessons`
          );
          const data = await res.json();
          if (data.lessons) {
            setLessons(data.lessons);
            setCategoryName(data.categoryName || "Nom de la catégorie");
          }
        } catch (error) {
          console.error("Erreur lors du rafraîchissement:", error);
        }
      };
      fetchCategoryLessons();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id]);

  return (
    <>
      <Header />
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] mb-8">
        <section className="max-w-[95%] flex flex-col justify-center items-center">
          <h2 className="font-display text-center text-2xl md:text-4xl my-8">{loading ? "Chargement..." : categoryName}</h2>
          <article className="w-full">
            {loading && <p className="text-center p-8 text-skill-text-primary">Chargement des cours...</p>}
            {lessons.length > 0 ? (
              <LessonContainer lessons={lessons} categoryName={categoryName}/>
            ) : (
              <p className="text-center p-8 text-skill-text-primary">Aucun cours disponible pour cette catégorie.</p>
            )}
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
