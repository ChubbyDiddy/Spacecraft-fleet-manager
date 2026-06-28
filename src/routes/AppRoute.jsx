import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Spacecrafts from "../pages/Spacecrafts";
import SpacecraftBuild from "../pages/SpacecraftBuild";
import Spacecraft from "../pages/Spacecraft";
import Planets from "../pages/Planets";

function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/spacecrafts" element={<Spacecrafts />} />
      <Route path="/spacecraft/build" element={<SpacecraftBuild />} />
      <Route path="/spacecraft/:id" element={<Spacecraft />} />
      <Route path="/planets" element={<Planets />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoute;
