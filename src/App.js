import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import CardForm from "./pages/cardform";
import Payment from "./pages/payment";
import MyCards from "./pages/mycards";
import OAuthCallback from "./pages/oauth-callback";
import AuthGuard from "./pages/AuthGuard";
import AdminHome from "./pages/AdminHome";
import Otp from "./pages/otp";

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
          <Route path="/cardform" element={<CardForm />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/cards/mycards" element={<MyCards />} />
          <Route path="/adminhome" element={<AdminHome />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
