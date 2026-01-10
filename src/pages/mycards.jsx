import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import ben10Image from "../assets/ben10.png";
import "./mycards.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function MyCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
    // Set CSS variable for Ben 10 background image
    document.documentElement.style.setProperty('--ben10-image', `url(${ben10Image})`);
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        getApiUrl("/cards/mycards"),
        {
          withCredentials: true
        }
      );

      // Handle the response - filter out strings and keep only card objects
      const cardData = Array.isArray(response.data) 
        ? response.data.filter(item => typeof item === 'object' && item !== null)
        : [];
      
      setCards(cardData);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return "";
    // Format as XXXX XXXX XXXX XXXX
    const cleaned = cardNumber.replace(/\s/g, "");
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(" ") : cardNumber;
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return "";
    const formatted = formatCardNumber(cardNumber);
    // Show only last 4 digits, mask the rest
    const parts = formatted.split(" ");
    if (parts.length >= 4) {
      return `**** **** **** ${parts[parts.length - 1]}`;
    }
    return formatted;
  };

  const getCardTypeColor = (cardType) => {
    switch (cardType?.toLowerCase()) {
      case "platinum":
        return "#e8e8e8";
      case "gold":
        return "#ffd700";
      case "silver":
        return "#c0c0c0";
      default:
        return "#667eea";
    }
  };

  const getCardTypeGradient = (cardType, type) => {
    const isCredit = type?.toLowerCase() === "credit";
    // eslint-disable-next-line no-unused-vars
    const baseColor = getCardTypeColor(cardType);
    
    if (cardType?.toLowerCase() === "platinum") {
      return isCredit 
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    } else if (cardType?.toLowerCase() === "gold") {
      return isCredit
        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        : "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)";
    } else if (cardType?.toLowerCase() === "silver") {
      return isCredit
        ? "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
        : "linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)";
    }
    return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  };

  if (loading) {
    return (
      <div className="mycards-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your cards...</p>
        </div>
      </div>
    );
  }
  const handleCardClick = (cid) => {
    navigate(`/card-detail?cid=${cid}`);
  };

  return (
    <div className="mycards-container">
      <Navbar/>
      <br></br>
      <div className="mycards-content">
        <header className="mycards-header">
          <h1>My Cards</h1>
          <Link to="/home" className="back-button">← Back to Home</Link>
        </header>

        {error && <div className="error-message">{error}</div>}

        {cards.length === 0 ? (
          <div className="no-cards">
            <div className="no-cards-icon">💳</div>
            <h2>No Cards Found</h2>
            <p>You don't have any cards yet. Apply for a new card to get started.</p>
            <Link to="/cardform" className="apply-card-button">
              Apply New Card
            </Link>
          </div>
        ) : (
          <div className="cards-grid">
            {cards.map((card, index) => (
              <div 
                key={card.cid || index} 
                className="card-item clickable-card"
                style={{
                  background: getCardTypeGradient(card.cardType, card.type)
                }}
                onClick={() => handleCardClick(card.cid)}
              >
                <div className="card-header">
                  <div className="card-type-badge">
                    {card.cardType || "Card"}
                  </div>
                  <div className={`card-status ${card.active ? "active" : "inactive"}`}>
                    {card.active ? "✓ Active" : "○ Inactive"}
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-chip">💳</div>
                  <div className="card-number">
                    {maskCardNumber(card.cardNumber)}
                  </div>
                  <div className="card-details">
                    <div className="card-name">
                      {card.cardName || "Card Holder"}
                    </div>
                    <div className="card-expiry">
                      {card.cardExpiry || "MM/YY"}
                    </div>
                  </div>
                </div>

                <div className="card-footer-simple">
                  <div className="card-type-info">
                    <span className="info-label">Type:</span>
                    <span className="info-value">{card.type || "N/A"}</span>
                  </div>
                  <div className="click-hint">Click to view details →</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="actions-section">
          <Link to="/cardform" className="action-button">
            + Apply New Card
          </Link>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default MyCards;
