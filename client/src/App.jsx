import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Header from "./components/Header";

function HomeSection() {
  return (
    <section className="home-hero">
      <h1>홈 화면</h1>
    </section>
  );
}

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<HomeSection />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
