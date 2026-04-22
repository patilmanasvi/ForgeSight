import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DetectionConsole from "./components/DetectionConsole";
import Architecture from "./components/Architecture";
import Footer from "./components/Footer";
import "./index.css";

function App() {
  return (
    <div className="bg-void text-foreground">
      <Navbar />
      <Hero />
      <Architecture />
      <DetectionConsole />
      <Footer />
    </div>
  );
}

export default App;
