import { useState, useEffect } from "preact/hooks";
import { PhotoGrid } from "../PhotoGrid.tsx";

export default function GalleryPage() {
  const [rssData, setRssData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRssData() {
      try {
        setIsLoading(true);
        // Remplacez par votre endpoint API réel
        const response = await fetch("https://patchworkarchitecture.co.nz/rss");

        if (!response.ok) {
          throw new Error(`Erreur lors du chargement: ${response.status}`);
        }

        const data = await response.text();
        setRssData(data);
        setError(null);
      } catch (err) {
        console.error("Erreur de chargement:", err);
        setError(
          "Impossible de charger les images. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchRssData();
  }, []);

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <h1>Notre Galerie</h1>

      {isLoading && <div className="loading">Chargement des images...</div>}

      {error && <div className="error">{error}</div>}

      {!isLoading && !error && rssData && (
        <PhotoGrid rss={rssData} rowHeight={240} gap="0.75rem" />
      )}
    </div>
  );
}
