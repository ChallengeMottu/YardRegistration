import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TelaPlantaEditor from './Screens/TelaPlantaEditor';
import ZonasEditor from './Screens/TelaZonasEditor';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaPlantaEditor />} />
        <Route path="/editar-zonas" element={<ZonasEditor />} />
      </Routes>
    </Router>
  );
}
