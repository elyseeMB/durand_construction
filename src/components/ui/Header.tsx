import { classNames } from "../../function/dom.ts";
import { useToggle } from "../../hooks/useToggle.ts";

export function Header() {
  const [isOpen, setIsOpen] = useToggle(false);
  return (
    <nav
      class={classNames("container header", isOpen && "is-open")}
      id="header"
    >
      <div className="navigation">
        <div className="branding">
          <div className="logo">
            <a href="/durand-construction/">
              <svg
                id="logo"
                xmlns="http://www.w3.org/2000/svg"
                width="362.16"
                height="310.65"
                viewBox="0 0 362.16 310.65"
              >
                <polygon
                  points="322.38 155.27 281.95 155.27 281.95 54.46 181.08 54.46 181.08 14.02 322.38 14.02 322.38 155.27"
                  style="fill:#e15729; stroke-width:0px;"
                ></polygon>
                <polygon
                  points="181.08 296.62 39.78 296.62 39.78 155.32 80.22 155.32 80.22 256.19 181.08 256.19 181.08 296.62"
                  style="fill:#e15729; stroke-width:0px;"
                ></polygon>
                <path
                  d="m114.7,211.42h12.23l27.95-112.19h-12.23l2.91-11.65h56.68c8.41,0,15.66,1.26,21.74,3.78,6.08,2.52,11.06,5.95,14.95,10.29,3.88,4.34,6.76,9.38,8.64,15.14,1.87,5.76,2.82,11.87,2.82,18.34s-.75,13.36-2.23,20.28c-1.49,6.92-3.69,13.65-6.6,20.19-2.91,6.54-6.57,12.68-10.97,18.44-4.4,5.76-9.54,10.77-15.43,15.04-5.89,4.27-12.49,7.67-19.8,10.19-7.31,2.52-15.3,3.78-23.97,3.78h-59.59l2.91-11.65Zm42.12-.78h10.29c12.16,0,21.67-3.33,28.53-10,6.86-6.66,12.1-17.18,15.72-31.54,2.33-9.44,4.17-16.98,5.53-22.61,1.36-5.63,2.36-10.09,3.01-13.39.65-3.3,1.07-5.82,1.26-7.57.19-1.75.29-3.46.29-5.14,0-7.5-2.14-12.81-6.41-15.92-4.27-3.11-10.48-4.66-18.63-4.66h-11.84l-27.76,110.83Z"
                  style="fill:#273472; stroke-width:0px;"
                ></path>
              </svg>
            </a>
          </div>
          <div className="col">
            <div className="name">Nous sommes</div>
            <ul class="header-logo">
              <li>
                <a href="/durand-construction/">DURAND CONSTRUCTION</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col">
          <div className="name">Sitemap</div>
          <ul class="header-nav">
            <li>
              <a href="/durand-construction/work">WORK,</a>
            </li>
            <li>
              <a href="/durand-construction/about">ABOUT,</a>
            </li>
            <li>
              <a href="/durand-construction/blog">BLOG</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="col">
        <div className="name">BASÉ À</div>
        <ul class="header-nav">
          <li>
            <a href="#">BRAZZAVILLE</a>
          </li>
        </ul>
      </div>

      <ul class="header-side">
        <li className="header__burger">
          <button onClick={setIsOpen} id="js-burger">
            <span>Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
