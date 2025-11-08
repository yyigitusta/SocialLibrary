import { useState } from "react";
import api from "../lib/api";
import type { SearchItem } from "../types/search";
import { Link } from "react-router-dom";

export default function SearchBooks() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<SearchItem[]>([]);

  const search = async () => {
    if (!q.trim()) { setItems([]); return; }
    setLoading(true); setErr(null);
    try {
      const { data } = await api.get<SearchItem[]>("/search/books", { params: { q } });
      setItems(data);
    } catch (e:any) {
      setErr(e?.response?.data?.message ?? "Arama başarısız.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Kitap Ara</h2>
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="örn: harry potter" style={{ flex: 1 }} />
        <button onClick={search} disabled={loading}>Ara</button>
      </div>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {loading && <div>Yükleniyor…</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 12 }}>
        {items.map(it => (
  <Link key={it.externalId} to={`/content/book/${it.externalId}`} style={{ textDecoration:"none", color:"inherit" }}>
<div style={{
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 10,
  background: "white",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
 cursor:'pointer',
  transition:'transform .2s'}}>      {it.coverUrl && <img src={it.coverUrl} alt={it.title} style={{ width: "100%", borderRadius: 8 }} />}
      <div style={{ marginTop: 8, fontWeight: 600 }}>{it.title}</div>
      <div style={{ color: "#666" }}>{it.year ?? "-"}</div>
    </div>
  </Link>
        ))}
      </div>
    </div>
  );
}
