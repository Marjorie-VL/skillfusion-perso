import React from "react";

export default function DetailContainer({ lesson }) {
  return (
    <>
      <section className="lesson">
        <h2> {lesson.name}</h2>
        <div className="lesson-introduction__img">
          <img
            className="image-lesson"
            src={`/Images/Photos/${lesson.media}`}
            alt="Image du résultat final du cours"
          />
        </div>
        <p className="lesson__description">{lesson.text}</p>
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
                <img
                    className="image-lesson"
                    src={`/Images/Photos/${step.media}`}
                    alt="Image du résultat final de l'étape"
                  />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
