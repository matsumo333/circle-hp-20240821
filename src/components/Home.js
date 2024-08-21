import { useEffect, useState } from "react";
import "./Home.scss";

const Home = () => {
  const [displayImages, setDisplayImages] = useState([]);
  const [isActive, setIsActive] = useState(false);

  // 24枚の画像を slides 配列に追加
  const slides = Array.from({ length: 24 }, (_, index) => ({
    src: `./images/img${index + 1}.jpg`,
    alt: `Slide ${index + 1}`,
  }));

  // ランダムに6枚の画像を選択する関数
  const getRandomImages = () => {
    const shuffledSlides = [...slides].sort(() => 0.5 - Math.random());
    return shuffledSlides.slice(0, 8);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateImages = () => {
      setDisplayImages(getRandomImages());
    };

    updateImages(); // 初回の画像選択

    const interval = setInterval(updateImages, 5000); // 5秒ごとに画像を更新

    return () => clearInterval(interval);
  }, [slides.length]);

  const headlineText = "RAISING 2004";

  return (
    <div>
      <div className="home-container">
        <div className="home-images-content">
          {displayImages.map((slide, index) => (
            <div
              className="images"
              key={index}
              style={{
                backgroundImage: `url(${slide.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          ))}
        </div>
      </div>
      <div className="home-text">
        <div className={`title ${isActive ? "is-active" : ""}`}>
          {headlineText.split("").map((char, index) => (
            <span
              className={`char ${char === " " ? "whitespace" : ""}`}
              style={{ "--char-index": index }}
              key={index}
            >
              {char}
            </span>
          ))}
        </div>
        <div className="home-text">
          <p>
            緑豊かな城陽市で楽しくテニスをしております。
            <br />
            サークルを初めて２０年が経ち、高齢化が進行しましたが
            <br />
            素敵な仲間に囲まれて楽しい時間を過ごしています。
            <br />
            皆さんの活躍で城陽クラブ対抗戦では一部に属してます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
