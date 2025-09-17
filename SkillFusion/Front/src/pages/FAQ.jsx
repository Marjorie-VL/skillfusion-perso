import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function FAQ() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
        <h2>FAQ - Foire Aux Questions</h2>
        <section>
          <h3>Je n’arrive pas à me connecter, que faire ?</h3>
          <p>Vérifiez votre email et votre mot de passe. Si vous avez oublié votre mot de passe, utilisez la fonction de réinitialisation ou contactez l’équipe via la page Contact.</p>
        </section>
        <section>
          <h3>Comment changer mon pseudo ou mon email ?</h3>
          <p>Rendez-vous dans votre tableau de bord, puis cliquez sur « Modifier mon profil ».</p>
        </section>
        <section>
          <h3>Qui peut poster sur le forum ?</h3>
          <p>Seuls les utilisateurs inscrits et connectés peuvent poster ou répondre sur le forum.</p>
        </section>
        <section>
          <h3>Comment devenir instructeur ou administrateur ?</h3>
          <p>Contactez un administrateur via la page Contact ou le forum pour demander un changement de rôle.</p>
        </section>
        <section>
          <h3>Puis-je supprimer mon compte ?</h3>
          <p>Oui, contactez un administrateur pour demander la suppression de votre compte.</p>
        </section>
      </main>
      <Footer />
    </>
  );
} 