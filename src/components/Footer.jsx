import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>CardHub</h3>
          <p>Your trusted partner for all card management needs. Manage your cards with ease and security.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/myprofile">My Profile</Link></li>
            <li><Link to="/cards/mycards">My Cards</Link></li>
            <li><Link to="/cardform">Apply for Card</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Information</h4>
          <ul>
            <li><Link to="/aboutus">About Us</Link></li>
            <li><Link to="/contactus">Contact Us</Link></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>📧 support@cardhub.com</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>📍 123 Finance Street, Banking City</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} CardHub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
