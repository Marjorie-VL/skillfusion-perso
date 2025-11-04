import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import LoginForm from "../components/LoginForm.jsx";

export default function Login() {
  return (
    <>
      <Header />

      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] mb-8">
        <section className="flex flex-col justify-center items-center">
          <h2 className="my-8 font-['Lobster'] text-center text-2xl md:text-4xl">Se connecter</h2>
        </section>

        <LoginForm />

        <div className="text-center mt-4">
          <a href="/register" className="no-underline text-black hover:text-skill-accent">Créer un compte</a>
        </div>
      </main>

      <Footer />
    </>
  );
}
