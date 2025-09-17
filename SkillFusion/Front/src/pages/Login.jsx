import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import LoginForm from "../components/LoginForm.jsx";

export default function Login() {
  return (
    <>
      <Header />

      <main>
        <section className="head-banner">
          <h2>Se connecter</h2>
        </section>

        <LoginForm />

        <div>
          <a href="/register">Créer un compte</a>
        </div>
      </main>

      <Footer />
    </>
  );
}
