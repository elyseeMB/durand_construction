import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

type ImageInfo = {
  src: string;
  width: number;
  height: number;
  title?: string;
};

// Créer un contexte global pour partager l'état du lightbox entre les composants
export const LightboxState = {
  activeIndex: null as number | null,
  images: [] as Array<{
    src: string;
    title?: string;
    width: number;
    height: number;
  }>,
  setActiveIndex: (index: number | null) => {},
  setImages: (images: any[]) => {},
};

export function useLightbox(
  images: {
    src: string;
    title?: string;
    width: number;
    height: number;
  }[]
) {
  // Utiliser un tableau de refs au lieu d'une seule ref
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Enregistrer les images dans l'état global
  useEffect(() => {
    if (images && images.length > 0) {
      LightboxState.images = images;
      LightboxState.setImages(images);
    }
  }, [images]);

  // Fonction pour gérer le clic sur une image
  const handleClick = useCallback((e: MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(`Clicked on image ${index}`, e);
    // Mettre à jour l'index actif dans le contexte global
    LightboxState.activeIndex = index;
    LightboxState.setActiveIndex(index);
  }, []);

  // Fonction pour créer les refs dynamiquement
  const refLightbox = useCallback(
    (index: number) => (el: HTMLAnchorElement | null) => {
      // Sauvegarder l'élément dans notre tableau à l'index spécifié
      refs.current[index] = el;

      // Attacher directement l'écouteur d'événement à cet élément
      if (el) {
        // Supprimer tout écouteur existant pour éviter les doublons
        el.removeEventListener("click", (e: any) => handleClick(e, index));

        // Ajouter le nouvel écouteur
        el.addEventListener("click", (e: any) => handleClick(e, index));
      }
    },
    [handleClick]
  );

  return {
    refLightbox,
    // Fonctions pour interagir avec l'état global
    openLightbox: (index: number) => {
      LightboxState.activeIndex = index;
      LightboxState.setActiveIndex(index);
    },
    closeLightbox: () => {
      LightboxState.activeIndex = null;
      LightboxState.setActiveIndex(null);
    },
  };
}

export function Lightbox() {
  const target = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [images, setImages] = useState<
    Array<{
      src: string;
      title?: string;
      width: number;
      height: number;
    }>
  >([]);

  // Connecter le composant à l'état global
  useEffect(() => {
    LightboxState.setActiveIndex = (index) => {
      setActiveIndex(index);
    };

    LightboxState.setImages = (newImages) => {
      setImages(newImages);
    };
  }, []);

  // Ouvrir le lightbox quand un index actif est défini
  useEffect(() => {
    if (activeIndex !== null) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [activeIndex]);

  // Fermer le lightbox
  const closeLightbox = () => {
    setIsOpen(false);
    setActiveIndex(null);
    LightboxState.activeIndex = null;
    document.body.removeAttribute("style");
  };

  // Navigation dans le lightbox
  const goToPrevious = () => {
    if (activeIndex !== null && images.length > 0) {
      const newIndex = (activeIndex - 1 + images.length) % images.length;
      setActiveIndex(newIndex);
      LightboxState.activeIndex = newIndex;
    }
  };

  const goToNext = () => {
    if (activeIndex !== null && images.length > 0) {
      const newIndex = (activeIndex + 1) % images.length;
      setActiveIndex(newIndex);
      LightboxState.activeIndex = newIndex;
    }
  };

  if (isOpen) {
    document.body.setAttribute("style", "overflow: hidden;");
  }

  // Gestionnaire d'événement pour les touches clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex]);

  // Si le lightbox n'est pas ouvert ou pas d'index actif ou pas d'images, ne rien afficher
  if (!isOpen || activeIndex === null || images.length === 0) {
    return null;
  }

  const currentImage = images[activeIndex];

  // Si l'image actuelle n'existe pas, ne rien afficher
  if (!currentImage) {
    return null;
  }

  return (
    <div
      className="lightbox-overlay"
      onClick={closeLightbox}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "lightbox-fade-in 0.2s ease-in-out",
      }}
    >
      <div
        ref={target}
        className="lightbox-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          animation: "lightbox-zoom-in 0.3s ease-out",
        }}
      >
        <button
          onClick={closeLightbox}
          style={{
            position: "absolute",
            top: "-10px",
            right: "-50px",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div className="lightbox-image-container">
          <img
            src={currentImage.src}
            alt={currentImage.title || ""}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />

          {currentImage.title && (
            <div
              className="lightbox-caption"
              style={{
                color: "white",
                textAlign: "center",
                padding: "10px 0",
              }}
            >
              {currentImage.title}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              style={{
                position: "absolute",
                left: "-50px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "32px",
                cursor: "pointer",
              }}
            >
              ‹
            </button>

            <button
              onClick={goToNext}
              style={{
                position: "absolute",
                right: "-50px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "32px",
                cursor: "pointer",
              }}
            >
              ›
            </button>

            <div
              style={{
                position: "absolute",
                bottom: "-30px",
                left: 0,
                right: 0,
                textAlign: "center",
                color: "white",
              }}
            >
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      <style>
        {`
          @keyframes lightbox-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes lightbox-zoom-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
