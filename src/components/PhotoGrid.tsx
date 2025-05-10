import { useEffect, useRef, useState, useMemo } from "preact/hooks";

// Types pour nos données
type ImageInfo = {
  src: string;
  width: number;
  height: number;
  title?: string;
};

type PhotoGridProps = {
  rss: string;
  rowHeight?: number;
  gap?: string;
  maxRows: number;
};

// Fonction pour parser le XML RSS
function parseRSS(rssStr: string): ImageInfo[] {
  try {
    // Créer un parser XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssStr, "text/xml");

    // Extraire les items
    const items = Array.from(xmlDoc.querySelectorAll("item"));

    // Extraire les images de chaque item
    return items
      .flatMap((item) => {
        const title = item.querySelector("title")?.textContent || "";
        const description =
          item.querySelector("description")?.textContent || "";

        // Parser le contenu HTML de la description
        const htmlParser = new DOMParser();
        const descDoc = htmlParser.parseFromString(description, "text/html");

        // Extraire les images
        return Array.from(descDoc.querySelectorAll("img")).map((img) => ({
          src: img.src,
          width: img.width,
          height: img.height,
          title,
        }));
      })
      .filter((img) => img.src && img.width > 0 && img.height > 0);
  } catch (error) {
    console.error("Erreur lors du parsing RSS:", error);
    return [];
  }
}

// Calcule la largeur idéale pour chaque image dans une ligne
function calculateImageWidths(
  images: ImageInfo[],
  containerWidth: number,
  rowHeight: number,
  gapSize: number
): { rowImages: ImageInfo[]; remainingImages: ImageInfo[] } {
  if (images.length === 0) {
    return { rowImages: [], remainingImages: [] };
  }

  // Calculer la largeur totale si toutes les images étaient affichées à la hauteur rowHeight
  let totalWidth = -gapSize; // Commencer par -gap car nous ajoutons gap après chaque image
  let i = 0;

  for (i = 0; i < images.length; i++) {
    const img = images[i];
    const aspectRatio = img.width / img.height;
    const imageWidth = aspectRatio * rowHeight;

    totalWidth += imageWidth + gapSize;

    // Si nous avons dépassé la largeur du conteneur, nous vérifions si nous devons inclure cette image
    if (totalWidth > containerWidth) {
      // Vérifier si l'inclusion de cette image serait meilleure que de l'exclure
      const withCurrentImage = totalWidth;
      const withoutCurrentImage = totalWidth - (imageWidth + gapSize);

      // Si l'inclusion donne une meilleure approximation de la largeur du conteneur
      if (
        Math.abs(containerWidth - withoutCurrentImage) <
        Math.abs(containerWidth - withCurrentImage)
      ) {
        i--; // Exclure cette image
      }
      break;
    }
  }

  // S'assurer que i est au moins 1 (pour éviter les boucles infinies)
  i = Math.max(1, i);

  // Diviser les images en deux groupes : celles de la ligne actuelle et les images restantes
  return {
    rowImages: images.slice(0, i + 1),
    remainingImages: images.slice(i + 1),
  };
}

// Composant pour une ligne d'images
function ImageRow({
  images,
  rowHeight,
  containerWidth,
  gapSize,
  index,
}: {
  images: ImageInfo[];
  rowHeight: number;
  containerWidth: number;
  gapSize: number;
  index: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Calculer les largeurs proportionnelles pour CSS grid
  const gridColumns = useMemo(() => {
    if (images.length === 0) return "";

    // Calculer la largeur de référence pour chaque image
    let totalAspectRatioSum = 0;
    images.forEach((img) => {
      totalAspectRatioSum += img.width / img.height;
    });

    // Calculer la fraction de largeur pour chaque image
    return images
      .map((img) => {
        const aspectRatio = img.width / img.height;
        return `${aspectRatio / totalAspectRatioSum}fr`;
      })
      .join(" ");
  }, [images, containerWidth, gapSize]);

  // Observer l'intersection pour l'animation
  useEffect(() => {
    if (!rowRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // setIsVisible(true);
          observer.disconnect();
        }
      });
    });

    observer.observe(rowRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className={`image-row ${isVisible ? "animate" : ""}`}
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: `${gapSize}rem`,
        height: `${rowHeight}px`,
        // opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s, filter 0.5s",
      }}
    >
      {images.map((img, imgIndex) => (
        <a
          key={`${index}-${imgIndex}`}
          href={img.title ? `/posts/${img.title}` : "#"}
          style={{
            height: "100%",
            display: "block",
            overflow: "hidden",
            viewTransitionName: `image-${index}-${imgIndex}`,
            "--index": `${index * 100 + imgIndex}`,
          }}
        >
          <img
            onMouseEnter={(ev) => {
              const element = ev.target as HTMLImageElement;
              if (ev.isTrusted) {
                element.classList.add("active");
              }
            }}
            onMouseLeave={(ev) => {
              const element = ev.target as HTMLImageElement;
              if (ev.isTrusted) {
                element.classList.remove("active");
              }
            }}
            src={img.src}
            alt={img.title || ""}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </a>
      ))}
    </div>
  );
}

// Composant principal PhotoGrid
export function PhotoGrid({
  rss,
  rowHeight = 200,
  gap = "0.5rem",
  maxRows = Infinity,
}: PhotoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const gapSize = parseFloat(gap);

  // Parser le RSS et extraire les images
  useEffect(() => {
    if (!rss) return;
    const parsedImages = parseRSS(rss);
    setImages(parsedImages);
  }, [rss]);

  // Détecter la largeur du conteneur
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };

    // Initialiser la largeur
    updateWidth();

    // Mettre à jour la largeur lors des redimensionnements
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Organiser les images en lignes
  const rows = useMemo(() => {
    if (containerWidth === 0 || images.length === 0) return [];

    const rows = [];
    let remainingImages = [...images];

    while (remainingImages.length > 0 && rows.length < maxRows) {
      const { rowImages, remainingImages: newRemainingImages } =
        calculateImageWidths(
          remainingImages,
          containerWidth,
          rowHeight,
          gapSize
        );

      rows.push(rowImages);
      remainingImages = newRemainingImages;

      // Protection contre les boucles infinies
      if (rowImages.length === 0) break;
    }

    return rows;
  }, [images, containerWidth, rowHeight, gapSize]);

  const hasMoreImages =
    images.length > 0 &&
    rows.reduce((count, row) => count + row.length, 0) < images.length;

  return (
    <div
      ref={containerRef}
      className="photo-grid"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: gap,
      }}
    >
      {rows.map((rowImages, index) => (
        <ImageRow
          key={`row-${index}`}
          images={rowImages}
          rowHeight={rowHeight}
          containerWidth={containerWidth}
          gapSize={gapSize}
          index={index}
        />
      ))}
      {hasMoreImages && (
        <button
          style={{
            display: "inline-block",
            marginTop: "1rem",
            width: "max-content",
            color: "var(--accents-8)",
            padding: "5px 10px",
            border: "1px solid var(--accents-3)",
          }}
          class="more-projet"
        >
          voir plus →
        </button>
      )}
    </div>
  );
}
