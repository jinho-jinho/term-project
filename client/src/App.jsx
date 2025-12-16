import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Header from "./components/Header";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import MyOrders from "./pages/MyOrders";
import MyProfile from "./pages/MyProfile";
import MyOrderRegister from "./pages/MyOrderRegister";
import MyBenefits from "./pages/MyBenefits";
import MyLogout from "./pages/MyLogout";

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my/profile" element={<MyProfile />} />
          <Route path="/my/orders" element={<MyOrders />} />
          <Route path="/my/order-register" element={<MyOrderRegister />} />
          <Route path="/my/benefits" element={<MyBenefits />} />
          <Route path="/my/logout" element={<MyLogout />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
