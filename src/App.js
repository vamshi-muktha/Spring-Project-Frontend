import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import CardForm from "./pages/cardform";
import Payment from "./pages/payment";
import MyCards from "./pages/mycards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default page */}
        <Route path="/" element={<Login />} />

        {/* Explicit login route */}
        <Route path="/login" element={<Login />} />

        {/* Register route */}
        <Route path="/register" element={<Register />} />

        {/* Home route */}
        <Route path="/home" element={<Home />} />

        {/* Card form route */}
        <Route path="/cardform" element={<CardForm />} />

        {/* Payment route */}
        <Route path="/payment" element={<Payment />} />

        {/* My Cards route */}
        <Route path="/cards/mycards" element={<MyCards />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
