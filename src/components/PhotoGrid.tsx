import type { UIEventHandler } from "preact/compat";
import { useEffect, useRef, useState, useMemo } from "preact/hooks";
import { Lightbox, useLightbox } from "../hooks/useLightbox.tsx";

// Types pour nos données
type ImageInfo = {
  src: string;
  width: number;
  height: number;
  title?: string;
  isLoaded?: boolean;
};

type PhotoGridProps = {
  rss: string;
  rowHeight?: number;
  gap?: string;
  maxRows?: number;
};

// Composant pour une ligne d'images - modifié pour utiliser le nouveau hook
function ImageRow({
  images,
  rowHeight,
  containerWidth,
  gapSize,
  index,
  onImageLoad,
  getImageIndex,
  refLightbox,
}: {
  images: ImageInfo[];
  rowHeight: number;
  containerWidth: number;
  gapSize: number;
  index: number;
  onImageLoad: (rowIndex: number, imgIndex: number) => void;
  getImageIndex: (rowIndex: number, imgIndex: number) => number; // Fonction pour obtenir l'index global
  refLightbox: (index: number) => (element: HTMLAnchorElement | null) => void; // Fonction ref du lightbox
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

  const handleLoadImage: UIEventHandler<HTMLImageElement> = (e) => {
    const target = e.target as HTMLImageElement;
    const imgIndex = parseInt(target.dataset.index || "0", 10);

    // Notifier le parent que l'image est chargée
    onImageLoad(index, imgIndex);

    // Masquer le skeleton
    if (target.previousElementSibling) {
      (target.previousElementSibling as HTMLElement).style.display = "none";
    }

    // Afficher l'image
    target.style.opacity = "1";
  };

  return (
    <div
      ref={rowRef}
      className={`image-row ${isVisible ? "animate" : ""}`}
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: `${gapSize}rem`,
        height: `${rowHeight}px`,
        transition: "opacity 0.5s, filter 0.5s",
      }}
    >
      {images.map((img, imgIndex) => {
        const aspectRatio = img.width / img.height;
        // Obtenir l'index global de cette image dans toute la galerie
        const globalIndex = getImageIndex(index, imgIndex);

        return (
          <a
            ref={refLightbox(globalIndex)} // Utiliser la fonction ref avec l'index global correct
            key={`${index}-${imgIndex}`}
            href={img.src} // Modifié pour utiliser directement l'URL de l'image
            style={{
              height: "100%",
              display: "block",
              overflow: "hidden",
              viewTransitionName: `image-${index}-${imgIndex}`,
              "--index": `${globalIndex}`,
              position: "relative",
            }}
          >
            {/* Skeleton qui s'affiche pendant le chargement */}
            <Skeleton aspectRatio={aspectRatio} />

            {/* Image réelle qui devient visible après chargement */}
            <img
              data-index={imgIndex}
              onLoad={handleLoadImage}
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
                opacity: "0", // L'image est initialement invisible
                transition: "opacity 0.3s ease-in-out",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          </a>
        );
      })}
    </div>
  );
}

function Skeleton({ aspectRatio }: { aspectRatio: number }) {
  return (
    <div
      className="skeleton-loading"
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "var(--accents-2, #f0f0f0)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
          animation: "skeleton-loading 1.5s infinite",
        }}
      />
    </div>
  );
}

// [Implémentation de parseRSS]
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
          isLoaded: false, // Par défaut, l'image n'est pas chargée
        }));
      })
      .filter((img) => img.src && img.width > 0 && img.height > 0);
  } catch (error) {
    console.error("Erreur lors du parsing RSS:", error);
    return [];
  }
}

// [Implémentation de calculateImageWidths]
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

// Composant principal PhotoGrid - modifié pour intégrer le Lightbox correctement
export function PhotoGrid({
  rss,
  rowHeight = 200,
  gap = "0.5rem",
  maxRows = Infinity,
}: PhotoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadingState, setLoadingState] = useState<boolean[][]>([]);
  const gapSize = parseFloat(gap);
  const [allImages, setAllImages] = useState<ImageInfo[]>([]); // Pour stocker toutes les images aplaties

  // Utiliser le hook useLightbox avec toutes les images
  const { refLightbox } = useLightbox(allImages);

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
    const allImagesFlat: ImageInfo[] = [];

    while (remainingImages.length > 0 && rows.length < maxRows) {
      const { rowImages, remainingImages: newRemainingImages } =
        calculateImageWidths(
          remainingImages,
          containerWidth,
          rowHeight,
          gapSize
        );

      rows.push(rowImages);
      // Ajouter les images de cette ligne à notre liste aplatie
      allImagesFlat.push(...rowImages);
      remainingImages = newRemainingImages;

      // Protection contre les boucles infinies
      if (rowImages.length === 0) break;
    }

    // Mettre à jour la liste complète des images pour le lightbox
    setAllImages(allImagesFlat);

    // Initialiser l'état de chargement pour chaque image dans chaque ligne
    const newLoadingState = rows.map((row) => Array(row.length).fill(false));
    setLoadingState(newLoadingState);

    return rows;
  }, [images, containerWidth, rowHeight, gapSize]);

  // Gestionnaire pour marquer une image comme chargée
  const handleImageLoad = (rowIndex: number, imgIndex: number) => {
    setLoadingState((prevState) => {
      const newState = [...prevState];
      if (newState[rowIndex]) {
        newState[rowIndex] = [...newState[rowIndex]];
        newState[rowIndex][imgIndex] = true;
      }
      return newState;
    });
  };

  // Fonction pour obtenir l'index global d'une image dans la collection complète
  const getImageIndex = (rowIndex: number, imgIndex: number): number => {
    let globalIndex = 0;
    for (let i = 0; i < rowIndex; i++) {
      globalIndex += rows[i].length;
    }
    return globalIndex + imgIndex;
  };

  const hasMoreImages =
    images.length > 0 &&
    rows.reduce((count, row) => count + row.length, 0) < images.length;

  // Ajouter des styles CSS pour l'animation du skeleton
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes skeleton-loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <>
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
            onImageLoad={handleImageLoad}
            getImageIndex={getImageIndex}
            refLightbox={refLightbox}
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
            className="more-projet"
          >
            voir plus →
          </button>
        )}
      </div>

      {/* Ajouter le composant Lightbox */}
      <Lightbox />
    </>
  );
}
