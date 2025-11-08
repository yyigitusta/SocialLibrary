import { useEffect, useState } from "react";
import api from "../lib/api";

type FeedItem = {
  type: string;
  userId: string;
  contentKey: string;
  message: string;
  userDisplayName:string;
  createdAt: string;
  title?:string;
};

export default function Home() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const loadFeed = async () => {
  setLoading(true);
  setErr(null);
  try {
    // feed listesini al
    const { data } = await api.get<FeedItem[]>("/feed", {
      params: { take: 30, _: Date.now() },
    });
    setItems(data);

    // her item için başlık çek
    const updated = await Promise.all(
      data.map(async (it) => {
        const [type, id] = it.contentKey.split(":");
        try {
          const res = await api.get(`/content/${type}/${id}`);
          return { ...it, title: res.data.title };
        } catch {
          return { ...it, title: "(bilgi yok)" };
        }
      })
    );

    setItems(updated);
  } catch (e: any) {
    setErr(e?.response?.data?.message ?? "Akış yüklenemedi.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadFeed();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Yükleniyor...</div>;
  if (err) return <div style={{ padding: 20, color: "crimson" }}>{err}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Son Aktiviteler</h2>
      {!items.length && <div>Henüz aktivite yok.</div>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {items.map((it, i) => {
          const [type, id] = it.contentKey.split(":");
          const url = `/content/${type}/${id}`;
          const date = new Date(it.createdAt).toLocaleString();

          return (
            <a
              key={i}
              href={url}
              style={{
                textDecoration: "none",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                display: "block",
                color: "inherit",
                background: "#fafafa",
              }}
            >
             <div style={{ fontWeight: 600 }}>{it.userDisplayName}</div>
<div style={{ marginTop: 4 }}>
 {it.type === "rating"
    ? `${it.userDisplayName} "${it.title}" için ${it.message}`
    : `${it.userDisplayName} "${it.title}" hakkında ${it.message}`}
</div>
<div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
  {type === "book" ? "📚 Kitap" : "🎬 Film"} — {date}
</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
