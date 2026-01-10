import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./AboutUs.css";

function AboutUs() {
  return (
    <div className="aboutus-page">
      <Navbar />
      <div className="aboutus-container">
        <div className="aboutus-content">
          <h1>About Us</h1>
          
          <section className="about-section">
            <h2>Welcome to CardHub</h2>
            <p>
              CardHub is a comprehensive card management platform designed to simplify 
              how you manage your credit and debit cards. We provide a secure, user-friendly 
              interface for all your card-related needs.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              Our mission is to empower users with complete control over their card 
              management. We strive to provide a seamless experience that combines 
              security, convenience, and innovation in financial technology.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Offer</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3>Card Management</h3>
                <p>Easily view, manage, and track all your cards in one place.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure Transactions</h3>
                <p>Bank-level security to keep your financial information safe.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Transaction History</h3>
                <p>Track all your payments and transactions with detailed records.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Quick Actions</h3>
                <p>Pay bills, add money, and manage card settings with ease.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Values</h2>
            <ul className="values-list">
              <li>
                <strong>Security First:</strong> We prioritize the security of your 
                financial data with industry-leading encryption and security measures.
              </li>
              <li>
                <strong>User Experience:</strong> We believe in creating intuitive 
                and user-friendly interfaces that make financial management simple.
              </li>
              <li>
                <strong>Innovation:</strong> We continuously work on improving our 
                platform with new features and technologies.
              </li>
              <li>
                <strong>Transparency:</strong> We believe in clear communication and 
                transparent processes for all our services.
              </li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Our Team</h2>
            <p>
              CardHub is built by a dedicated team of developers, designers, and 
              financial experts who are passionate about creating the best card 
              management experience for our users.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AboutUs;
