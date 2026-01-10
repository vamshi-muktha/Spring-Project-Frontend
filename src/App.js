import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import CardForm from "./pages/cardform";
import Payment from "./pages/payment";
import MyCards from "./pages/mycards";
import AddMoney from "./pages/AddMoney";
import PayBill from "./pages/PayBill";
import CardDetail from "./pages/CardDetail";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import MyProfile from "./pages/MyProfile";
import OAuthCallback from "./pages/oauth-callback";
import AuthGuard from "./pages/AuthGuard";
import AdminHome from "./pages/AdminHome";
import Otp from "./pages/otp";
import Offers from "./pages/Offers";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/otp" element={<Otp />} />

        {/* Protected */}
        <Route element={<AuthGuard />}>
          <Route path="/home" element={<Home />} />
          <Route path="/myprofile" element={<MyProfile />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/cardform" element={<CardForm />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/cards/mycards" element={<MyCards />} />
          <Route path="/card-detail" element={<CardDetail />} />
          <Route path="/addMoney" element={<AddMoney />} />
          <Route path="/payBill" element={<PayBill />} />
          <Route path="/adminhome" element={<AdminHome />} />
          <Route path="/offers" element={<Offers />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
