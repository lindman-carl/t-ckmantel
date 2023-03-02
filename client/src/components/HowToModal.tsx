import { useEffect, useState } from "react";
import Button from "./Button";

const DotSvg = ({ color }: { color: string }) => (
  <svg width={8} height={8} viewBox="0 0 8 8" fill="none">
    <circle cx={4} cy={4} r={4} fill={color} />
  </svg>
);

const slides: { text: string; image: string; imageFallback: string }[] = [
  {
    text: "Täckmantel is a party game best played around a table with friends. The goal is to guess who is the undercover agent. The undercover agent is trying to blend in with the other players. ",
    image: "/images/how-to/01.webp",
    imageFallback: "/images/how-to/01.png",
  },
  {
    text: "The game is played in rounds. Each game begins with each player getting a secret word. The undercover agent gets a secret word that is different from the other players. The common word is the same for all other players. ",
    image: "/images/how-to/02.webp",
    imageFallback: "/images/how-to/02.png",
  },
  {
    text: "Every round one player is selected to start describing their secret word with a short sentence. When everyone has described their word, the players vote anonymously on who they think is the undercover agent. The player with the most votes is eliminated.",
    image: "/images/how-to/03.webp",
    imageFallback: "/images/how-to/03.png",
  },
  {
    text: "The game ends when all the undercover agents have been eliminated or when the undercover agent(s) have survived long enough for the other players to no longer compose a majority.",
    image: "/images/how-to/04.webp",
    imageFallback: "/images/how-to/04.png",
  },
  {
    text: "Points are awarded to the players who have not been eliminated, and the undercover agent(s) are awarded points each surviving round. GL HF!",
    image: "/images/how-to/04.webp",
    imageFallback: "/images/how-to/04.png",
  },
];

type Props = { onClose: () => void };

const HowToModal = ({ onClose }: Props) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      onClose();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const getLabel = () => {
    if (currentSlide === slides.length - 1) {
      return "Let's go!";
    } else {
      return "Next";
    }
  };

  return (
    <div className="fixed top-0 z-50 flex h-screen w-screen flex-col justify-center bg-black bg-opacity-20 shadow-2xl backdrop-blur-sm">
      <div className="relative mx-auto flex w-80 flex-col items-center justify-between rounded-md bg-white py-8 text-sky-900 backdrop-blur-sm md:w-96">
        <div className="flex flex-col items-center justify-start px-4">
          <picture>
            <source srcSet={slides[currentSlide].image} type="image/webp" />
            <img
              src={slides[currentSlide].imageFallback}
              alt="how-to slide image"
            />
          </picture>
          <div className="h-48 px-4 text-justify">
            {slides[currentSlide].text}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="mb-4 mt-2 flex flex-row items-center justify-center gap-x-2">
            {slides.map((_, i) => (
              <DotSvg key={i} color={currentSlide === i ? "#000" : "#E5E7EB"} />
            ))}
          </div>
          <Button label={getLabel()} onClick={handleNext} />
        </div>
      </div>
    </div>
  );
};

export default HowToModal;
