import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">React Space Project</p>
      <h2>Build and manage your own spacecraft fleet.</h2>
      <p>
        View spacecraft, build new ships, explore planets, and move through
        dynamic React Router pages.
      </p>

      <div className="hero-actions">
        <Link className="button" to="/spacecrafts">
          View Fleet
        </Link>
        <Link className="button secondary" to="/spacecraft/build">
          Build Spacecraft
        </Link>
      </div>
    </section>
  );
}

export default Home;
