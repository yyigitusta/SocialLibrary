export type SearchItem = {
  externalId: string;
  title: string;
  year?: number | null;
  coverUrl?: string | null;
  type: "book" | "movie";
};
