import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet } from "react-router-dom";
import { getApiUrl } from "../config/api";

const AuthGuard = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

//   useEffect(() => {
//     axios.get("http://localhost:8088/users/api/auth/check", {
//       withCredentials: true,
//       validateStatus: function (status) {
//         return status >= 200 && status < 600;
//       }
//     })
//     .then((response) => {
//       console.log("AuthGuard response:", response);
//       console.log("AuthGuard response.data:", response.data);
//       console.log("AuthGuard response type:", typeof response.data);
      
//       // Check if response is HTML (login page) instead of JSON user data
//       const isHtml = typeof response.data === 'string' && 
//                      (response.data.includes('<form') || response.data.includes('<!DOCTYPE'));
      
//       // User is authenticated only if:
//       // 1. Status is 200
//       // 2. Response data exists
//       // 3. Response is NOT HTML (is JSON user object)
//       // 4. Response has user properties (id, email, name, etc.)
//       if (response.status === 200 && 
//           response.data && 
//           !isHtml && 
//           typeof response.data === 'object' &&
//           (response.data.id || response.data.email)) {
//         console.log("User authenticated:", response.data);
//         setAuthenticated(true);
//       } else {
//         console.log("User not authenticated - received HTML or invalid data");
//         setAuthenticated(false);
//       }
//       setLoading(false);
//     })
//     .catch((error) => {
//       console.error("AuthGuard error:", error);
//       setAuthenticated(false);
//       setLoading(false);
//     });
//   }, []);

useEffect(() => {
    axios.get(getApiUrl("/users/getcurruser"), {
      withCredentials: true
    })
    .then(() => {
      setAuthenticated(true);
      setLoading(false);
    })
    .catch(() => {
      setAuthenticated(false);
      setLoading(false);
    });
  }, []);
  

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e1e8ed',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthGuard;
