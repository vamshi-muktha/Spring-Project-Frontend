import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import "./login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [zipProgress, setZipProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [launch, setLaunch] = useState(false);


  const updateZipProgress = (e) => {
    const zipTrack = document.querySelector('.zip-track');
    if (zipTrack) {
      const rect = zipTrack.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
      setZipProgress(percentage);
    }
  };

  const handleZipMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    updateZipProgress(e);
  };

  const RocketOverlay = ({ show }) => {
    if (!show) return null;
  
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 9999,
        overflow: "hidden"
      }}>
        <img src="/rocket.png" className="rocket" alt="rocket" />
      </div>
    );
  };
  

  const handleZipTrackClick = (e) => {
    if (e.target.closest('.zip-slider')) return;
    updateZipProgress(e);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        updateZipProgress(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      // First, attempt login
      const response = await axios.post(
        getApiUrl("/login"),
        new URLSearchParams({
          username,
          password
        }),
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          validateStatus: function (status) {
            // Accept all status codes to handle redirects manually
            return status >= 200 && status < 600;
          }
        }
      );

      console.log("Login response status:", response.status);
      console.log("Login response URL:", response.request?.responseURL);
      console.log("Login response headers:", response.headers);
      console.log("Login response headers:", response);

      // Check the final URL after redirects
      const finalUrl = response.request?.responseURL || "";
      
      // If redirected to login page with error parameter, login failed
      if (finalUrl.includes("/login") && (finalUrl.includes("error") || finalUrl.includes("?error"))) {
        setError("Invalid username or password");
        setUsername(""); 
        setPassword("");
        setLoading(false);
        return;
      }

      // Check response status
      if (response.status === 401 || response.status === 403) {
        setError("Invalid username or password");
        setUsername(""); 
        setPassword("");
        setLoading(false);
        return;
      }

      // Verify login by checking if user is authenticated
      // Make a request to get current user to verify authentication
      try {
        const userCheck = await axios.get(
          getApiUrl("/users/getcurruser"),
          {
            withCredentials: true,
            validateStatus: function (status) {
              return status >= 200 && status < 600;
            }
          }
        );

        // If we can get user info, login was successful
        if (userCheck.status === 200 && userCheck.data) {
          console.log("Login successful, user:", userCheck.data);
          // window.location.href = "/home";
          setLaunch(true);

setTimeout(() => {
  window.location.href = "/home";
}, 1800);

          return; // Exit before finally block since we're redirecting
        } else {
          setError("Invalid username or password");
          setLoading(false);
        }
      } catch (verifyErr) {
        // If we can't get user info, login failed
        console.error("User verification failed:", verifyErr);
        setError("Invalid username or password");
        setLoading(false);
      }

    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      
      // Network error
      if (!err.response) {
        setError("Network error. Please check if the backend server is running.");
        setLoading(false);
        return;
      }

      // Check error response
      if (err.response.status === 401 || err.response.status === 403) {
        setError("Invalid username or password");
      } else {
        // For redirects, check the location header
        const location = err.response.headers?.location || "";
        if (location.includes("error") || location.includes("login?error")) {
          setError("Invalid username or password");
        } else {
          setError(err.response?.data?.message || "Login failed. Please try again.");
        }
      }
      setLoading(false);
    }
  };

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError("");
  
  //   try {
  //     const params = new URLSearchParams();
  //     params.append("username", username);
  //     params.append("password", password);
  
  //     const res = await axios.post(
  //       getApiUrl("/login"),
  //       params,
  //       {
  //         withCredentials: true,
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded"
  //         }
  //       }
  //     );
  
  //     // If we are here → login OK → session cookie created
  //     const user = await axios.get(getApiUrl("/users/getcurruser"), {
  //       withCredentials: true
  //     });
  
  //     console.log("Logged in user:", user.data);
  //     window.location.href = "/home";
  
  //   } catch (err) {
  //     if (err.response?.status === 401) {
  //       setError("Invalid username or password");
  //     } else {
  //       setError("Login failed");
  //     }
  //   }
  // };
  
  return (
    <div className="login-container">
      <div className="login-form-container">
        <div 
          className="login-form-wrapper"
          style={{ 
            transform: `scale(${0.3 + (zipProgress / 100) * 0.7})`,
            opacity: zipProgress > 10 ? Math.min(1, (zipProgress - 10) / 30) : 0,
            filter: `blur(${Math.max(0, 10 - (zipProgress / 10))}px)`
          }}
        >
          <form className="login-form" onSubmit={handleLogin}>
        {/* <h3>Login</h3>  */}
        {/* <button onclick="register()">Register</button> */}
     

        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="divider">or</div>

        <Link to="/register">
          <button type="button" className="register-button">Register</button>
        </Link>

        <a href={getApiUrl("/oauth2/authorization/google")} className="google-button">
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Login with Google
        </a>
      </form>
        </div>

        <div className="zip-container">
          <div className="zip-track" onClick={handleZipTrackClick}>
            
            <div className="zip-slider-wrapper">
              <div 
                className="zip-slider"
                style={{ top: `${zipProgress}%` }}
                onMouseDown={handleZipMouseDown}
              >
                <div className="zip-pull-tab">⛓</div>
              </div>
            </div>
            <div className="zip-teeth">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="zip-tooth" style={{ top: `${i * 3.33}%` }} />
              ))}
            </div>
            <div 
              className="zip-split-left"
              style={{ 
                transform: `translateX(${-zipProgress * 0.5}px)`,
                opacity: Math.max(0, 1 - (zipProgress / 50))
              }}
            />
            <div 
              className="zip-split-right"
              style={{ 
                transform: `translateX(${zipProgress * 0.5}px)`,
                opacity: Math.max(0, 1 - (zipProgress / 50))
              }}
            />
          </div>
        </div>
      </div>
      <RocketOverlay show={launch} />

    </div>
  );
}

export default Login;
