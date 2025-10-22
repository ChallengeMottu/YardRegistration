import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Rect, Text, Circle } from 'react-konva';

const modelos = [
  { id: 'mottu_e', nome: 'MOTTU_E', cor: 'rgba(1,116,58,0.4)'},
  { id: 'sport_110_i', nome: 'SPORT_110_I', cor: 'rgba(1,116,58,0.5)'},
  { id: 'mottu_sport', nome: 'MOTTU_SPORT', cor: 'rgba(1,116,58,0.6)'},
  { id: 'mottu_esd', nome: 'MOTTU_ESD', cor: 'rgba(1,116,58,0.6)'}
];



export default function TelaPlantaEditor() {

  const [etapa, setEtapa] = useState('configuracao'); 


  const [nomePatio, setNomePatio] = useState('');
  const [endereco, setEndereco] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [capacidadeTotal, setCapacidadeTotal] = useState('');


  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingZoneMode, setDrawingZoneMode] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const [currentZonePoints, setCurrentZonePoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [subzonaIndex, setSubzonaIndex] = useState(0);
  const [expandedZonas, setExpandedZonas] = useState({});


  const stageRef = useRef(null);
  const isDrawing = useRef(false);

  const avancarParaEditor = () => {
    if (!nomePatio.trim() || !endereco.trim() || !responsavel.trim()) {
      alert('DADOS INCOMPLETOS: Preencha todos os campos obrigatórios.');
      return;
    }
    setEtapa('editor');
  };


  const voltarParaConfiguracao = () => {
    setEtapa('configuracao');
  };


  const toggleDrawing = () => {
    setDrawingMode(!drawingMode);
    if (drawingZoneMode) setDrawingZoneMode(false);
  };

  const toggleDrawingZone = () => {
    setDrawingZoneMode(!drawingZoneMode);
    if (drawingMode) setDrawingMode(false);
    if (!drawingZoneMode) {
      setCurrentZonePoints([]);
    }
  };

  const handleMouseDown = (e) => {
    if (!drawingMode && !drawingZoneMode) return;
    

    if (drawingMode) {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      if (pos) setCurrentLine([pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e) => {
    if (!drawingMode || !isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (point) {
      let newLine = currentLine.concat([point.x, point.y]);
      setCurrentLine(newLine);
    }
  };

  const handleMouseUp = () => {
    if (!drawingMode) return;
    isDrawing.current = false;
    if (currentLine.length > 0) {
      setLines([...lines, { id: lines.length + 1, points: currentLine }]);
      setCurrentLine([]);
    }
  };

  const handleCanvasClick = (e) => {
    if (!drawingZoneMode) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    if (pos) {
      setCurrentZonePoints([...currentZonePoints, pos.x, pos.y]);
    }
  };

  const finalizarZonaDesenhada = () => {
    if (currentZonePoints.length < 6) {
      alert('DADOS INSUFICIENTES: Desenhe pelo menos 3 pontos para criar uma zona.');
      return;
    }

    if (zonas.length >= 4) {
      alert('LIMITE EXCEDIDO: Máximo de 4 zonas por pátio.');
      return;
    }

    const zonaId = zonas.length;
    const novaZona = {
      id: `zona-${zonaId + 1}`,
      points: currentZonePoints,
      tipo: 'poligono',
      rotation: 0,
      color: modelos[zonaId].cor,
      nome: modelos[zonaId].nome,
      capacidade: modelos[zonaId].capacidade,
      subzonas: []
    };

    setZonas([...zonas, novaZona]);
    setExpandedZonas({ ...expandedZonas, [`zona-${zonaId + 1}`]: false });
    setCurrentZonePoints([]);
    setDrawingZoneMode(false);
  };

  const cancelarZonaDesenhada = () => {
    setCurrentZonePoints([]);
    setDrawingZoneMode(false);
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

  const deleteLine = (lineId) => {
    setLines(lines.filter((line) => line.id !== lineId));
  };



  const salvarPatio = () => {
    if (zonas.length === 0) {
      alert('CONFIGURAÇÃO INVÁLIDA: Adicione pelo menos uma zona ao pátio.');
      return;
    }

    const patio = {
      id: `patio_${Date.now()}`,
      nome: nomePatio,
      endereco,
      responsavel,
      capacidadeTotal: parseInt(capacidadeTotal) || 0,
      zonas,
      linhas: lines,
      dataCriacao: new Date().toISOString(),
      status: 'ATIVO'
    };

    console.log('Pátio salvo:', patio);
    alert('OPERAÇÃO CONCLUÍDA: Pátio cadastrado no sistema.');
  };

  function normalizarCoordenadas(pontos) {
  return pontos.map(p => ({
    x: Math.round(p.x / 10) * 10,
    y: Math.round(p.y / 10) * 10,
  }));
}

function fecharForma(pontos) {
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  const distancia = Math.hypot(ultimo.x - primeiro.x, ultimo.y - primeiro.y);
  if (distancia > 5) pontos.push({ ...primeiro });
  return pontos;
}

function gerarSvgDoLayout(zonas = [], linhas = []) {
  const zonasSvg = zonas.map(z => {
    const pontosObj = converterPontos(z.pontos || []);
    const pontosNormalizados = fecharForma(normalizarCoordenadas(pontosObj));
    const path = pontosNormalizados.map(p => `${p.x},${p.y}`).join(' ');
    return `
      <polygon
        points="${path}"
        fill="${z.cor || '#6aa84f'}"
        stroke="#333"
        stroke-width="1"
      />
    `;
  }).join('');

  const linhasSvg = linhas.map(l => {
    const pontosObj = converterPontos(l.pontos || []);
    const pontosNormalizados = normalizarCoordenadas(pontosObj);
    const path = pontosNormalizados.map(p => `${p.x},${p.y}`).join(' ');
    return `
      <polyline
        points="${path}"
        stroke="black"
        stroke-width="1"
        fill="none"
      />
    `;
  }).join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      ${linhasSvg}
      ${zonasSvg}
    </svg>
  `;
  return svg.trim();
}


function converterPontos(planos) {
  const pontos = [];
  for (let i = 0; i < planos.length; i += 2) {
    pontos.push({ x: planos[i], y: planos[i + 1] });
  }
  return pontos;
}


const exportarLayout = () => {
  const data = {
    nomePatio,
    endereco,
    responsavel,
    capacidadeTotal,
    linhas: lines.map(l => ({
      id: l.id,
      pontos: l.points,
    })),
    zonas: zonas.map(z => ({
      id: z.id,
      nome: z.nome,
      tipo: z.tipo,
      cor: z.color,
      largura: z.width,
      altura: z.height,
      rotacao: z.rotation,
      capacidade: z.capacidade,
      pontos: z.points || [],
      subzonas: z.subzonas.map(s => ({
        id: s.id,
        nome: s.nome,
        largura: s.width,
        altura: s.height,
        rotacao: s.rotation,
        cor: s.color,
      })),
    })),
  };


  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${nomePatio || "patio"}_layout.json`;
  link.click();
  URL.revokeObjectURL(url);

  // Gera o SVG a partir do layout
  const svg = gerarSvgDoLayout(data.zonas, data.linhas);

  // Cria e abre o SVG no navegador
  const svgBlob = new Blob([svg], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);
  window.open(svgUrl);
};



  if (etapa === 'configuracao') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #002714ff 100%)',
        color: '#ffffff',
        fontFamily: '"Courier New", monospace',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Header do Sistema */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
          borderBottom: '2px solid #01743A',
          paddingBottom: '20px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            color: '#01743A',
            textShadow: '0 0 20px rgba(1,116,58,0.5)',
            margin: '0'
          }}>
            CONFIGURADOR DE PÁTIO
          </h1>
          <p style={{
            color: '#888',
            fontSize: '0.9rem',
            marginTop: '10px'
          }}>
            SISTEMA DE GERENCIAMENTO ESPACIAL
          </p>
        </div>

        <div style={{
          width: '500px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(1,116,58,0.3)',
          borderRadius: '8px',
          padding: '40px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '30px',
            borderBottom: '1px solid rgba(1,116,58,0.2)',
            paddingBottom: '15px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚙️</span>
            <h2 style={{ margin: '0', fontSize: '1.3rem' }}>INFORMAÇÕES DO PÁTIO</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#01743A', marginBottom: '8px' }}>
                NOME PÁTIO
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(1,116,58,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: '"Courier New", monospace'
                }}
                placeholder="DIGITE O NOME DO PÁTIO"
                value={nomePatio}
                onChange={(e) => setNomePatio(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#01743A', marginBottom: '8px' }}>
                ENDEREÇO
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(1,116,58,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: '"Courier New", monospace'
                }}
                placeholder="LOCALIZAÇÃO DO PÁTIO"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#01743A', marginBottom: '8px' }}>
                RESPONSÁVEL TÊCNICO
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(1,116,58,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: '"Courier New", monospace'
                }}
                placeholder="NOME DO RESPONSÁVEL"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#01743A', marginBottom: '8px' }}>
                CAPACIDADE MÁXIMA
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(1,116,58,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: '"Courier New", monospace'
                }}
                type="number"
                placeholder="NÚMERO MÁXIMO DE VEÍCULOS"
                value={capacidadeTotal}
                onChange={(e) => setCapacidadeTotal(e.target.value)}
              />
            </div>
          </div>

          <button 
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, rgba(1,116,58,0.3), rgba(1,116,58,0.5))',
              border: '2px solid #01743A',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              boxShadow: '0 0 20px rgba(1,116,58,0.3)',
              transition: 'all 0.3s',
              marginTop: '30px'
            }}
            onClick={avancarParaEditor}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 0 30px rgba(1,116,58,0.6)';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 0 20px rgba(1,116,58,0.3)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <span>🚀</span>
            <span>INICIAR CONFIGURAÇÃO DO PÁTIO</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000 0%, #002714ff 100%)',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #01743A',
        paddingBottom: '20px',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color: '#01743A',
          textShadow: '0 0 20px rgba(1,116,58,0.5)',
          margin: '0'
        }}>
          CONFIGURADOR DE PÁTIO
        </h1>
        <p style={{
          color: '#888',
          fontSize: '0.9rem',
          marginTop: '10px'
        }}>
          EDITOR DE LAYOUT - {nomePatio.toUpperCase()}
        </p>

        <button 
          style={{
            position: 'absolute',
            top: '30px',
            left: '30px',
            padding: '10px 15px',
            background: 'rgba(255,170,0,0.2)',
            border: '1px solid rgba(255,170,0,0.5)',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onClick={voltarParaConfiguracao}
        >
          <span>↩️</span>
          <span>ALTERAR DADOS</span>
        </button>
      </div>


      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(1,116,58,0.3)',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
              borderBottom: '1px solid rgba(1,116,58,0.2)',
              paddingBottom: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✏️</span>
              <h2 style={{ margin: '0', fontSize: '1.1rem' }}>CONTROLES DE DESENHO</h2>
            </div>

            <button 
              style={{
                width: '100%',
                padding: '12px',
                background: drawingMode ? 'rgba(255,0,0,0.3)' : 'rgba(1,116,58,0.2)',
                border: drawingMode ? '2px solid #ff0000' : '1px solid rgba(1,116,58,0.5)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '10px',
                transition: 'all 0.3s'
              }}
              onClick={toggleDrawing}
            >
              <span>{drawingMode ? '🔴' : '⚫'}</span>
              <span>{drawingMode ? 'DESATIVAR DESENHO' : 'ATIVAR DESENHO'}</span>
            </button>

            <button 
              style={{
                width: '100%',
                padding: '12px',
                background: drawingZoneMode ? 'rgba(0,255,0,0.3)' : 'rgba(1,116,58,0.2)',
                border: drawingZoneMode ? '2px solid #00ff00' : '1px solid rgba(1,116,58,0.5)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s'
              }}
              onClick={toggleDrawingZone}
            >
              <span>{drawingZoneMode ? '🟢' : '⚫'}</span>
              <span>{drawingZoneMode ? 'DESATIVAR DESENHO ZONA' : 'DESENHAR ZONA'}</span>
            </button>

            {drawingZoneMode && (
              <div style={{
                marginTop: '15px',
                padding: '15px',
                background: 'rgba(0,255,0,0.1)',
                border: '1px solid rgba(0,255,0,0.3)',
                borderRadius: '4px'
              }}>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#0f0',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  Clique no canvas para adicionar pontos. Mínimo 3 pontos.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: currentZonePoints.length < 6 ? 'rgba(100,100,100,0.3)' : 'rgba(0,255,0,0.3)',
                      border: '1px solid rgba(0,255,0,0.5)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      cursor: currentZonePoints.length < 6 ? 'not-allowed' : 'pointer'
                    }}
                    onClick={finalizarZonaDesenhada}
                    disabled={currentZonePoints.length < 6}
                  >
                    ✓ FINALIZAR
                  </button>
                  <button 
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'rgba(255,0,0,0.3)',
                      border: '1px solid rgba(255,0,0,0.5)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                    onClick={cancelarZonaDesenhada}
                  >
                    ✕ CANCELAR
                  </button>
                </div>
                <div style={{
                  marginTop: '10px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: '#0f0'
                }}>
                  PONTOS: {currentZonePoints.length / 2}
                </div>
              </div>
            )}

            <div style={{
              marginTop: '15px',
              padding: '10px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.9rem', color: '#01743A' }}>LINHAS: {lines.length}</span>
            </div>

            {lines.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>LINHAS DESENHADAS</h3>
                {lines.map(line => (
                  <div key={line.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }}>
                    <span style={{ fontSize: '0.85rem' }}>LINHA_{String(line.id).padStart(2, '0')}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        style={{
                          padding: '5px 10px',
                          background: 'rgba(1,116,58,0.3)',
                          border: '1px solid rgba(1,116,58,0.5)',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        onClick={() => straightenLine(line.id)}
                      >
                        📏
                      </button>
                      <button 
                        style={{
                          padding: '5px 10px',
                          background: 'rgba(255,0,0,0.3)',
                          border: '1px solid rgba(255,0,0,0.5)',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        onClick={() => deleteLine(line.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, rgba(1,116,58,0.3), rgba(1,116,58,0.5))',
              border: '2px solid #01743A',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              boxShadow: '0 0 20px rgba(1,116,58,0.3)',
              transition: 'all 0.3s'
            }}
            onClick={salvarPatio}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 0 30px rgba(1,116,58,0.6)';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 0 20px rgba(1,116,58,0.3)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <span>💾</span>
            <span>REGISTRAR PÁTIO</span>
          </button>

          <button 
  style={{
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, rgba(255,170,0,0.3), rgba(255,170,0,0.5))',
    border: '2px solid #ffaa00',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    boxShadow: '0 0 20px rgba(255,170,0,0.3)',
    transition: 'all 0.3s'
  }}
  onClick={exportarLayout}
>
  <span>📦</span>
  <span>EXPORTAR LAYOUT</span>
</button>


          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(1,116,58,0.3)',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
              borderBottom: '1px solid rgba(1,116,58,0.2)',
              paddingBottom: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>📋</span>
              <h2 style={{ margin: '0', fontSize: '1.1rem' }}>DADOS DO PÁTIO</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#01743A', marginBottom: '3px' }}>
                  NOME PÁTIO
                </label>
                <div style={{
                  padding: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(1,116,58,0.2)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#fff'
                }}>
                  {nomePatio || 'NÃO INFORMADO'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#01743A', marginBottom: '3px' }}>
                  ENDEREÇO
                </label>
                <div style={{
                  padding: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(1,116,58,0.2)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#fff'
                }}>
                  {endereco || 'NÃO INFORMADO'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#01743A', marginBottom: '3px' }}>
                  RESPONSÁVEL
                </label>
                <div style={{
                  padding: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(1,116,58,0.2)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#fff'
                }}>
                  {responsavel || 'NÃO INFORMADO'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#01743A', marginBottom: '3px' }}>
                  CAPACIDADE MÁXIMA
                </label>
                <div style={{
                  padding: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(1,116,58,0.2)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#fff'
                }}>
                  {capacidadeTotal || '0'} VEÍCULOS
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(1,116,58,0.3)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px 20px',
              background: 'rgba(0,0,0,0.3)',
              borderBottom: '1px solid rgba(1,116,58,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎨</span>
                <h2 style={{ margin: '0', fontSize: '1.1rem' }}>ÁREA DE DESENHO</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: drawingMode || drawingZoneMode ? '#00ff00' : '#888',
                    boxShadow: drawingMode || drawingZoneMode ? '0 0 10px #00ff00' : 'none'
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: drawingMode || drawingZoneMode ? '#0f0' : '#888' }}>
                  {drawingMode ? 'MODO DESENHO ATIVO' : drawingZoneMode ? 'MODO DESENHO ZONA' : 'MODO VISUALIZAÇÃO'}
                </span>
              </div>
            </div>

            <div style={{
              background: '#000',
              padding: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Stage
                width={1400}
                height={1050}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleCanvasClick}
                ref={stageRef}
                style={{
                  border: '2px solid rgba(1,116,58,0.3)',
                  borderRadius: '4px'
                }}
              >
                <Layer>

                  {lines.map(line => (
                    <Line 
                      key={line.id} 
                      points={line.points} 
                      stroke="#11881D" 
                      strokeWidth={2}
                      tension={0.5} 
                      lineCap="round"
                      globalCompositeOperation="source-over"
                    />
                  ))}
                  

                  {currentLine.length > 0 && (
                    <Line 
                      points={currentLine} 
                      stroke="#66bb6a" 
                      strokeWidth={2}
                      tension={0.5} 
                      lineCap="round"
                      globalCompositeOperation="source-over"
                    />
                  )}


                  {currentZonePoints.length > 0 && (
                    <>
                      <Line 
                        points={currentZonePoints} 
                        stroke="#ffffff" 
                        strokeWidth={2}
                        lineCap="round"
                        lineJoin="round"
                        dash={[10, 5]}
                      />

                      {currentZonePoints.map((_, index) => {
                        if (index % 2 === 0) {
                          return (
                            <Circle
                              key={`point-${index}`}
                              x={currentZonePoints[index]}
                              y={currentZonePoints[index + 1]}
                              radius={5}
                              fill="#ffffff"
                              stroke="#000000"
                              strokeWidth={1}
                            />
                          );
                        }
                        return null;
                      })}
                    </>
                  )}


                  {zonas.map(z => (
                    <React.Fragment key={z.id}>
                      {z.tipo === 'retangulo' ? (
                        <>
                          <Rect 
                            x={z.x} 
                            y={z.y} 
                            width={z.width} 
                            height={z.height} 
                            fill={z.color} 
                            stroke="#ffffff"
                            strokeWidth={1}
                            rotation={z.rotation} 
                            draggable 
                            onDragEnd={(e) => {
                              const newZonas = zonas.map(zona => {
                                if (zona.id === z.id) {
                                  return {
                                    ...zona,
                                    x: e.target.x(),
                                    y: e.target.y()
                                  };
                                }
                                return zona;
                              });
                              setZonas(newZonas);
                            }}
                          />
                          <Text
                            x={z.x + 10}
                            y={z.y + 10}
                            text={z.nome}
                            fontSize={12}
                            fontFamily="Courier New"
                            fill="#ffffff"
                            rotation={z.rotation}
                          />
                        </>
                      ) : (
                        <>
                          <Line 
                            points={z.points}
                            fill={z.color}
                            stroke="#ffffff"
                            strokeWidth={2}
                            closed
                            draggable
                            onDragEnd={(e) => {
                              const newZonas = zonas.map(zona => {
                                if (zona.id === z.id) {
                                  const dx = e.target.x();
                                  const dy = e.target.y();
                                  const newPoints = zona.points.map((p, i) => 
                                    i % 2 === 0 ? p + dx : p + dy
                                  );
                                  e.target.x(0);
                                  e.target.y(0);
                                  return { ...zona, points: newPoints };
                                }
                                return zona;
                              });
                              setZonas(newZonas);
                            }}
                          />
                          <Text
                            x={z.points[0] + 10}
                            y={z.points[1] + 10}
                            text={z.nome}
                            fontSize={12}
                            fontFamily="Courier New"
                            fill="#ffffff"
                          />
                        </>
                      )}
                      

                      {z.subzonas.map(sub => (
                        <React.Fragment key={sub.id}>
                          <Rect 
                            x={sub.x} 
                            y={sub.y} 
                            width={sub.width} 
                            height={sub.height} 
                            fill={sub.color} 
                            stroke="#ffffff"
                            strokeWidth={1}
                            rotation={sub.rotation} 
                            draggable
                            onDragEnd={(e) => {
                              const newZonas = zonas.map(zona => {
                                if (zona.id === z.id) {
                                  const newSubzonas = zona.subzonas.map(subzona => {
                                    if (subzona.id === sub.id) {
                                      return {
                                        ...subzona,
                                        x: e.target.x(),
                                        y: e.target.y()
                                      };
                                    }
                                    return subzona;
                                  });
                                  return { ...zona, subzonas: newSubzonas };
                                }
                                return zona;
                              });
                              setZonas(newZonas);
                            }}
                          />
                          <Text
                            x={sub.x + 5}
                            y={sub.y + 5}
                            text={sub.nome.substring(0, 10)}
                            fontSize={10}
                            fontFamily="Courier New"
                            fill="#ffffff"
                            rotation={sub.rotation}
                          />
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}