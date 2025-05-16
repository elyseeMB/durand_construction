import type { CollectionEntry } from "astro:content";
import { useEffect, useState } from "preact/hooks";
import { ProgressiveImage } from "./ProgressImage.tsx";

type PropsData = {
  taxonomy: string;
  posts: CollectionEntry<"blog">[];
};

type Props = {
  data: PropsData[];
};

export function ViewProjets({ data }: Props) {
  const onlyTaxonomyWithPosts = data.filter((d) =>
    d.posts.some((post) => post !== null)
  );

  return (
    <>
      <div class="description-view">
        <div class="left">
          <h3 class="heading-primary">
            Entre idées, chantiers et innovations : suivez notre actualité au
            cœur de l’architecture et du bâtiment
          </h3>
          <h6 class="heading-secondary">
            nous vous partageons ici l’envers du décor, les tendances qui nous
            animent et notre approche sur la manière de bâtir intelligemment.
          </h6>
        </div>
        <div className="indicator">
          <div class="arrow">→</div>
          <span>(scroll)</span>
        </div>
        <div class="approach">
          <List data={onlyTaxonomyWithPosts} />

          <div class="list">
            <span class="period">2024</span>
            <div class="topics">
              <div class="taxonomy">Matériaux & Techniques</div>
              <ul>
                <li>Béton bas carbone : quelles solutions aujourd’hui ?</li>
                <li>
                  Bois, acier, terre crue : pourquoi nous diversifions les
                  matériaux
                </li>
                <li>
                  L’importance de la lumière naturelle dans nos constructions
                </li>
              </ul>
            </div>

            <div class="topics">
              <div class="taxonomy">Architecture & Design</div>
              <ul>
                <li>5 tendances architecturales à suivre en 2025</li>
                <li>L’architecture minimaliste : fonction et élégance</li>
                <li>Comment concevoir un espace de vie fluide et harmonieux</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Topics({ name, posts }: { name: string; posts: PropsData["posts"] }) {
  const [isMouseEnter, setIsMouseEnter] = useState(false);
  const [image, setImage] = useState(null);
  // console.log(posts);

  // console.log(isMouseEnter, image);

  return (
    <div class="topics">
      <div class="taxonomy">{name} →</div>

      <ul>
        {posts?.map((post) => (
          <li
            data-image={post.data.thumbnail}
            onMouseEnter={(ev) => {
              setIsMouseEnter(ev.isTrusted);
              setImage(
                (ev.target as HTMLLIElement).getAttribute("data-image")!
              );
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

function List({ data }: { data: PropsData[] }) {
  return (
    <div class="list">
      <span class="period">2025</span>
      {data.map((item) => (
        <Topics name={item.taxonomy} posts={item.posts} />
      ))}

      {/* <div class="topics">
        <div class="taxonomy">Matériaux & Techniques</div>
        <ul>
          <li>Béton bas carbone : quelles solutions aujourd’hui ?</li>
          <li>
            Bois, acier, terre crue : pourquoi nous diversifions les matériaux
          </li>
          <li>L’importance de la lumière naturelle dans nos constructions</li>
        </ul>
      </div>

      <div class="topics">
        <div class="taxonomy">Architecture & Design</div>
        <ul>
          <li>5 tendances architecturales à suivre en 2025</li>
          <li>L’architecture minimaliste : fonction et élégance</li>
          <li>Comment concevoir un espace de vie fluide et harmonieux</li>
        </ul>
      </div>

      <div class="topics">
        <div class="taxonomy">Durabilité & Innovation</div>
        <ul>
          <li>Construction durable : nos engagements au quotidien</li>
          <li>Réemploi des matériaux : un levier écologique et économique</li>
          <li>L’intégration des énergies renouvelables dans l’architecture</li>
        </ul>
      </div>

      <div class="topics">
        <div class="taxonomy">Vie du cabinet</div>
        <ul>
          <li>Rencontre avec notre équipe : qui fait quoi ?</li>
          <li>Notre méthodologie : comment nous accompagnons nos clients</li>
          <li>
            Visite virtuelle de nos bureaux et de notre atelier de maquettes
          </li>
        </ul>
      </div>

      <div class="topics">
        <div class="taxonomy">Pédagogie & Conseils</div>
        <ul>
          <li>
            7 erreurs fréquentes dans un projet de construction (et comment les
            éviter)
          </li>
          <li>Faut-il un architecte pour une maison individuelle ?</li>
          <li>
            Quelles sont les étapes clés avant de déposer un permis de
            construire ?
          </li>
        </ul>
      </div>

      <div class="topics">
        <div class="taxonomy">Réflexions & Vision</div>
        <ul>
          <li>
            Quelle place pour l’architecture dans une société en transition ?
          </li>
          <li>
            Comment bâtir pour demain ? Nos convictions pour un habitat durable
          </li>
          <li>Le rapport au temps en architecture : construire pour durer</li>
        </ul>
      </div> */}
    </div>
  );
}
