import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import DetailContainer from "../components/DetailContainer.jsx";
import LessonContainer from "../components/LessonContainer.jsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal.jsx";
import { useNavigate } from "react-router-dom";

export default function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
        // Fetch lesson details
    fetch(`${import.meta.env.VITE_API_URL}/lesson/${id}`)
      .then((response) => response.json())
      .then((data) => setLesson(data))
      

    // Fetch all lessons
    fetch(`${import.meta.env.VITE_API_URL}/lessons`)
      .then((response) => response.json())
      .then((data) => setLessons(Array.isArray(data) ? data : data.lessons || []))
        }, [id]);

  useEffect(() => {
    console.log(lessons);
  }, [lessons]);

  if (error) {
    return <p>{error}</p>;
  }



  const fetchAccount = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur réseau ou autorisation");
      setUserData(await response.json());
    } catch (err) {
      (err.message);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAccount();
      } catch (err) {
        (err.message);
      }
    };
    fetchData();
  }, []);

    if (!lesson) {
    return <p>Chargement...</p>;
  }

  const suggestions = lessons
    .filter(
      (l) =>
        l.category?.name === lesson.category?.name && l.name !== lesson.name
    )
    .slice(0, 2);

  // Fonction de suppression
  const handleDelete = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/lesson/${lesson.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    setShowModal(false);
    navigate("/"); // Redirige vers l'accueil ou la liste des cours après suppression
  };

  return (
    <>
      <Header />
      <main>
        <DetailContainer lesson={lesson} key={lesson.id} />

        {userData?.role?.description === "Administrateur" && (
        <>
        <button
          className="main-button"
          onClick={() => navigate(`/lessons`)}
        >
          Retour au catalogue
        </button>
        </>
        )}
        <ConfirmDeleteModal
          show={showModal}
          onCancel={() => setShowModal(false)}
          onConfirm={handleDelete}
          lessonTitle={lesson.name}
        />
        <section>
        <h2>Suggestion de cours :</h2>
          <article className="lessons">
            <LessonContainer lessons={suggestions} />
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
