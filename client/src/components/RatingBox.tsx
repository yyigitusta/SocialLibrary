import { useEffect, useState } from "react";
import api from "../lib/api";

type Props = { type: string; externalId: string };

export default function RatingBox({ type, externalId }: Props) {
  const [score, setScore] = useState<number | null>(null);
  const [avg, setAvg] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      const { data } = await api.get(`/ratings/${type}/${externalId}`);
      setAvg(data.average);
      setCount(data.count);
    } catch {
      // boş geç
    }
  };

  const submit = async () => {
    if (!score) return;
    setLoading(true);
    setMsg(null);
    try {
      await api.post("/ratings", { type, externalId, score });
      setMsg("Kaydedildi ✅");
      await loadSummary();
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? "Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [type, externalId]);

  return (
    <div style={{ marginTop: 20 }}>
      <h4>Puan Ver</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number"
          min={1}
          max={10}
          value={score ?? ""}
          onChange={(e) => setScore(parseInt(e.target.value))}
          style={{ width: 60 }}
        />
        <button onClick={submit} disabled={loading}>Kaydet</button>
      </div>
      {msg && <div style={{ color: "green", marginTop: 6 }}>{msg}</div>}
      <div style={{ marginTop: 10, color: "#555" }}>
        Ortalama: <b>{avg}</b> ({count} oy)
      </div>
    </div>
  );
}
