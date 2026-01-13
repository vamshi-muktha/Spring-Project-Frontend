import { Link, useLocation } from "react-router-dom";
// import axios from "axios";
// import { getApiUrl } from "../config/api";
import "./Navbar.css";
import { useState } from "react";



function Navbar() {
  // const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // const handleLogout = async () => {
  //   try {
  //     await axios.post(getApiUrl("/logout"), {}, {
  //       withCredentials: true
  //     });
  //     navigate("/login");
  //   } catch (err) {
  //     console.error("Logout error:", err);
  //     // Navigate to login even if logout fails
  //     navigate("/login");
  //   }
  // };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    // <nav className="navbar">
    //   <div className="navbar-container">
    //     <Link to="/home" className="navbar-brand">
    //       💳 Secure Card
    //     </Link>
        
    //     <div className="navbar-menu">
    //       <Link to="/home" className={`navbar-link ${isActive("/home")}`}>
    //         Home
    //       </Link>
    //       <Link to="/myprofile" className={`navbar-link ${isActive("/myprofile")}`}>
    //         My Profile
    //       </Link>
    //       <Link to="/offers" className={`navbar-link ${isActive("/offers")}`}>
    //         Offers
    //       </Link>
    //       <Link to="/aboutus" className={`navbar-link ${isActive("/aboutus")}`}>
    //         About Us
    //       </Link>
    //       <Link to="/contactus" className={`navbar-link ${isActive("/contactus")}`}>
    //         Contact Us
    //       </Link>
          
    //     </div>
    // <div></div>
    //     {/* <button className="navbar-logout-btn" onClick={handleLogout}>
    //       Logout
    //     </button> */}
    //   </div>
    // </nav>


    <nav className="navbar">
  <div className="navbar-container">
    <Link to="/home" className="navbar-brand">
      💳 Secure Card
    </Link>

    {/* Mobile Menu Button */}
    <div className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
      ☰
    </div>

    <div className={`navbar-menu ${menuOpen ? "show" : ""}`}>
      <Link to="/home" className={`navbar-link ${isActive("/home")}`}>Home</Link>
      <Link to="/myprofile" className={`navbar-link ${isActive("/myprofile")}`}>My Profile</Link>
      <Link to="/offers" className={`navbar-link ${isActive("/offers")}`}>Offers</Link>
      <Link to="/aboutus" className={`navbar-link ${isActive("/aboutus")}`}>About Us</Link>
      <Link to="/contactus" className={`navbar-link ${isActive("/contactus")}`}>Contact Us</Link>
    </div>
    <div>
      <Link to="/login" className={`navbar-link ${isActive("/logout")}`}>Logout</Link>
    </div>
  </div>
</nav>





    
  );
}

export default Navbar;
