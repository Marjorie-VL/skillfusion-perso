import React from "react";

export default function DetailContainer({ lesson }) {
  console.log(lesson.materials);
  
  return (
    <>
      <section className="lesson">
        <h2> {lesson.title}</h2>
        <p className="instructor-info" style={{ 
          fontSize: '1rem', 
          color: '#666', 
          margin: '0.5rem 0',
          fontStyle: 'italic'
        }}>
          Créé par {lesson.user?.user_name || 'Instructeur inconnu'}
        </p>
        <div className="lesson-introduction__img">
          {lesson.media_url ? (
            lesson.media_url.startsWith('/uploads/') ? (
              <img
                className="image-lesson"
                src={`${import.meta.env.VITE_API_URL}${lesson.media_url}`}
                alt={lesson.media_alt || "Image du résultat final du cours"}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : lesson.media_url.startsWith('http') ? (
              <img
                className="image-lesson"
                src={lesson.media_url}
                alt={lesson.media_alt || "Image du résultat final du cours"}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : (
              <img
                className="image-lesson"
                src={`/Images/Photos/${lesson.media_url}`}
                alt={lesson.media_alt || "Image du résultat final du cours"}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            )
          ) : (
            <div className="no-image-placeholder">
              <p>Aucune image disponible</p>
            </div>
          )}
          <div className="no-image-placeholder" style={{ display: 'none' }}>
            <p>Image non disponible</p>
          </div>
        </div>
        <p className="lesson__description">{lesson.description}</p>
      </section>
      <section className="lesson">
        <h3>Matériaux nécessaires :</h3>
        <ul>
          {lesson.materials.map((material, index) => (
            <li key={index}>{material.name}</li>
          ))}
        </ul>
      </section>

      <section className="lesson">
        <h3>Etapes à suivre:</h3>
        {lesson.steps.map((step, index) => (
          <div className="steps" key={step.id}>
            <div className ="steps__desc">
              <div className="steps__title" key={step.id}>
                <h4>
                  Etape {index + 1}: {step.title}
                </h4>
              </div>
              <p>{step.description}</p>
            </div>
            <div className="steps__img">
                {step.media_url ? (
                  step.media_url.startsWith('/uploads/') ? (
                    <img
                      className="image-lesson"
                      src={`${import.meta.env.VITE_API_URL}${step.media_url}`}
                      alt={step.media_alt || "Image de l'étape"}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : step.media_url.startsWith('http') ? (
                    <img
                      className="image-lesson"
                      src={step.media_url}
                      alt={step.media_alt || "Image de l'étape"}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <img
                      className="image-lesson"
                      src={`/Images/Photos/${step.media_url}`}
                      alt={step.media_alt || "Image de l'étape"}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  )
                ) : (
                  <div className="no-image-placeholder">
                    <p>Aucune image pour cette étape</p>
                  </div>
                )}
                <div className="no-image-placeholder" style={{ display: 'none' }}>
                  <p>Image non disponible</p>
                </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
