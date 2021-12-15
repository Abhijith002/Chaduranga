import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ChessGame from "./components/ChessBoard";
import "./App.css";

const App = () => {
  return (
    <BrowserRouter basename={"/"}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Chess" element={<ChessGame />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
