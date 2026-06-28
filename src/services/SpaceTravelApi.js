const SPACECRAFT_STORAGE_KEY = "spacecraftFleet";
const PLANETS_STORAGE_KEY = "spaceTravelPlanets";
const MISSION_STORAGE_KEY = "spaceTravelMissionHistory";

const EARTH_ID = 3;

const starterPlanets = [
  {
    id: 1,
    name: "Mercury",
    currentPopulation: 0,
    pictureUrl: "☿️",
    distance: "57.9 million km from the Sun",
    description: "The smallest planet and closest to the Sun.",
  },
  {
    id: 2,
    name: "Venus",
    currentPopulation: 250000,
    pictureUrl: "♀️",
    distance: "108.2 million km from the Sun",
    description: "A hot rocky planet with a thick atmosphere.",
  },
  {
    id: 3,
    name: "Earth",
    currentPopulation: 8000000,
    pictureUrl: "🌎",
    distance: "149.6 million km from the Sun",
    description: "Humanity's damaged home world and the main evacuation point.",
  },
  {
    id: 4,
    name: "Mars",
    currentPopulation: 1200000,
    pictureUrl: "🔴",
    distance: "227.9 million km from the Sun",
    description: "The red planet and a major settlement for space travelers.",
  },
  {
    id: 5,
    name: "Jupiter",
    currentPopulation: 500000,
    pictureUrl: "🪐",
    distance: "778.5 million km from the Sun",
    description: "The largest planet in the solar system with orbital colonies.",
  },
  {
    id: 6,
    name: "Saturn",
    currentPopulation: 750000,
    pictureUrl: "🪐",
    distance: "1.43 billion km from the Sun",
    description: "A gas giant known for its ring system and floating stations.",
  },
];

const starterSpacecrafts = [
  {
    id: "1",
    name: "Explorer One",
    type: "Scout Ship",
    capacity: 5,
    speed: "High",
    mission: "Deep space exploration",
    description: "A fast spacecraft built for scouting new planets and gathering data.",
    currentLocation: EARTH_ID,
  },
  {
    id: "2",
    name: "Titan Hauler",
    type: "Cargo Ship",
    capacity: 30,
    speed: "Medium",
    mission: "Supply transport",
    description: "A heavy-duty spacecraft built for transporting supplies across long distances.",
    currentLocation: EARTH_ID,
  },
  {
    id: "3",
    name: "Nova Cruiser",
    type: "Passenger Ship",
    capacity: 15,
    speed: "Medium-High",
    mission: "Crew travel",
    description: "A balanced spacecraft designed to move crew members safely between planets.",
    currentLocation: 4,
  },
];

function createResponse(data, isError = false) {
  return Promise.resolve({ isError, data });
}

