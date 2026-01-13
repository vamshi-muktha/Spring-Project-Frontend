import { useState } from "react";
import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
import "./Otp.css";
import { useSearchParams } from "react-router-dom";
import { getApiUrl } from "../config/api";


function Otp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  // const location = useLocation();
  const params = new URLSearchParams(window.location.search);
  const [verifying, setVerifying] = useState(false);



  const pid = searchParams.get("pid");
  const amount = searchParams.get("amount");
  const cid = searchParams.get("cid");
  const email = searchParams.get("email");
  const status = searchParams.get("status");
  console.log(pid);
  console.log(params.get("name"));

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
    if (verifying) return;
    setVerifying(true);
    setError("");

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    if (pid !== null) {
      try {
        const res = await axios.post(
          getApiUrl(`/payment/verify?email=${email}&pid=${pid}&amount=${amount}&cid=${cid}&otp=${finalOtp}&status=${status}`),
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        );

        if (res.data === true) {
          setSuccess("OTP verified successfully");

          window.location.href = "/home";
        } else {
          setError("Invalid OTP");
        }
      } catch {
        setError("OTP verification failed");
      }
    }
    else {
      console.log("in registration");
      try {
        const res = await axios.post(
          getApiUrl(`/users/verify?otp=${finalOtp}`),
          {
            name: params.get("name"),
            username: params.get("username"),
            email: params.get("email"),
            dob: params.get("dob"),
            password: params.get("password"),
            address: params.get("address"),
            mobileNumber: params.get("mobileNumber"),
          },
          {
            // withCredentials: true,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (res.data === true) {
          setSuccess("OTP verified successfully");

          window.location.href = "/login";
        } else {
          setError("Invalid OTP");
        }
      } catch {
        setError("OTP verification failed");
      }finally{
        setVerifying(false);
      }
      
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

        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{
            cursor: verifying ? "not-allowed" : "pointer",
            opacity: verifying ? 0.6 : 1
          }}
        >
          {verifying ? "Verifying..." : "Verify OTP"}
        </button>


        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
}

export default Otp;
