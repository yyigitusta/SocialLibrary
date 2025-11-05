import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { setAuth } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      // token ve kullanıcı bilgilerini context'e yaz
      setAuth({
        user: {
          userId: data.userId,
          displayName: data.displayName,
          email: data.email,
        },
        token: data.token,
      });
      // yönlendirme
      nav("/");
    } catch (ex: any) {
      console.log("LOGIN ERROR:", ex?.response?.status, ex?.response?.data);
      setErr(ex?.response?.data?.message ?? "Giriş başarısız.");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
      }}
    >
      <form
        onSubmit={submit}
        style={{ display: "grid", gap: 12, width: 300 }}
      >
        <h2>Giriş Yap</h2>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <input
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Giriş</button>
      </form>
    </div>
  );
}
