import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";

function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuthAndRedirect = async () => {
      try {
        // Verify that user is authenticated after OAuth
        const response = await axios.get(
          getApiUrl("/users/getcurruser"),
          {
            withCredentials: true,
            validateStatus: function (status) {
              return status >= 200 && status < 600;
            }
          }
        );

        if (response.status === 200 && response.data) {
          // User is authenticated, redirect to home
          navigate("/home", { replace: true });
        } else {
          // Not authenticated, redirect to login
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        navigate("/login", { replace: true });
      }
    };

    verifyAuthAndRedirect();
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="spinner" style={{
        width: '50px',
        height: '50px',
        border: '4px solid #e1e8ed',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p>Completing authentication...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default OAuthCallback;
