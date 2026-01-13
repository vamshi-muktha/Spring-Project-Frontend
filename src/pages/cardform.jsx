import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { getApiUrl } from "../config/api";
import "./cardform.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function CardForm() {
  const [formData, setFormData] = useState({
    type: "",
    PAN: "",
    empStatus: "",
    monthlyIncome: "",
    cardType: ""
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Type validation (Debit/Credit)
    if (!formData.type.trim()) {
      newErrors.type = "Card type is required";
    }

    // PAN validation
    if (!formData.PAN.trim()) {
      newErrors.PAN = "PAN is required";
    }

    // Employment status validation
    if (!formData.empStatus.trim()) {
      newErrors.empStatus = "Employment status is required";
    }

    // Monthly income validation
    if (!formData.monthlyIncome.toString().trim()) {
      newErrors.monthlyIncome = "Monthly income is required";
    } else if (parseFloat(formData.monthlyIncome) < 0) {
      newErrors.monthlyIncome = "Monthly income must be a positive number";
    }

    // Card type validation (Platinum/Gold/Silver)
    if (!formData.cardType.trim()) {
      newErrors.cardType = "Card type selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user starts typing/selecting
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    setError("");
    setSuccess("");

    // Validate form before submission
    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const formParams = new URLSearchParams({
        type: formData.type.trim(),
        PAN: formData.PAN.trim(),
        empStatus: formData.empStatus.trim(),
        monthlyIncome: formData.monthlyIncome.toString().trim(),
        cardType: formData.cardType.trim()
      });

      console.log("Sending card application with data:", {
        type: formData.type.trim(),
        PAN: formData.PAN.trim(),
        empStatus: formData.empStatus.trim(),
        monthlyIncome: formData.monthlyIncome.toString().trim(),
        cardType: formData.cardType.trim()
      });

      const response = await axios.post(
        getApiUrl("/applyCard"),
        formParams,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          validateStatus: function (status) {
            // Don't throw error for any status code
            return status >= 200 && status < 500;
          }
        }
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("Response headers:", response.headers);

      // Check if response is HTML (likely a redirect or error page)
      if (typeof response.data === 'string' && (response.data.includes('<!DOCTYPE') || response.data.includes('<html'))) {
        setError("Received HTML response instead of JSON. Check backend endpoint.");
        console.error("Received HTML response:", response.data.substring(0, 200));
        return;
      }

      // Check for validation errors in response
      if (response.status === 200 || response.status === 201) {
        setSuccess("Card application submitted successfully!");
        // Optionally redirect after a delay
        setTimeout(() => {
          window.location.href = "/home";
        }, 2000);
      } else {
        setError(response.data?.message || response.data?.error || `Request failed with status ${response.status}`);
        setLoading(false);
      }

    } catch (err) {
      console.error("Error details:", err);
      console.error("Error response:", err.response);
      
      // Network error or request failed
      if (!err.response) {
        setError("Network error. Please check if the backend server is running.");
        setLoading(false);
        return;
      }

      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Card application failed. Please try again.";
      setError(errorMessage);
      
      // If backend returns field-specific errors, update errors state
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          const field = error.field || error.fieldName;
          if (field) {
            backendErrors[field] = error.defaultMessage || error.message;
          }
        });
        setErrors(backendErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cardform-container">
      <Navbar/>
      <br></br>
      <br></br>
      <div className = "cardform-content">
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
            className={`form-select ${errors.type ? "input-error" : ""}`}
          >
            <option value="">--Select--</option>
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
          {errors.type && <span className="field-error">{errors.type}</span>}
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
            className={errors.PAN ? "input-error" : ""}
          />
          {errors.PAN && <span className="field-error">{errors.PAN}</span>}
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
            className={errors.empStatus ? "input-error" : ""}
          />
          {errors.empStatus && <span className="field-error">{errors.empStatus}</span>}
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
            className={errors.monthlyIncome ? "input-error" : ""}
          />
          {errors.monthlyIncome && <span className="field-error">{errors.monthlyIncome}</span>}
        </div>

        <div className="input-group">
          <label>Card Type</label>
          <select
            name="cardType"
            value={formData.cardType}
            onChange={handleChange}
            required
            className={`form-select ${errors.cardType ? "input-error" : ""}`}
          >
            <option value="">--Select--</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
          </select>
          {errors.cardType && <span className="field-error">{errors.cardType}</span>}
        </div>

        <button type="submit" className="apply-button" disabled={loading}>
          {loading ? "Applying..." : "Apply"}
        </button>

        <div className="back-link">
          <Link to="/home">← Back to Home</Link>
        </div>
        
      </form>
      </div>
      <br></br>
      <br></br>
      <Footer/>
    </div>
  );
}

export default CardForm;
