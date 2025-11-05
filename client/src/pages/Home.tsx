import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h2>Ana Sayfa</h2>
      <p>Hoş geldin, <b>{user?.displayName ?? user?.email}</b>!</p>
      <button onClick={logout}>Çıkış</button>
    </div>
  );
}
