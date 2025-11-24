import React from "react";

export default function DetailContainer({ lesson }) {
  console.log(lesson.materials);
  
  return (
    <>
      <section className="flex flex-col w-full sm:w-4/5 mx-auto px-4 sm:px-0">
        <h2 className="font-display text-center text-xl sm:text-2xl md:text-4xl mb-4"> {lesson.title}</h2>
        <p className="text-sm sm:text-base text-skill-text-secondary my-2 italic">
          Créé par {lesson.user?.user_name?.replace(/^./, (match) => match.toUpperCase()) || 'Instructeur inconnu'}
        </p>
        <div className="max-w-full max-h-60 sm:max-h-80 overflow-hidden border border-skill-secondary my-4 shadow-lg rounded-lg">
          {lesson.media_url ? (
            lesson.media_url.startsWith('/uploads/') ? (
              <img
                className="w-full h-full object-cover object-[50%_50%]"
                src={`${import.meta.env.VITE_API_URL}${lesson.media_url}`}
                alt={lesson.media_alt || "Image du résultat final du cours"}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : lesson.media_url.startsWith('http') ? (
              <img
                className="w-full h-full object-cover object-[50%_50%]"
                src={lesson.media_url}
                alt={lesson.media_alt || "Image du résultat final du cours"}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : (
              <img
                className="w-full h-full object-cover object-[50%_50%]"
                src={`/Images/Photos/${lesson.media_url}`}
                alt={lesson.media_alt || "Image du résultat final du cours"}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            )
          ) : (
            <div className="p-4">
              <p>Aucune image disponible</p>
            </div>
          )}
          <div className="p-4 hidden">
            <p>Image non disponible</p>
          </div>
        </div>
        <p className="px-2 sm:px-4 text-justify text-base sm:text-lg md:text-2xl text-skill-text-primary">{lesson.description}</p>
      </section>
      <section className="flex flex-col w-full sm:w-4/5 mx-auto px-4 sm:px-0">
        <h3 className="font-display text-center text-xl md:text-3xl my-4">Matériaux nécessaires :</h3>
        <div className="bg-skill-primary/50 border border-skill-secondary/50 rounded-lg p-4 sm:p-6">
            <ul className="list-disc ml-6 sm:ml-8">
            {lesson.materials.map((material, index) => (
              <li key={index} className="text-sm sm:text-base md:text-xl mt-3 sm:mt-4 text-skill-text-primary">{material.name}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col w-full sm:w-4/5 mx-auto px-4 sm:px-0">
        <h3 className="font-display text-center text-xl md:text-3xl my-4">Etapes à suivre:</h3>
        {lesson.steps.map((step, index) => (
          <div className="w-full mb-6 sm:mb-8" key={step.id}>
            <div className="bg-skill-primary/20 border border-skill-secondary/50 rounded-lg flex flex-col sm:flex-row items-start justify-between break-words box-border overflow-hidden">
              <div className="flex flex-col justify-start flex-1 p-4 sm:p-6 w-full sm:w-auto" key={step.id}>
                <h4 className="font-display text-lg sm:text-xl md:text-2xl p-0 m-0 mb-3 sm:mb-4 break-words max-w-full" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>
                  Etape {index + 1}: {step.title}
                </h4>
                <p className="p-0 m-0 break-words max-w-full text-sm sm:text-base md:text-lg text-skill-text-primary" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>{step.description}</p>
              </div>
              {step.media_url && (
                <div className="w-full sm:w-[350px] h-[200px] sm:h-[250px] flex-shrink-0 overflow-hidden rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none">
                  {step.media_url.startsWith('/uploads/') ? (
                    <img
                      className="w-full h-full object-cover object-[50%_50%]"
                      src={`${import.meta.env.VITE_API_URL}${step.media_url}`}
                      alt={step.media_alt || "Image de l'étape"}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : step.media_url.startsWith('http') ? (
                    <img
                      className="w-full h-full object-cover object-[50%_50%]"
                      src={step.media_url}
                      alt={step.media_alt || "Image de l'étape"}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <img
                      className="w-full h-full object-cover object-[50%_50%]"
                      src={`/Images/Photos/${step.media_url}`}
                      alt={step.media_alt || "Image de l'étape"}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  )}
                  <div className="p-4 hidden">
                    <p>Image non disponible</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
