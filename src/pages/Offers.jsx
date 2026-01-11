import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./Offers.css";

function Offers() {
  return (
    <div className="offers-container">

      <div class="offers-page">
        <Navbar />
        <div class="offers-header">
          <h1 class="offers-title">Exclusive Offers</h1>
          <p class="offers-subtitle">Save more when you pay using Secure Cards</p>
        </div>

        <div class="offers-container-inner">

          <div class="offer-card">
            <div class="offer-badge">10% OFF</div>
            <h2 class="offer-title">Secure Card Discount</h2>
            <p class="offer-description">
              Get an instant 10% discount when you pay using your Secure Card.
            </p>
            <p class="offer-code">
              Use Code: <span>SECURE10</span>
            </p>
            <button class="offer-button">Copy Code</button>
          </div>

          <div class="offer-card">
            <div class="offer-badge">20% OFF</div>
            <h2 class="offer-title">First Payment Bonus</h2>
            <p class="offer-description">
              Enjoy 20% off on your first transaction using our platform.
            </p>
            <p class="offer-code">
              Use Code: <span>FIRST20</span>
            </p>
            <button class="offer-button">Copy Code</button>
          </div>
          <div class="offer-card">
            <div class="offer-badge">₹500 OFF</div>
            <h2 class="offer-title">High Value Transaction</h2>
            <p class="offer-description">
              Get flat ₹500 off when you make a payment above ₹5000.
            </p>
            <p class="offer-code">
              Use Code: <span>FLAT500</span>
            </p>
            <button class="offer-button">Copy Code</button>
          </div>

        </div>
        <br></br>
        <div class="offers-footer">
          <p class="offers-note">
            * Offers are valid for a limited time and can be used once per user.
          </p>
        </div>
        <br></br>
        <Footer />
      </div>


    </div>
  )


}
export default Offers;