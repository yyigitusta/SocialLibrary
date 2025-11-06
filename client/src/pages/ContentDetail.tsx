import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import RatingBox from "../components/RatingBox";
import ReviewBox from "../components/ReviewBox";
import ReviewList from "../components/ReviewList";

type ContentDetail = {
  type: string;
  id: string;
  title?: string;
  year?: string | number;
  overview?: string;
  description?: string;
  authors?: string[];
  genres?: string[];
  coverUrl?: string;
  posterUrl?: string;
  runtime?: number;
  pageCount?: number;
};

export default function ContentDetail() {
  const { type, externalId } = useParams();
  const [data, setData] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [revReload, setRevReload] = useState(0); // ⬅️ hook'lar her zaman en üstte

  useEffect(() => {
    const load = async () => {
      if (!type || !externalId) return;
      setLoading(true);
      setErr(null);
      try {
        const { data } = await api.get(`/content/${type}/${externalId}`);
        setData(data);
      } catch {
        setErr("Veri alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, externalId]);

  if (loading) return <div style={{ padding: 20 }}>Yükleniyor...</div>;
  if (err) return <div style={{ padding: 20, color: "crimson" }}>{err}</div>;
  if (!data) return null;

  const cover = data.coverUrl ?? data.posterUrl;

  return (
    <div style={{ padding: 20 }}>
      <Link to={data.type === "book" ? "/search/books" : "/search/movies"}>{"← Geri"}</Link>
      <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
        {cover && (
          <img
            src={cover}
            alt={data.title}
            style={{ width: 250, borderRadius: 12, objectFit: "cover" }}
          />
        )}
        <div style={{ flex: 1, minWidth: 250 }}>
          <h2>{data.title}</h2>
          {data.year && (
            <p>
              <b>Yıl:</b> {data.year}
            </p>
          )}
          {data.authors && (
            <p>
              <b>Yazarlar:</b> {data.authors.join(", ")}
            </p>
          )}
          {data.genres && (
            <p>
              <b>Türler:</b> {data.genres.join(", ")}
            </p>
          )}
          {data.runtime && (
            <p>
              <b>Süre:</b> {data.runtime} dk
            </p>
          )}
          {data.pageCount && (
            <p>
              <b>Sayfa:</b> {data.pageCount}
            </p>
          )}
          {data.overview && <p>{data.overview}</p>}
          {data.description && <p>{data.description}</p>}

          <RatingBox type={type!} externalId={externalId!} />

          <ReviewBox
            type={type!}
            externalId={externalId!}
            onAdded={() => setRevReload((x) => x + 1)}
          />

          <div style={{ marginTop: 16 }}>
            <h4>Yorumlar</h4>
            <ReviewList type={type!} externalId={externalId!} reload={revReload} />
          </div>
        </div>
      </div>
    </div>
  );
}
