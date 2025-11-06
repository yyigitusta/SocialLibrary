import { useEffect, useState } from "react";
import api from "../lib/api";

type Props = { type: string; externalId: string; reload?: number };

type ReviewItem = { id: number; userId: string; text: string; createdAt: string };

export default function ReviewList({ type, externalId, reload = 0 }: Props) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/reviews/${type}/${externalId}`,
        { params: { page: 1, pageSize: 20, _: Date.now() } } // cache-buster
      );
      setItems(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [type, externalId, reload]);

  if (loading) return <div>Yükleniyor…</div>;
  if (!items.length) return <div>Henüz yorum yok.</div>;

  return (
    <div style={{ display:"grid", gap:12 }}>
      {items.map(it => (
        <div key={it.id} style={{ border:"1px solid #eee", borderRadius:12, padding:10 }}>
          <div style={{ fontSize:12, color:"#666" }}>{new Date(it.createdAt).toLocaleString()}</div>
          <div style={{ marginTop:6, whiteSpace:"pre-wrap" }}>{it.text}</div>
          <div style={{ marginTop:6, fontSize:12, color:"#888" }}>by {it.userId}</div>
        </div>
      ))}
    </div>
  );
}
