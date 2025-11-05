import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";

const Private: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Login />;
};

const router = createBrowserRouter([
  { path: "/", element: <Private><Home/></Private> },
  { path: "/login", element: <Login/> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
