import { useEffect, useRef, useState, type ReactNode } from "preact/compat";
import { Card } from "./Card.tsx";

type Props = {
  scrollVisible?: number;
};

export function Carousel({ scrollVisible }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (
      !isMounted ||
      !sliderRef ||
      !wrapperRef ||
      !nextButtonRef ||
      !prevButtonRef
    ) {
      return;
    }

    const slider = {
      wrapper: wrapperRef.current!,
      nextButton: nextButtonRef.current!,
      prevButton: prevButtonRef.current!,

      get itemsToScroll() {
        if (typeof window === "undefined") {
          return 1;
        } else {
          return parseInt(
            window.getComputedStyle(this.wrapper!).getPropertyValue("--items"),
            10
          );
        }
      },

      get pages() {
        return Math.ceil(this.wrapper.children.length / this.itemsToScroll);
      },

      get page() {
        return Math.ceil(this.wrapper.scrollLeft / this.wrapper.offsetWidth);
      },

      updateUi() {
        if (this.page === 0) {
          this.prevButton.setAttribute("hidden", "hidden");
        } else {
          this.prevButton.removeAttribute("hidden");
        }

        if (this.page === this.pages - 1) {
          this.nextButton.setAttribute("hidden", "hidden");
        } else {
          this.nextButton.removeAttribute("hidden");
        }
      },

      move(n: number) {
        let newPage = this.page + n;

        if (newPage < 0) {
          newPage = 0;
        }

        if (newPage >= this.pages) {
          newPage = this.pages - 1;
        }

        const target = this.wrapper.children[
          newPage * this.itemsToScroll
        ] as HTMLElement;
        this.wrapper.scrollTo({
          left: target.offsetLeft,
          behavior: "smooth",
        });
      },
    };

    const handleScrollEnd = () => slider.updateUi();
    const handleNextClick = () => slider.move(1);
    const handlePrevClick = () => slider.move(-1);

    slider.nextButton.addEventListener("click", handleNextClick);
    slider.prevButton.addEventListener("click", handlePrevClick);
    slider.wrapper.addEventListener("scrollend", handleScrollEnd);
    slider.updateUi();

    return () => {
      slider.nextButton.removeEventListener("click", handleNextClick);
      slider.prevButton.removeEventListener("click", handlePrevClick);
      slider.wrapper.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [isMounted]);

  console.log("render");

  const style = {
    "--items": scrollVisible,
  };

  return (
    <>
      <button ref={prevButtonRef} data-slider-prev>
        prev
      </button>
      <div style={style} ref={wrapperRef} class="content" data-slider-wrapper>
        {Array.from({ length: 8 }, (_, k) => (
          <Card key={k}>
            <img src="/src/assets/1.jpg" alt="" />
            <div class="title">accusamus illum.</div>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos amet,
              numquam unde minima culpa quae delectus adipisci iste vel officia
              quo dicta laboriosam eligendi aperiam sunt possimus error a odio!
            </p>
          </Card>
        ))}
      </div>
      <button ref={nextButtonRef} data-slider-next>
        next
      </button>
    </>
  );
}
