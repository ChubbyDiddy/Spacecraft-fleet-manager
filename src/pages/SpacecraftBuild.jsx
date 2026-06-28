import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SpaceTravelApi from "../services/SpaceTravelApi";
import { useLoading } from "../context/LoadingContext";

function SpacecraftBuild() {
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    capacity: "",
    speed: "",
    mission: "",
    description: "",
    pictureUrl: "",
  });
  const [errors, setErrors] = useState({});

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.capacity) {
      newErrors.capacity = "Capacity is required.";
    } else if (Number(formData.capacity) <= 0) {
      newErrors.capacity = "Capacity must be greater than 0.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    }

    return newErrors;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    await SpaceTravelApi.createSpacecraft({
      ...formData,
      capacity: Number(formData.capacity),
    });
    setIsLoading(false);

    navigate("/spacecrafts");
  }

  return (
    <section className="form-page">
      <p className="eyebrow">Fleet Builder</p>
      <h2>Build a New Spacecraft</h2>
      <p className="muted">New spacecraft are built on Earth and can be transferred from the Planets page.</p>

      <form onSubmit={handleSubmit} className="ship-form" noValidate>
        <label>
          Name <span className="required">*</span>
          <input
            className={errors.name ? "input-error" : ""}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter spacecraft name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </label>

        <label>
          Type
          <input
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="Scout, Cargo, Passenger..."
          />
        </label>

        <label>
          Capacity <span className="required">*</span>
          <input
            className={errors.capacity ? "input-error" : ""}
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Crew capacity"
          />
          {errors.capacity && <span className="error-message">{errors.capacity}</span>}
        </label>

        <label>
          Speed
          <input
            name="speed"
            value={formData.speed}
            onChange={handleChange}
            placeholder="Low, Medium, High..."
          />
        </label>

        <label>
          Mission
          <input
            name="mission"
            value={formData.mission}
            onChange={handleChange}
            placeholder="Exploration, transport, rescue..."
          />
        </label>

        <label>
          Picture URL
          <input
            name="pictureUrl"
            value={formData.pictureUrl}
            onChange={handleChange}
            placeholder="Optional image URL"
          />
        </label>

        <label>
          Description <span className="required">*</span>
          <textarea
            className={errors.description ? "input-error" : ""}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe this spacecraft"
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </label>

        <div className="form-actions">
          <Link className="button secondary" to="/spacecrafts">
            Back
          </Link>
          <button className="button" type="submit">
            Add to Fleet
          </button>
        </div>
      </form>
    </section>
  );
}

export default SpacecraftBuild;
