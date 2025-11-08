import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchBooks from "./pages/SearchBooks";
import SearchMovies from "./pages/SearchMovies";
import ContentDetail from "./pages/ContentDetail";


const Private: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Login />;
};

function Nav() {
  const { token, logout } = useAuth();
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        background: "#1976d2",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", gap: 16 }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>
          SocialLibrary
        </Link>
        {token && (
          <>
            <Link to="/search/books" style={{ color: "white", textDecoration: "none" }}>
              Kitaplar
            </Link>
            <Link to="/search/movies" style={{ color: "white", textDecoration: "none" }}>
              Filmler
            </Link>
          </>
        )}
      </div>
      <div>
        {token ? (
          <button
            onClick={logout}
            style={{
              background: "white",
              color: "#1976d2",
              fontWeight: 600,
              padding: "6px 12px",
            }}
          >
            Çıkış
          </button>
        ) : (
          <>
            <Link to="/login" style={{ color: "white", marginRight: 12 }}>Giriş</Link>
            <Link to="/register" style={{ color: "white" }}>Kayıt</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function WithNav({children}:{children:React.ReactNode}) {
  return <div><Nav/>{children}</div>;
}

const router = createBrowserRouter([
  { path: "/", element: <Private><WithNav><Home/></WithNav></Private> },
  { path: "/search/books", element: <Private><WithNav><SearchBooks/></WithNav></Private> },
  { path: "/search/movies", element: <Private><WithNav><SearchMovies/></WithNav></Private> },
  { path: "/content/:type/:externalId", element: <Private><WithNav><ContentDetail/></WithNav></Private> },
  { path: "/login", element: <WithNav><Login/></WithNav> },
  { path: "/register", element: <WithNav><Register/></WithNav> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
