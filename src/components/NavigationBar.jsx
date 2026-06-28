import React from "react";
import { NavLink } from "react-router-dom";

function NavigationBar() {
  return (
    <nav className="navbar">
      <h1 className="logo">Space Fleet</h1>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/spacecrafts">Spacecrafts</NavLink>
        <NavLink to="/spacecraft/build">Build</NavLink>
        <NavLink to="/planets">Planets</NavLink>
      </div>
    </nav>
  );
}

export default NavigationBar;
