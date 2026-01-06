import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./cardform.css";

function CardForm() {
  const [formData, setFormData] = useState({
    type: "",
    PAN: "",
    empStatus: "",
    monthlyIncome: "",
    cardType: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(
        "http://localhost:8088/applyCard",
        new URLSearchParams({
          type: formData.type,
          PAN: formData.PAN,
          empStatus: formData.empStatus,
          monthlyIncome: formData.monthlyIncome,
          cardType: formData.cardType
        }),
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      setSuccess("Card application submitted successfully!");
      // Optionally redirect after a delay
      setTimeout(() => {
        window.location.href = "/home";
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Card application failed. Please try again.");
    }
  };

  return (
    <div className="cardform-container">
      <form className="cardform-form" onSubmit={handleSubmit}>
        <h2>Card Application Form</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="input-group">
          <label>Debit/Credit</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">--Select--</option>
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        <div className="input-group">
          <label>PAN Number</label>
          <input
            type="text"
            name="PAN"
            placeholder="Enter PAN Number"
            value={formData.PAN}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Employment Status</label>
          <input
            type="text"
            name="empStatus"
            placeholder="Enter Employment Status"
            value={formData.empStatus}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Monthly Income</label>
          <input
            type="number"
            name="monthlyIncome"
            placeholder="Enter Monthly Income"
            value={formData.monthlyIncome}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="input-group">
          <label>Card Type</label>
          <select
            name="cardType"
            value={formData.cardType}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">--Select--</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
          </select>
        </div>

        <button type="submit" className="apply-button">Apply</button>

        <div className="back-link">
          <Link to="/home">← Back to Home</Link>
        </div>
      </form>
    </div>
  );
}

export default CardForm;
