import React, { useEffect, useState } from "react";

const Home = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 0.5s",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: "3rem",
          marginBottom: "2rem",
          transform: `translateY(${fadeIn ? "0" : "-50px"})`,
          opacity: fadeIn ? 1 : 0,
          transition: "transform 0.5s, opacity 0.5s",
          transitionDelay: "0.2s",
        }}
      >
        Welcome to the ADHD Panel
      </h2>
      <p
        style={{
          fontSize: "1.5rem",
          transform: `translateY(${fadeIn ? "0" : "50px"})`,
          opacity: fadeIn ? 1 : 0,
          transition: "transform 0.5s, opacity 0.5s",
          transitionDelay: "0.4s",
        }}
      >
        We're here to help you manage your ADHD and improve your daily life.
      </p>
    </div>
  );
};

export default Home;