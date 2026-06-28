import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SpaceTravelApi from "../services/SpaceTravelApi";
import Loading from "../components/Loading";

function Spacecraft() {
  const { id } = useParams();

  const [spacecraft, setSpacecraft] = useState(null);
  const [planets, setPlanets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSpacecraft() {
      const [spacecraftResponse, planetResponse] = await Promise.all([
        SpaceTravelApi.getSpacecraftById({ id }),
        SpaceTravelApi.getPlanets(),
      ]);

      setSpacecraft(spacecraftResponse.data);
      setPlanets(planetResponse.data);
      setIsLoading(false);
    }

    loadSpacecraft();
  }, [id]);

  function getPlanetName(locationId) {
    return planets.find((planet) => planet.id === Number(locationId))?.name || "Unknown";
  }

  if (isLoading) return <Loading />;

  if (!spacecraft) {
    return (
      <section className="detail-card">
        <h2>Spacecraft Not Found</h2>
        <p>This spacecraft may have been deleted from your fleet.</p>
        <Link className="button" to="/spacecrafts">
          Back to Fleet
        </Link>
      </section>
    );
  }

  return (
    <section className="detail-card">
      <div className="detail-icon">🛰️</div>
      <p className="eyebrow">Spacecraft Details</p>
      <h2>{spacecraft.name}</h2>

      <div className="detail-list">
        <p>
          <strong>Type:</strong> {spacecraft.type || "Transport Ship"}
        </p>
        <p>
          <strong>Capacity:</strong> {spacecraft.capacity}
        </p>
        <p>
          <strong>Current Location:</strong> {getPlanetName(spacecraft.currentLocation)}
        </p>
        <p>
          <strong>Speed:</strong> {spacecraft.speed || "Unknown"}
        </p>
        <p>
          <strong>Mission:</strong> {spacecraft.mission || "Human evacuation"}
        </p>
        <p>
          <strong>Description:</strong> {spacecraft.description || "No description added."}
        </p>
      </div>

      <Link className="button" to="/spacecrafts">
        Back to Fleet
      </Link>
    </section>
  );
}

export default Spacecraft;
