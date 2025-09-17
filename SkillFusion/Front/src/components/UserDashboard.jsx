import React from "react";
import LessonContainer from "../components/LessonContainer";

export default function UserDashboard({ favoriteLessons = [], user }) {

  return (
    <>
      <h2>Mes leçons favorites</h2>
      {favoriteLessons.length === 0 ? (
        <p>Vous n'avez pas encore ajouté de leçons en favoris.</p>
      ) : (
      <LessonContainer
        lessons={favoriteLessons}
        showCrud={false} // Pas d'édition ou suppression ici
        user={user}
      />
      )}
    </>
  );
}
