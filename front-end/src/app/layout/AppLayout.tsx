import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout() {
  const { pathname } = useLocation();

  const showFooter = pathname === "/"; // footer uniquement sur l'accueil

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      <Header />
      <main  className="min-h-dvh">
        <Outlet />
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
