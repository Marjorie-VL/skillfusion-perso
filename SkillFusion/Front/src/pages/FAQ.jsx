import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function FAQ() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto my-8 p-4">
        <h2 className="font-display text-center text-2xl md:text-4xl mb-8">FAQ - Foire Aux Questions</h2>
        <section className="mb-6 p-4 bg-skill-tertiary/30 rounded-lg border border-skill-success/30">
          <h3 className="font-display text-xl md:text-2xl mb-2">Je n'arrive pas à me connecter, que faire ?</h3>
          <p className="text-justify px-4 max-w-[95vw] text-skill-text-primary">Vérifiez votre email et votre mot de passe. Si vous avez oublié votre mot de passe, utilisez la fonction de réinitialisation ou contactez l'équipe via la page Contact.</p>
        </section>
        <section className="mb-6 p-4 bg-skill-tertiary/30 rounded-lg border border-skill-success/30">
          <h3 className="font-display text-xl md:text-2xl mb-2">Comment changer mon pseudo ou mon email ?</h3>
          <p className="text-justify px-4 max-w-[95vw]">Rendez-vous dans votre tableau de bord, puis cliquez sur « Modifier mon profil ».</p>
        </section>
        <section className="mb-6 p-4 bg-skill-tertiary/30 rounded-lg border border-skill-success/30">
          <h3 className="font-display text-xl md:text-2xl mb-2">Qui peut poster sur le forum ?</h3>
          <p className="text-justify px-4 max-w-[95vw]">Seuls les utilisateurs inscrits et connectés peuvent poster ou répondre sur le forum.</p>
        </section>
        <section className="mb-6 p-4 bg-skill-tertiary/30 rounded-lg border border-skill-success/30">
          <h3 className="font-display text-xl md:text-2xl mb-2">Comment devenir instructeur ou administrateur ?</h3>
          <p className="text-justify px-4 max-w-[95vw]">Contactez un administrateur via la page Contact ou le forum pour demander un changement de rôle.</p>
        </section>
        <section className="mb-6 p-4 bg-skill-tertiary/30 rounded-lg border border-skill-success/30">
          <h3 className="font-display text-xl md:text-2xl mb-2">Puis-je supprimer mon compte ?</h3>
          <p className="text-justify px-4 max-w-[95vw]">Oui, contactez un administrateur pour demander la suppression de votre compte.</p>
        </section>
      </main>
      <Footer />
    </>
  );
} 
