import type { CollectionEntry } from "astro:content";
import { useEffect, useState } from "preact/hooks";
import { ProgressiveImage } from "./ProgressImage.tsx";
import { strategyToUppercase } from "../helpers/dom.ts";

type PropsData = {
  taxonomy: string;
  posts: CollectionEntry<"blog">[];
};

type Props = {
  data: PropsData[];
  allYears: string[];
  allPostsByYear: {
    [key: string]: Post[];
  };
};

type Post = CollectionEntry<"blog">;
// Interface pour définir la structure des posts par année
interface PostsByYearType {
  [key: string]: Post[];
}

// Fonction pour regrouper les posts par année
function groupPostsByYear(posts: Post[]): PostsByYearType {
  const postsByYear: PostsByYearType = {};

  posts.forEach((post) => {
    if (!post.data.pubDate) return;

    const date = new Date(post.data.pubDate);
    const year = date.getFullYear().toString();

    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }

    postsByYear[year].push(post);
  });

  // Trier les posts de chaque année (du plus récent au plus ancien)
  Object.keys(postsByYear).forEach((year) => {
    postsByYear[year].sort((a, b) => {
      if (!a.data.pubDate) return 1;
      if (!b.data.pubDate) return -1;
      return (
        new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
      );
    });
  });

  return postsByYear;
}

export function ViewProjets({ data }: Props) {
  const onlyTaxonomyWithPosts = data.filter((d) =>
    d.posts.some((post) => post !== null)
  );

  // Obtenir toutes les années disponibles à partir de tous les posts
  const allPosts = onlyTaxonomyWithPosts.flatMap((tax) => tax.posts);
  const postsByYear = groupPostsByYear(allPosts);
  const availableYears = Object.keys(postsByYear).sort((a, b) => +b - +a); // Tri décroissant (plus récent d'abord)

  // État pour suivre l'année sélectionnée
  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears[0] || new Date().getFullYear().toString()
  );

  return (
    <>
      <div class="description-view">
        <div class="year-selector">
          {availableYears.map((year) => (
            <button
              class={year === selectedYear ? "year-btn active" : "year-btn"}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <div class="approach">
          <List
            data={onlyTaxonomyWithPosts}
            year={selectedYear}
            postsByYear={postsByYear}
          />
        </div>
      </div>

      <style jsx>{`
        .year-selector {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .year-btn {
          padding: 0.5rem 1rem;
          border: 1px solid var(--accents-3);
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          color: var(--accents-6);
          transition: all 0.2s;
        }

        .year-btn:hover {
          border-color: var(--durand-orange);
          color: var(--durand-orange);
        }

        .year-btn.active {
          background-color: var(--durand-orange);
          color: white;
          border-color: var(--durand-orange);
        }
      `}</style>
    </>
  );
}

function Topics({
  name,
  posts,
  year,
}: {
  name: string;
  posts: Post[];
  year: string;
}) {
  const [isMouseEnter, setIsMouseEnter] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);

  // Filtrer les posts par année sélectionnée
  const postsBySelectedYear = posts.filter((post) => {
    if (!post.data.pubDate) return false;
    const postYear = new Date(post.data.pubDate).getFullYear().toString();
    return postYear === year;
  });

  // Trier les posts par date (du plus récent au plus ancien)
  const sortPosts = postsBySelectedYear.sort((a, b) => {
    if (!a.data.pubDate) return 1;
    if (!b.data.pubDate) return -1;
    return (
      new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
    );
  });

  // Ne pas afficher la catégorie si elle n'a pas de posts pour l'année sélectionnée
  if (sortPosts.length === 0) return null;

  return (
    <div class="topics">
      <div class="taxonomy">{strategyToUppercase(name)} →</div>
      <ul>
        {sortPosts.map((post) => (
          <li
            data-image={post.data.thumbnail}
            onMouseEnter={(ev) => {
              setIsMouseEnter(ev.isTrusted);
              setImage((ev.target as HTMLLIElement).getAttribute("data-image"));
            }}
            onMouseLeave={(ev) => {
              setIsMouseEnter(false);
              setImage(null);
            }}
          >
            <a href={`/blog/${post.id}`}>{post.data.title}</a>
          </li>
        ))}
      </ul>
      <div class="text-description-view">
        {image && (
          <ProgressiveImage src={image} alt="Thumbnail" className="thumbnail" />
        )}
      </div>
    </div>
  );
}

function List({
  data,
  year,
  postsByYear,
}: {
  data: PropsData[];
  year: string;
  postsByYear: PostsByYearType;
}) {
  return (
    <div class="list">
      <span class="period">{year}</span>
      {data.map((item) => (
        <Topics name={item.taxonomy} posts={item.posts} year={year} />
      ))}
    </div>
  );
}