function readStorage(key, fallback) {
  const saved = localStorage.getItem(key);

  if (!saved) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getStoredPlanets() {
  const planets = readStorage(PLANETS_STORAGE_KEY, starterPlanets);
  return planets.map((planet) => ({
    ...planet,
    id: Number(planet.id),
    currentPopulation: Number(planet.currentPopulation) || 0,
  }));
}

function getStoredSpacecrafts() {
  const spacecrafts = readStorage(SPACECRAFT_STORAGE_KEY, starterSpacecrafts);

  const migratedSpacecrafts = spacecrafts.map((ship) => ({
    ...ship,
    id: String(ship.id),
    capacity: Number(ship.capacity) || 0,
    description: ship.description || ship.mission || "No description added.",
    currentLocation: Number(ship.currentLocation) || EARTH_ID,
    status: ship.status || "Docked",
  }));

  saveStorage(SPACECRAFT_STORAGE_KEY, migratedSpacecrafts);
  return migratedSpacecrafts;
}

function getMissionHistory() {
  return readStorage(MISSION_STORAGE_KEY, []);
}

function saveMissionHistory(history) {
  saveStorage(MISSION_STORAGE_KEY, history);
}

const SpaceTravelApi = {
  getPlanets() {
    return createResponse(getStoredPlanets());
  },

  getSpacecrafts() {
    return createResponse(getStoredSpacecrafts());
  },

  getSpacecraftById({ id }) {
    const spacecrafts = getStoredSpacecrafts();
    return createResponse(spacecrafts.find((ship) => ship.id === String(id)) || null);
  },

  createSpacecraft(newShip) {
    const spacecrafts = getStoredSpacecrafts();

    const ship = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: newShip.name,
      type: newShip.type || "Transport Ship",
      capacity: Number(newShip.capacity),
      speed: newShip.speed || "Unknown",
      mission: newShip.mission || "Human evacuation",
      description: newShip.description,
      pictureUrl: newShip.pictureUrl || "",
      currentLocation: EARTH_ID,
      status: "Docked",
    };

    const updatedSpacecrafts = [...spacecrafts, ship];
    saveStorage(SPACECRAFT_STORAGE_KEY, updatedSpacecrafts);
    return createResponse(ship);
  },

  buildSpacecraft(newShip) {
    return this.createSpacecraft(newShip);
  },

  destroySpacecraftById({ id }) {
    const spacecrafts = getStoredSpacecrafts();
    const updatedShips = spacecrafts.filter((ship) => ship.id !== String(id));

    saveStorage(SPACECRAFT_STORAGE_KEY, updatedShips);
    return createResponse(updatedShips);
  },

  deleteSpacecraft(id) {
    return this.destroySpacecraftById({ id });
  },

  sendSpacecraftToPlanet({ spacecraftId, targetPlanetId }) {
    const spacecrafts = getStoredSpacecrafts();
    const planets = getStoredPlanets();
    const targetId = Number(targetPlanetId);
    const spacecraft = spacecrafts.find((ship) => ship.id === String(spacecraftId));

    if (!spacecraft) {
      return createResponse("Spacecraft not found.", true);
    }

    if (Number(spacecraft.currentLocation) === targetId) {
      return createResponse("The spacecraft is already on that planet.", true);
    }

    const currentPlanet = planets.find((planet) => planet.id === Number(spacecraft.currentLocation));
    const targetPlanet = planets.find((planet) => planet.id === targetId);

    if (!currentPlanet || !targetPlanet) {
      return createResponse("Planet not found.", true);
    }

    const passengers = Math.min(Number(spacecraft.capacity), Number(currentPlanet.currentPopulation));

    const updatedPlanets = planets.map((planet) => {
      if (planet.id === currentPlanet.id) {
        return {
          ...planet,
          currentPopulation: planet.currentPopulation - passengers,
        };
      }

      if (planet.id === targetPlanet.id) {
        return {
          ...planet,
          currentPopulation: planet.currentPopulation + passengers,
        };
      }

      return planet;
    });

    const updatedSpacecrafts = spacecrafts.map((ship) =>
      ship.id === String(spacecraftId)
        ? { ...ship, currentLocation: targetId, status: "Docked" }
        : ship
    );

    const mission = {
      id: String(Date.now()),
      shipName: spacecraft.name,
      from: currentPlanet.name,
      to: targetPlanet.name,
      passengers,
      createdAt: new Date().toLocaleString(),
    };

    saveStorage(PLANETS_STORAGE_KEY, updatedPlanets);
    saveStorage(SPACECRAFT_STORAGE_KEY, updatedSpacecrafts);
    saveMissionHistory([mission, ...getMissionHistory()].slice(0, 10));

    return createResponse({
      planets: updatedPlanets,
      spacecrafts: updatedSpacecrafts,
      mission,
    });
  },

  getMissionHistory() {
    return createResponse(getMissionHistory());
  },

  resetFleet() {
    saveStorage(SPACECRAFT_STORAGE_KEY, starterSpacecrafts);
    saveStorage(PLANETS_STORAGE_KEY, starterPlanets);
    saveStorage(MISSION_STORAGE_KEY, []);
    return createResponse(starterSpacecrafts);
  },
};

export default SpaceTravelApi;
