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
  const { token } = useAuth();
  return (
    <nav style={{display:"flex",gap:12,padding:12,borderBottom:"1px solid #eee"}}>
      <Link to="/">Ana Sayfa</Link>
      {token && <>
        <Link to="/search/books">Kitap Ara</Link>
        <Link to="/search/movies">Film Ara</Link>
      </>}
      {!token && <>
        <Link to="/login">Giriş</Link>
        <Link to="/register">Kayıt</Link>
      </>}
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
