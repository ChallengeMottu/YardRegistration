import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TelaPlantaEditor from './Screens/TelaPlantaEditor';
import ZonasEditor from './Screens/TelaZonasEditor';
import TelaLogin from "./Screens/TelaLogin";
import TelaSuccess from "./Screens/TelaSuccess";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaLogin />} />
        <Route path="/tela-editor" element={<TelaPlantaEditor />} />
        <Route path="/tela-success" element={<TelaSuccess />} />
      </Routes>
    </Router>
  );
}
