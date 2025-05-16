import { useState, useEffect, useRef } from "preact/hooks";

// Type pour les options du hook
type ProgressiveImageOptions = {
  placeholderColor?: string;
  animationDuration?: number;
  shimmerColor?: string;
};

// Hook personnalisé pour le chargement progressif des images
export function useProgressiveImage(
  src: string,
  options: ProgressiveImageOptions = {}
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const {
    placeholderColor = "var(--accents-2, #f0f0f0)",
    animationDuration = 300,
    shimmerColor = "rgba(255, 255, 255, 0.5)",
  } = options;

  useEffect(() => {
    if (!src) return;

    const imgElement = imageRef.current;
    if (!imgElement) return;

    // Créer un conteneur wrapper
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";

    // Créer le skeleton
    const skeleton = document.createElement("div");
    skeleton.style.position = "absolute";
    skeleton.style.top = "0";
    skeleton.style.left = "0";
    skeleton.style.width = "100%";
    skeleton.style.height = "100%";
    skeleton.style.backgroundColor = placeholderColor;
    skeleton.style.overflow = "hidden";

    // Ajouter l'effet shimmer
    const shimmer = document.createElement("div");
    shimmer.style.position = "absolute";
    shimmer.style.top = "0";
    shimmer.style.left = "0";
    shimmer.style.width = "100%";
    shimmer.style.height = "100%";
    shimmer.style.background = `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`;
    shimmer.style.animation = "skeleton-loading 1.5s infinite";

    skeleton.appendChild(shimmer);

    // Styles pour l'image
    imgElement.style.opacity = "0";
    imgElement.style.transition = `opacity ${animationDuration}ms ease-in-out`;
    imgElement.style.position = "absolute";
    imgElement.style.top = "0";
    imgElement.style.left = "0";
    imgElement.style.width = "100%";
    imgElement.style.height = "100%";
    imgElement.style.objectFit = "cover";

    // Insérer le wrapper et ses éléments
    imgElement.parentNode?.insertBefore(wrapper, imgElement);
    wrapper.appendChild(skeleton);
    wrapper.appendChild(imgElement);

    // Gérer le chargement
    const handleLoad = () => {
      setIsLoaded(true);
      skeleton.style.display = "none";
      imgElement.style.opacity = "1";
    };

    const handleError = () => {
      console.error("Image failed to load", src);
      skeleton.style.backgroundColor = "var(--error-color, #ff0000)";
    };

    // Ajouter les écouteurs
    imgElement.addEventListener("load", handleLoad);
    imgElement.addEventListener("error", handleError);

    // Styles d'animation globaux
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes skeleton-loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(styleElement);

    // Nettoyer
    return () => {
      imgElement.removeEventListener("load", handleLoad);
      imgElement.removeEventListener("error", handleError);
      document.head.removeChild(styleElement);
    };
  }, [src, placeholderColor, animationDuration, shimmerColor]);

  return {
    ref: imageRef,
    isLoaded,
  };
}

// Composant wrapper pour utilisation plus simple
export function ProgressiveImage({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
}) {
  const { ref } = useProgressiveImage(src);

  return (
    <img
      src={src}
      alt={alt}
      className={`progressive-image ${className || ""}`}
      {...props}
    />
  );
}

// Fonction utilitaire pour appliquer globalement
export function applyProgressiveImageToAll(
  selector: string = "img:not(.no-progressive)",
  options: ProgressiveImageOptions = {}
) {
  const images = document.querySelectorAll(selector);

  images.forEach((img) => {
    if (img instanceof HTMLImageElement && !img.dataset.progressiveApplied) {
      // Créer un wrapper
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.display = img.style.display || "inline-block";
      wrapper.style.width = img.style.width || "100%";
      wrapper.style.height = img.style.height || "100%";

      // Styles du skeleton
      const skeleton = document.createElement("div");
      skeleton.style.position = "absolute";
      skeleton.style.top = "0";
      skeleton.style.left = "0";
      skeleton.style.width = "100%";
      skeleton.style.height = "100%";
      skeleton.style.backgroundColor =
        options.placeholderColor || "var(--accents-2, #f0f0f0)";
      skeleton.style.overflow = "hidden";

      // Shimmer
      const shimmer = document.createElement("div");
      shimmer.style.position = "absolute";
      shimmer.style.top = "0";
      shimmer.style.left = "0";
      shimmer.style.width = "100%";
      shimmer.style.height = "100%";
      shimmer.style.background = `linear-gradient(90deg, transparent, ${
        options.shimmerColor || "rgba(255, 255, 255, 0.5)"
      }, transparent)`;
      shimmer.style.animation = "skeleton-loading 1.5s infinite";

      skeleton.appendChild(shimmer);

      // Préparer l'image
      img.style.opacity = "0";
      img.style.transition = `opacity ${
        options.animationDuration || 300
      }ms ease-in-out`;
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";

      // Insérer
      img.parentNode?.insertBefore(wrapper, img);
      wrapper.appendChild(skeleton);
      wrapper.appendChild(img);

      // Gérer le chargement
      const handleLoad = () => {
        skeleton.style.display = "none";
        img.style.opacity = "1";
      };

      const handleError = () => {
        console.error("Image failed to load", img.src);
        skeleton.style.backgroundColor = "var(--error-color, #ff0000)";
      };

      // Ajouter les écouteurs
      img.addEventListener("load", handleLoad);
      img.addEventListener("error", handleError);

      // Marquer comme traité
      img.dataset.progressiveApplied = "true";
    }
  });

  // Ajouter les styles d'animation (une seule fois)
  if (!document.getElementById("progressive-image-styles")) {
    const styleElement = document.createElement("style");
    styleElement.id = "progressive-image-styles";
    styleElement.textContent = `
      @keyframes skeleton-loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(styleElement);
  }
}
