import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Otp.css";

function Otp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const redirectTo = location.state?.redirectTo || "/home";
  const paymentData = location.state?.paymentData || null;

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    setError("");

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8088/verify-otp",
        {
          email: email.trim().toLowerCase(),
          otp: finalOtp
        }
      );

      if (res.data === true) {
        navigate(redirectTo, {
          state: paymentData ? { paymentData } : undefined
        });
      } else {
        setError("Invalid OTP");
      }
    } catch {
      setError("OTP verification failed");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>OTP Verification</h2>
        <p className="subtitle">Enter the 6-digit code sent to your email</p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
            />
          ))}
        </div>

        <button onClick={handleVerify}>Verify OTP</button>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default Otp;
