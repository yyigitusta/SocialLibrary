import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../lib/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { setAuth } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const { data } = await api.post("/auth/register", { email, password, displayName });
      setAuth({
        user: { userId: data.userId, displayName: data.displayName, email: data.email },
        token: data.token,
      });
      nav("/"); // kayıt sonrası ana sayfa
    } catch (ex: any) {
      console.log("REGISTER ERROR:", ex?.response?.status, ex?.response?.data);
      setErr(ex?.response?.data?.message ?? "Kayıt başarısız.");
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, width: 300 }}>
        <h2>Kayıt Ol</h2>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <input placeholder="Görünen ad" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        <input placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} />
        <button>Kayıt Ol</button>
        <small>Zaten hesabın var mı? <Link to="/login">Giriş yap</Link></small>
      </form>
    </div>
  );
}
