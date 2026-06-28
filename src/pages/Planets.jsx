import React, { useEffect, useMemo, useState } from "react";
import SpaceTravelApi from "../services/SpaceTravelApi";
import Loading from "../components/Loading";
import { useLoading } from "../context/LoadingContext";

function Planets() {
  const [planets, setPlanets] = useState([]);
  const [spacecrafts, setSpacecrafts] = useState([]);
  const [missionHistory, setMissionHistory] = useState([]);
  const [selectedPlanetId, setSelectedPlanetId] = useState("");
  const [selectedSpacecraftId, setSelectedSpacecraftId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    async function loadPlanetsPage() {
      setPageLoading(true);
      const [planetResponse, spacecraftResponse, missionResponse] = await Promise.all([
        SpaceTravelApi.getPlanets(),
        SpaceTravelApi.getSpacecrafts(),
        SpaceTravelApi.getMissionHistory(),
      ]);

      setPlanets(planetResponse.data);
      setSpacecrafts(spacecraftResponse.data);
      setMissionHistory(missionResponse.data);
      setPageLoading(false);
    }

    loadPlanetsPage();
  }, []);

  const selectedPlanet = useMemo(
    () => planets.find((planet) => planet.id === Number(selectedPlanetId)),
    [planets, selectedPlanetId]
  );

  const availableSpacecrafts = useMemo(() => {
    if (!selectedPlanetId) return [];
    return spacecrafts.filter((ship) => Number(ship.currentLocation) !== Number(selectedPlanetId));
  }, [spacecrafts, selectedPlanetId]);

  function getShipsOnPlanet(planetId) {
    return spacecrafts.filter((ship) => Number(ship.currentLocation) === Number(planetId));
  }

  function getPlanetName(planetId) {
    return planets.find((planet) => planet.id === Number(planetId))?.name || "Unknown";
  }

  function handlePlanetSelect(event) {
    setSelectedPlanetId(event.target.value);
    setSelectedSpacecraftId("");
    setMessage("");
    setError("");
  }

  async function handleSendSpacecraft(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedPlanetId) {
      setError("Select a destination planet first.");
      return;
    }

    if (!selectedSpacecraftId) {
      setError("Select a spacecraft after choosing a destination planet.");
      return;
    }

    setIsLoading(true);
    const response = await SpaceTravelApi.sendSpacecraftToPlanet({
      spacecraftId: selectedSpacecraftId,
      targetPlanetId: Number(selectedPlanetId),
    });
    const missionResponse = await SpaceTravelApi.getMissionHistory();
    setIsLoading(false);

    if (response.isError) {
      setError(response.data);
      return;
    }

    setPlanets(response.data.planets);
    setSpacecrafts(response.data.spacecrafts);
    setMissionHistory(missionResponse.data);
    setSelectedSpacecraftId("");

    setMessage(
      `${response.data.mission.shipName} successfully moved ${response.data.mission.passengers.toLocaleString()} people from ${response.data.mission.from} to ${response.data.mission.to}.`
    );
  }

  if (pageLoading) return <Loading />;

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Mission Control</p>
          <h2>Planets</h2>
          <p className="muted">Choose a destination planet first, then choose a spacecraft to send there.</p>
        </div>
      </div>

      <form className="mission-panel" onSubmit={handleSendSpacecraft}>
        <div>
          <label htmlFor="planetSelect">Destination Planet</label>
          <select id="planetSelect" value={selectedPlanetId} onChange={handlePlanetSelect}>
            <option value="">Select planet</option>
            {planets.map((planet) => (
              <option key={planet.id} value={planet.id}>
                {planet.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="spacecraftSelect">Spacecraft</label>
          <select
            id="spacecraftSelect"
            value={selectedSpacecraftId}
            onChange={(event) => setSelectedSpacecraftId(event.target.value)}
            disabled={!selectedPlanetId}
          >
            <option value="">
              {selectedPlanetId ? "Select spacecraft" : "Pick a planet first"}
            </option>
            {availableSpacecrafts.map((ship) => (
              <option key={ship.id} value={ship.id}>
                {ship.name} — currently on {getPlanetName(ship.currentLocation)}
              </option>
            ))}
          </select>
        </div>

        <button className="button" type="submit">
          Send Spacecraft
        </button>

        {selectedPlanet && (
          <p className="muted mission-note">
            Destination selected: <strong>{selectedPlanet.name}</strong>. Spacecraft already on {selectedPlanet.name} are hidden from the spacecraft dropdown.
          </p>
        )}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message mission-error">{error}</p>}
      </form>

      <div className="card-grid">
        {planets.map((planet) => {
          const shipsOnPlanet = getShipsOnPlanet(planet.id);

          return (
            <article className="card planet-card" key={planet.id}>
              <div className="planet-icon">{planet.pictureUrl || "🪐"}</div>
              <h3>{planet.name}</h3>
              <p className="population-number">{planet.currentPopulation.toLocaleString()}</p>
              <p className="muted">Current Population</p>
              <p>{planet.distance}</p>
              <p>{planet.description}</p>

              <div className="planet-ships">
                <strong>Spacecraft on {planet.name}</strong>
                {shipsOnPlanet.length === 0 ? (
                  <p className="muted">No spacecraft stationed here.</p>
                ) : (
                  <ul>
                    {shipsOnPlanet.map((ship) => (
                      <li key={ship.id}>
                        {ship.name} <span>Capacity: {ship.capacity}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {missionHistory.length > 0 && (
        <section className="mission-history">
          <p className="eyebrow">Mission History</p>
          <h3>Recent Transfers</h3>
          <ul>
            {missionHistory.map((mission) => (
              <li key={mission.id}>
                <strong>{mission.shipName}</strong> moved {mission.passengers.toLocaleString()} people from {mission.from} to {mission.to}.
                <span>{mission.createdAt}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}

export default Planets;
