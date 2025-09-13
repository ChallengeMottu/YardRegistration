import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ZonasEditor() {
  const location = useLocation();
  const { planta } = location.state || {};
  const [zonas, setZonas] = useState([]);
  const [capacidade, setCapacidade] = useState(0);

  useEffect(() => {
    const calcularZonas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/sugerir-zonas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(planta),
        });
        const data = await response.json();
        setCapacidade(data.capacidadeTotal);
        setZonas(data.zonasSugeridas);
      } catch (err) {
        console.error(err);
      }
    };
    calcularZonas();
  }, [planta]);

  return (
    <div>
      <h2>Editor de Zonas</h2>
      <p>Capacidade total de motos: {capacidade}</p>
      <svg width={800} height={600} style={{ background: "#f0f0f0", border: "1px solid #ccc" }}>
        {zonas.map(z => (
          <rect
            key={z.id}
            x={z.x} y={z.y} width={z.largura} height={z.altura}
            fill="rgba(0,128,0,0.3)"
            stroke="green"
          />
        ))}
        {planta.paredes.map(p => <line key={`p-${p.x1}`} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="black" strokeWidth={2} />)}
        {planta.paredes_internas.map(p => <line key={`pi-${p.x1}`} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="red" strokeWidth={2} strokeDasharray="4,2" />)}
        {planta.portas.map(p => <rect key={`port-${p.x}`} x={p.x} y={p.y} width={p.largura} height={p.altura} fill="brown" />)}
      </svg>
    </div>
  );
}
