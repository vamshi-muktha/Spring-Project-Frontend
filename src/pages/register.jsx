import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { getApiUrl } from "../config/api";
import "./register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    dob: "",
    password: "",
    address: "",
    mobileNumber: ""
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Name validation: 2-50 characters
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = "Name must be between 2 and 50 characters";
    }

    // Username validation: 4-20 characters
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 4 || formData.username.length > 20) {
      newErrors.username = "Username must be between 4 and 20 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    // Password validation: minimum 6 characters
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Address validation: 5-100 characters
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.length < 5 || formData.address.length > 100) {
      newErrors.address = "Address must be between 5 and 100 characters";
    }

    // Mobile number validation: 10-digit Indian number starting with 6-9
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.mobileNumber)) {
        newErrors.mobileNumber = "Mobile number must be a valid 10-digit Indian number";
      }
    }

    // DOB validation: MM-DD-YYYY format
    if (!formData.dob.trim()) {
      newErrors.dob = "DOB is required";
    } else {
      const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dobRegex.test(formData.dob)) {
        newErrors.dob = "DOB must be in MM-DD-YYYY format";
      }
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
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleDobChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format as MM-DD-YYYY
    if (value.length > 0) {
      if (value.length <= 4) {
        value = value.slice(0, 2) + (value.length > 2 ? '-' + value.slice(2) : '');
      } else if (value.length <= 8) {
        value = value.slice(0, 2) + '-' + value.slice(2, 4) + '-' + value.slice(4, 8);
      } else {
        value = value.slice(0, 2) + '-' + value.slice(2, 4) + '-' + value.slice(4, 8);
      }
    }
    
    setFormData({
      ...formData,
      dob: value
    });
    
    if (errors.dob) {
      setErrors({
        ...errors,
        dob: ""
      });
    }
  };

  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    setFormData({
      ...formData,
      mobileNumber: value
    });
    
    if (errors.mobileNumber) {
      setErrors({
        ...errors,
        mobileNumber: ""
      });
    }
  };

  const handleRegister = async (e) => {
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
      const res = await axios.post(
        getApiUrl("/users/register"),
        new URLSearchParams({
          name: formData.name.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          dob: formData.dob.trim(),
          password: formData.password,
          address: formData.address.trim(),
          mobileNumber: formData.mobileNumber.trim()
        }),
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      console.log(res.data);
      if(res.data === "Errors"){
        setError("Fields have some errors.");
        setLoading(false);
        return;
      }else if(res.data === "User Exists with given email"){
        setError("User Exists with given email");
        setLoading(false);
        return;
      }else if(res.data === "User Exists with given username"){
        setError("User Exists with given username");
        setLoading(false);
        return;
      }else{
        setSuccess("Registration successful! Redirecting to Otp...");
        setTimeout(() => {
          const params = new URLSearchParams({
            name: formData.name.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
            dob: formData.dob.trim(),
            password: formData.password,
            address: formData.address.trim(),
            mobileNumber: formData.mobileNumber.trim()
          });
          
          window.location.href = `/otp?${params.toString()}`;
        }, 2000);
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.";
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
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>User Registration</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="input-group">
          <input
            type="text"
            name="name"
            placeholder="Name (2-50 characters)"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={50}
            className={errors.name ? "input-error" : ""}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="input-group">
          <input
            type="text"
            name="username"
            placeholder="Username (4-20 characters)"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={4}
            maxLength={20}
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
        </div>

        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="input-group">
          <input
            type="text"
            name="dob"
            placeholder="Date of Birth (MM-DD-YYYY)"
            value={formData.dob}
            onChange={handleDobChange}
            required
            maxLength={10}
            className={errors.dob ? "input-error" : ""}
          />
          {errors.dob && <span className="field-error">{errors.dob}</span>}
        </div>

        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="input-group">
          <input
            type="text"
            name="address"
            placeholder="Address (5-100 characters)"
            value={formData.address}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={100}
            className={errors.address ? "input-error" : ""}
          />
          {errors.address && <span className="field-error">{errors.address}</span>}
        </div>

        <div className="input-group">
          <input
            type="tel"
            name="mobileNumber"
            placeholder="Mobile Number (10 digits, starts with 6-9)"
            value={formData.mobileNumber}
            onChange={handleMobileChange}
            required
            maxLength={10}
            className={errors.mobileNumber ? "input-error" : ""}
          />
          {errors.mobileNumber && <span className="field-error">{errors.mobileNumber}</span>}
        </div>

        <button type="submit" className="register-button" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="divider">or</div>

        {/* <form 
          action="http://localhost:8088/oauth2/authorization/google" 
          method="POST"
          onSubmit={async (e) => {
            e.preventDefault();
            // Redirect to OAuth endpoint with callback URL
            window.location.href = "http://localhost:8088/oauth2/authorization/google?redirect_uri=http://localhost:3000/oauth/callback";
          }}
        > */}
          <button  onClick={() => {
    window.location.href = getApiUrl("/oauth2/authorization/google");
  }} type="submit" className="google-button">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Register with Google
          </button>
        {/* </form> */}

        <div className="login-link">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
