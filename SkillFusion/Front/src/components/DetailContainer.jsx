import React from "react";

export default function DetailContainer({ lesson }) {
  console.log(lesson.materials);
  
  return (
    <>
      <section className="flex flex-col w-4/5 mx-auto">
        <h2 className="font-['Lobster'] text-center text-2xl md:text-4xl mb-4"> {lesson.title}</h2>
        <p className="text-base text-gray-600 my-2 italic">
          Créé par {lesson.user?.user_name || 'Instructeur inconnu'}
        </p>
        <div className="max-w-full max-h-80 overflow-hidden border border-black my-4 shadow-[2px_2px_rgb(122,122,122)] rounded-lg">
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
        <p className="px-4 text-justify text-lg md:text-2xl">{lesson.description}</p>
      </section>
      <section className="flex flex-col w-4/5 mx-auto">
        <h3 className="font-['Lobster'] text-center text-xl md:text-3xl my-4">Matériaux nécessaires :</h3>
        <div className="bg-skill-primary/50 border border-skill-secondary/50 rounded-lg p-6">
          <ul className="list-disc ml-8">
            {lesson.materials.map((material, index) => (
              <li key={index} className="text-base md:text-xl mt-4">{material.name}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col w-4/5 mx-auto">
        <h3 className="font-['Lobster'] text-center text-xl md:text-3xl my-4">Etapes à suivre:</h3>
        {lesson.steps.map((step, index) => (
          <div className="w-full mb-8" key={step.id}>
            <div className="bg-skill-primary/20 border border-skill-secondary/50 rounded-lg flex flex-row items-start justify-between break-words box-border overflow-hidden">
              <div className="flex flex-col justify-start flex-1 p-6" key={step.id}>
                <h4 className="font-['Lobster'] text-lg md:text-2xl p-0 m-0 mb-4 break-words max-w-full" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>
                  Etape {index + 1}: {step.title}
                </h4>
                <p className="p-0 m-0 break-words max-w-full" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>{step.description}</p>
              </div>
              {step.media_url && (
                <div className="w-[350px] h-[250px] flex-shrink-0 overflow-hidden rounded-r-lg">
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
