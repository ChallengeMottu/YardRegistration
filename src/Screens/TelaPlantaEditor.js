import React, { useState } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";

const modelos = ["Mottu_e", "Sport_110_i", "Mottu_sport"];
const coresZona = ["rgba(0,0,255,0.2)", "rgba(0,128,255,0.2)", "rgba(0,255,255,0.2)"];
const condicoes = ["Bom estado", "Para manutenção", "Aguardando revisão"];
const coresSubzona = ["rgba(0,255,0,0.3)", "rgba(255,255,0,0.3)", "rgba(255,0,0,0.3)"];

const PatioCanvas = () => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const [lines, setLines] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [subzonaIndex, setSubzonaIndex] = useState(0); 
  const [collapsed, setCollapsed] = useState({}); // controle expand/collapse subzonas

  const toggleDrawing = () => setDrawingMode(!drawingMode);

  const handleMouseDown = (e) => {
    if (!drawingMode) return;
    const pos = e.target.getStage().getPointerPosition();
    if (pos) setCurrentLine([pos.x, pos.y]);
  };

  const handleMouseMove = (e) => {
    if (!drawingMode || currentLine.length === 0) return;
    const pos = e.target.getStage().getPointerPosition();
    if (pos) setCurrentLine([...currentLine, pos.x, pos.y]);
  };

  const handleMouseUp = () => {
    if (!drawingMode || currentLine.length === 0) return;
    setLines([...lines, { id: lines.length + 1, points: currentLine }]);
    setCurrentLine([]);
  };

  const straightenLine = (lineId) => {
    setLines(
      lines.map((line) => {
        if (line.id === lineId && line.points.length >= 4) {
          const x1 = line.points[0];
          const y1 = line.points[1];
          const x2 = line.points[line.points.length - 2];
          const y2 = line.points[line.points.length - 1];
          return { ...line, points: [x1, y1, x2, y2] };
        }
        return line;
      })
    );
  };

  const deleteLine = (lineId) => setLines(lines.filter((line) => line.id !== lineId));

  const addZona = () => {
    if (zonas.length >= 3) return;
    const zonaId = zonas.length;
    const novaZona = {
      id: `zona-${zonaId + 1}`,
      x: 50 + zonaId * 250,
      y: 50,
      width: 200,
      height: 300,
      rotation: 0,
      color: coresZona[zonaId],
      nome: modelos[zonaId],
      subzonas: []
    };
    setZonas([...zonas, novaZona]);
    setCollapsed({ ...collapsed, [`zona-${zonaId + 1}`]: false });
  };

  const addSubzona = () => {
    if (zonas.length < 3) return; 
    const novaZonas = zonas.map((z) => {
      if (subzonaIndex < condicoes.length) {
        const novaSub = {
          id: `${z.id}-sub-${subzonaIndex + 1}`,
          nome: condicoes[subzonaIndex],
          x: z.x + 10,
          y: z.y + 10 + subzonaIndex * 90,
          width: z.width - 20,
          height: 80,
          rotation: 0,
          color: coresSubzona[subzonaIndex]
        };
        return { ...z, subzonas: [...z.subzonas, novaSub] };
      }
      return z;
    });
    setZonas(novaZonas);
    setSubzonaIndex(subzonaIndex + 1);
  };

  const updateZonaSize = (id, width, height) => {
    setZonas(
      zonas.map((z) => {
        if (z.id === id) {
          const novaSubzonas = z.subzonas.map((sub) => ({
            ...sub,
            width: width - 20
          }));
          return { ...z, width, height, subzonas: novaSubzonas };
        }
        return z;
      })
    );
  };

  const updateSubzonaSize = (zonaId, subId, width, height) => {
    setZonas(
      zonas.map((z) => {
        if (z.id === zonaId) {
          const novaSubzonas = z.subzonas.map((sub) => {
            if (sub.id === subId) return { ...sub, width, height };
            return sub;
          });
          return { ...z, subzonas: novaSubzonas };
        }
        return z;
      })
    );
  };

  const updateZonaRotation = (id, rotation) => {
    setZonas(zonas.map(z => z.id === id ? { ...z, rotation } : z));
  };

  const updateSubzonaRotation = (zonaId, subId, rotation) => {
    setZonas(
      zonas.map(z => {
        if (z.id === zonaId) {
          const novaSubzonas = z.subzonas.map(sub => sub.id === subId ? { ...sub, rotation } : sub);
          return { ...z, subzonas: novaSubzonas };
        }
        return z;
      })
    );
  };

  const toggleCollapse = (zonaId) => {
    setCollapsed({ ...collapsed, [zonaId]: !collapsed[zonaId] });
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "320px", marginRight: "20px" }}>
        <button onClick={toggleDrawing}>
          {drawingMode ? "Desativar Desenho" : "Ativar Desenho"}
        </button>
        <button onClick={addZona} disabled={zonas.length >= 3}>Adicionar Zona</button>
        <button onClick={addSubzona} disabled={zonas.length < 3 || subzonaIndex >= condicoes.length}>
          Adicionar Subzona
        </button>

        <h3>Linhas Desenhadas</h3>
        <ul>
          {lines.map(line => (
            <li key={line.id}>
              Linha {line.id} 
              <button onClick={() => straightenLine(line.id)}>Endireitar</button>
              <button onClick={() => deleteLine(line.id)}>Apagar</button>
            </li>
          ))}
        </ul>

        <h3>Zonas</h3>
        {zonas.map(z => (
          <div key={z.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong>{z.id} - {z.nome}</strong>
              <button onClick={() => toggleCollapse(z.id)}>{collapsed[z.id] ? "▶" : "▼"}</button>
            </div>
            <div>
              Largura: <input type="number" value={z.width} onChange={e => updateZonaSize(z.id, parseInt(e.target.value), z.height)} />
              Altura: <input type="number" value={z.height} onChange={e => updateZonaSize(z.id, z.width, parseInt(e.target.value))} />
              Rotação: <input type="number" value={z.rotation} onChange={e => updateZonaRotation(z.id, parseInt(e.target.value))} />
            </div>

            {!collapsed[z.id] && z.subzonas.map(sub => (
              <div key={sub.id} style={{ marginLeft: "15px", marginTop: "5px" }}>
                <strong>{sub.nome}</strong>
                <div>
                  Largura: <input type="number" value={sub.width} onChange={e => updateSubzonaSize(z.id, sub.id, parseInt(e.target.value), sub.height)} />
                  Altura: <input type="number" value={sub.height} onChange={e => updateSubzonaSize(z.id, sub.id, sub.width, parseInt(e.target.value))} />
                  Rotação: <input type="number" value={sub.rotation} onChange={e => updateSubzonaRotation(z.id, sub.id, parseInt(e.target.value))} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Stage
        width={1000}
        height={600}
        style={{ border: "1px solid black" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {lines.map(line => (
            <Line key={line.id} points={line.points} stroke="black" tension={0.5} closed />
          ))}
          {currentLine.length > 0 && <Line points={currentLine} stroke="gray" tension={0.5} />}

          {zonas.map(z => (
            <React.Fragment key={z.id}>
              <Rect x={z.x} y={z.y} width={z.width} height={z.height} fill={z.color} rotation={z.rotation} draggable />
              {z.subzonas.map(sub => (
                <Rect key={sub.id} x={sub.x} y={sub.y} width={sub.width} height={sub.height} fill={sub.color} stroke="black" rotation={sub.rotation} draggable />
              ))}
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default PatioCanvas;
