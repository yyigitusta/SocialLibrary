import { useState } from "react";
import api from "../lib/api";

type Props = { type: string; externalId: string; onAdded?: () => void };

export default function ReviewBox({ type, externalId, onAdded }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim()) {
      setMsg("Yorum boş olamaz.");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await api.post("/reviews", { type, externalId, text });
      setText("");
      setMsg("Yorum gönderildi ✅");
      onAdded?.(); // yorum listesi yenilensin
    } catch (e: any) {
      console.error("REVIEW ERROR:", e);
      setMsg(e?.response?.data?.message ?? "Gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>Yorum Yaz</h4>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Düşüncelerini yaz..."
        style={{
          width: "100%",
          resize: "vertical",
          padding: 8,
          borderRadius: 8,
          border: "1px solid #ccc",
          outline: "none",
        }}
      />
      <div style={{ marginTop: 8 }}>
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Gönderiliyor..." : "Gönder"}
        </button>
      </div>
      {msg && <div style={{ marginTop: 6, color: "green" }}>{msg}</div>}
    </div>
  );
}
