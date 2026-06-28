import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SpaceTravelApi from "../services/SpaceTravelApi";
import Loading from "../components/Loading";
import { useLoading } from "../context/LoadingContext";

function Spacecrafts() {
  const [spacecrafts, setSpacecrafts] = useState([]);
  const [planets, setPlanets] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [launchingId, setLaunchingId] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    async function loadDashboard() {
      setPageLoading(true);
      const [spacecraftResponse, planetResponse] = await Promise.all([
        SpaceTravelApi.getSpacecrafts(),
        SpaceTravelApi.getPlanets(),
      ]);

      setSpacecrafts(spacecraftResponse.data);
      setPlanets(planetResponse.data);
      setPageLoading(false);
    }

    loadDashboard();
  }, []);

  const fleetStats = useMemo(() => {
    const totalCapacity = spacecrafts.reduce((sum, ship) => sum + Number(ship.capacity), 0);
    const largestShip = spacecrafts.reduce(
      (largest, ship) => (Number(ship.capacity) > Number(largest.capacity || 0) ? ship : largest),
      {}
    );

    return {
      totalCapacity,
      largestShipName: largestShip.name || "None",
    };
  }, [spacecrafts]);

  function getPlanetName(locationId) {
    return planets.find((planet) => planet.id === Number(locationId))?.name || "Unknown";
  }

  async function handleDelete(id) {
    setIsLoading(true);
    const response = await SpaceTravelApi.destroySpacecraftById({ id });
    setSpacecrafts(response.data);
    setIsLoading(false);
  }

  async function handleReset() {
    setIsLoading(true);
    await SpaceTravelApi.resetFleet();
    const [spacecraftResponse, planetResponse] = await Promise.all([
      SpaceTravelApi.getSpacecrafts(),
      SpaceTravelApi.getPlanets(),
    ]);
    setSpacecrafts(spacecraftResponse.data);
    setPlanets(planetResponse.data);
    setIsLoading(false);
  }

  function handleLaunch(shipId) {
    setLaunchingId(shipId);
    setCountdown(3);

    setTimeout(() => setCountdown(2), 1000);
    setTimeout(() => setCountdown(1), 2000);
    setTimeout(() => {
      setCountdown(null);
      setLaunchingId(null);
    }, 3000);
  }

  if (pageLoading) return <Loading />;

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Fleet Dashboard</p>
          <h2>Your Spacecraft Fleet</h2>
          <p className="muted">Total ships: {spacecrafts.length}</p>
        </div>

        <div className="header-actions">
          <button className="button secondary" onClick={handleReset}>
            Reset Fleet
          </button>
          <Link className="button" to="/spacecraft/build">
            Build Spacecraft
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Ships</span>
          <strong>{spacecrafts.length}</strong>
        </div>
        <div className="stat-card">
          <span>Total Capacity</span>
          <strong>{fleetStats.totalCapacity}</strong>
        </div>
        <div className="stat-card">
          <span>Largest Ship</span>
          <strong>{fleetStats.largestShipName}</strong>
        </div>
      </div>

      {spacecrafts.length === 0 ? (
        <div className="empty-state">
          <h3>No spacecraft found.</h3>
          <p>Build your first spacecraft to start your fleet.</p>
          <Link className="button" to="/spacecraft/build">
            Build Now
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {spacecrafts.map((ship) => (
            <article className="card" key={ship.id}>
              <div className={launchingId === ship.id ? "ship-icon launched" : "ship-icon"}>🚀</div>

              <h3>{ship.name}</h3>
              <p>
                <strong>Type:</strong> {ship.type || "Transport Ship"}
              </p>
              <p>
                <strong>Capacity:</strong> {ship.capacity}
              </p>
              <p>
                <strong>Current Location:</strong> {getPlanetName(ship.currentLocation)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {launchingId === ship.id ? `Launching in ${countdown}...` : ship.status || "Docked"}
              </p>

              <div className="card-actions">
                <Link to={`/spacecraft/${ship.id}`}>View Details</Link>

                <button onClick={() => handleLaunch(ship.id)} disabled={launchingId === ship.id}>
                  {launchingId === ship.id ? "Launching" : "Launch Animation"}
                </button>

                <button onClick={() => handleDelete(ship.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Spacecrafts;
