import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Rect, Text, Circle } from 'react-konva';

const modelos = [
  { id: 'mottu_e', nome: 'MOTTU_E', cor: 'rgba(1,116,58,0.4)', capacidade: 50 },
  { id: 'sport_110_i', nome: 'SPORT_110_I', cor: 'rgba(1,116,58,0.5)', capacidade: 40 },
  { id: 'mottu_sport', nome: 'MOTTU_SPORT', cor: 'rgba(1,116,58,0.6)', capacidade: 35 }
];

const condicoes = [
  { id: 'bom', nome: 'BOM ESTADO', cor: 'rgba(17,136,29,0.5)' },
  { id: 'manutencao', nome: 'MANUTENÇÃO', cor: 'rgba(255,170,0,0.5)' },
  { id: 'revisao', nome: 'AGUARDANDO REVISÃO', cor: 'rgba(255,68,68,0.5)' }
];

export default function TelaPlantaEditor() {
  // Estados básicos
  const [nomePatio, setNomePatio] = useState('');
  const [endereco, setEndereco] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [capacidadeTotal, setCapacidadeTotal] = useState('');

  // Estados do canvas
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingZoneMode, setDrawingZoneMode] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const [currentZonePoints, setCurrentZonePoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [subzonaIndex, setSubzonaIndex] = useState(0);
  const [expandedZonas, setExpandedZonas] = useState({});

  // Refs
  const stageRef = useRef(null);
  const isDrawing = useRef(false);

  // Funções de desenho
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
    
    // Modo de desenho de linhas
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

    if (zonas.length >= 3) {
      alert('LIMITE EXCEDIDO: Máximo de 3 zonas por pátio.');
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

  // Funções de linha
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

  // Funções de zona
  const addZona = () => {
    if (zonas.length >= 3) {
      alert('LIMITE EXCEDIDO: Máximo de 3 zonas por pátio.');
      return;
    }
    const zonaId = zonas.length;
    const novaZona = {
      id: `zona-${zonaId + 1}`,
      x: 50 + zonaId * 250,
      y: 50,
      width: 200,
      height: 300,
      tipo: 'retangulo',
      rotation: 0,
      color: modelos[zonaId].cor,
      nome: modelos[zonaId].nome,
      capacidade: modelos[zonaId].capacidade,
      subzonas: []
    };
    setZonas([...zonas, novaZona]);
    setExpandedZonas({ ...expandedZonas, [`zona-${zonaId + 1}`]: false });
  };

  const addSubzona = () => {
    if (zonas.length < 3) return;
    
    const novaZonas = zonas.map((z) => {
      if (subzonaIndex < condicoes.length) {
        const novaSub = {
          id: `${z.id}-sub-${subzonaIndex + 1}`,
          nome: condicoes[subzonaIndex].nome,
          x: z.tipo === 'retangulo' ? z.x + 10 : z.points[0] + 10,
          y: z.tipo === 'retangulo' ? z.y + 10 + subzonaIndex * 90 : z.points[1] + 10 + subzonaIndex * 90,
          width: z.tipo === 'retangulo' ? z.width - 20 : 180,
          height: 80,
          rotation: 0,
          color: condicoes[subzonaIndex].cor
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
          const novaSubzonas = z.subzonas.map(sub => 
            sub.id === subId ? { ...sub, rotation } : sub
          );
          return { ...z, subzonas: novaSubzonas };
        }
        return z;
      })
    );
  };

  const toggleCollapse = (zonaId) => {
    setExpandedZonas({ ...expandedZonas, [zonaId]: !expandedZonas[zonaId] });
  };

  const removerZona = (zonaId) => {
    if (window.confirm('CONFIRMAR REMOÇÃO: Deseja remover esta zona?')) {
      setZonas(zonas.filter(z => z.id !== zonaId));
    }
  };

  const salvarPatio = () => {
    if (!nomePatio.trim() || !endereco.trim() || !responsavel.trim()) {
      alert('DADOS INCOMPLETOS: Preencha todos os campos obrigatórios.');
      return;
    }

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

  const capacidadeTotalCalculada = zonas.reduce((total, zona) => {
    const capacidadeSubzonas = zona.subzonas.reduce((sub, subzona) => sub + 15, 0);
    return total + (capacidadeSubzonas > 0 ? capacidadeSubzonas : zona.capacidade);
  }, 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000 0%, #002714ff 100%)',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace',
      padding: '20px'
    }}>
      {/* Header do Sistema */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
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

      {/* Layout Principal */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Painel de Controles */}
        <div style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Dados Básicos */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(1,116,58,0.3)',
            borderRadius: '8px',
            padding: '50px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
              borderBottom: '1px solid rgba(1,116,58,0.2)',
              paddingBottom: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚙️</span>
              <h2 style={{ margin: '0', fontSize: '1.1rem' }}>CONFIGURAÇÃO BÁSICA</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#01743A', marginBottom: '5px' }}>
                  NOME PÁTIO
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '10px',
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
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#01743A', marginBottom: '5px' }}>
                  ENDEREÇO
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '10px',
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
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#01743A', marginBottom: '5px' }}>
                  RESPONSÁVEL TÊCNICO
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '10px',
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
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#01743A', marginBottom: '5px' }}>
                  CAPACIDADE MÁXIMA
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '10px',
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
          </div>

          {/* Controles de Desenho */}
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

          {/* Controles de Zonas */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,170,0,0.3)',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '15px',
              borderBottom: '1px solid rgba(255,170,0,0.2)',
              paddingBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                <h2 style={{ margin: '0', fontSize: '1.1rem' }}>SISTEMA DE ZONAS</h2>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#ffaa00' }}>
                {zonas.length}/3 | {capacidadeTotalCalculada} VAGAS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
              <button 
                style={{
                  width: '100%',
                  padding: '12px',
                  background: zonas.length >= 3 ? 'rgba(100,100,100,0.3)' : 'rgba(255,170,0,0.2)',
                  border: '1px solid rgba(255,170,0,0.5)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  cursor: zonas.length >= 3 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onClick={addZona} 
                disabled={zonas.length >= 3}
              >
                <span>➕</span>
                <span>ADICIONAR ZONA</span>
              </button>

              <button 
                style={{
                  width: '100%',
                  padding: '12px',
                  background: (zonas.length < 3 || subzonaIndex >= condicoes.length) ? 'rgba(100,100,100,0.3)' : 'rgba(255,170,0,0.2)',
                  border: '1px solid rgba(255,170,0,0.5)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  cursor: (zonas.length < 3 || subzonaIndex >= condicoes.length) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onClick={addSubzona} 
                disabled={zonas.length < 3 || subzonaIndex >= condicoes.length}
              >
                <span>🔧</span>
                <span>ADICIONAR SUBZONA</span>
              </button>
            </div>

            {zonas.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>ZONAS CONFIGURADAS</h3>
                {zonas.map(z => (
                  <div key={z.id} style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      cursor: 'pointer'
                    }}>
                      <div 
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: z.color,
                          borderRadius: '3px',
                          marginRight: '10px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                          {z.id} - {z.nome}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                          {z.tipo === 'retangulo' 
                            ? `${z.width}x${z.height} | ${z.capacidade} VAGAS`
                            : `POLÍGONO ${z.points.length / 2} PONTOS | ${z.capacidade} VAGAS`
                          }
                        </div>
                      </div>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          padding: '5px'
                        }}
                        onClick={() => toggleCollapse(z.id)}
                      >
                        {expandedZonas[z.id] ? '▲' : '▼'}
                      </button>
                    </div>

                    {expandedZonas[z.id] && (
                      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {z.tipo === 'retangulo' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <label style={{ fontSize: '0.8rem', width: '80px' }}>LARGURA:</label>
                              <input 
                                type="number" 
                                value={z.width} 
                                onChange={e => updateZonaSize(z.id, parseInt(e.target.value) || z.width, z.height)}
                                style={{
                                  flex: 1,
                                  padding: '5px',
                                  background: 'rgba(0,0,0,0.5)',
                                  border: '1px solid rgba(255,170,0,0.3)',
                                  borderRadius: '3px',
                                  color: '#fff',
                                  fontSize: '0.85rem'
                                }}
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <label style={{ fontSize: '0.8rem', width: '80px' }}>ALTURA:</label>
                              <input 
                                type="number" 
                                value={z.height} 
                                onChange={e => updateZonaSize(z.id, z.width, parseInt(e.target.value) || z.height)}
                                style={{
                                  flex: 1,
                                  padding: '5px',
                                  background: 'rgba(0,0,0,0.5)',
                                  border: '1px solid rgba(255,170,0,0.3)',
                                  borderRadius: '3px',
                                  color: '#fff',
                                  fontSize: '0.85rem'
                                }}
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <label style={{ fontSize: '0.8rem', width: '80px' }}>ROTAÇÃO:</label>
                              <input 
                                type="number" 
                                value={z.rotation} 
                                onChange={e => updateZonaRotation(z.id, parseInt(e.target.value) || 0)}
                                style={{
                                  flex: 1,
                                  padding: '5px',
                                  background: 'rgba(0,0,0,0.5)',
                                  border: '1px solid rgba(255,170,0,0.3)',
                                  borderRadius: '3px',
                                  color: '#fff',
                                  fontSize: '0.85rem'
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            padding: '10px',
                            background: 'rgba(1,116,58,0.1)',
                            borderRadius: '4px',
                            textAlign: 'center'
                          }}>
                            <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>
                              Zona personalizada com {z.points.length / 2} pontos
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#888', margin: '5px 0' }}>
                              Arraste a zona no canvas para reposicionar
                            </p>
                          </div>
                        )}

                        <button 
                          style={{
                            width: '100%',
                            marginTop: '10px',
                            padding: '8px',
                            background: 'rgba(255,0,0,0.3)',
                            border: '1px solid rgba(255,0,0,0.5)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px'
                          }}
                          onClick={() => removerZona(z.id)}
                        >
                          🗑️ REMOVER ZONA
                        </button>

                        {z.subzonas.length > 0 && (
                          <div style={{ marginTop: '15px' }}>
                            <h4 style={{ fontSize: '0.85rem', marginBottom: '10px' }}>SUBZONAS</h4>
                            {z.subzonas.map(sub => (
                              <div key={sub.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '3px',
                                marginBottom: '5px'
                              }}>
                                <div 
                                  style={{
                                    width: '15px',
                                    height: '15px',
                                    backgroundColor: sub.color,
                                    borderRadius: '2px',
                                    flexShrink: 0
                                  }}
                                />
                                <div style={{ flex: 1, fontSize: '0.8rem' }}>
                                  {sub.nome}
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <input 
                                    type="number" 
                                    value={sub.width} 
                                    onChange={e => updateSubzonaSize(z.id, sub.id, parseInt(e.target.value) || sub.width, sub.height)}
                                    placeholder="L"
                                    style={{
                                      width: '50px',
                                      padding: '3px',
                                      background: 'rgba(0,0,0,0.5)',
                                      border: '1px solid rgba(255,170,0,0.3)',
                                      borderRadius: '3px',
                                      color: '#fff',
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                  <input 
                                    type="number" 
                                    value={sub.height} 
                                    onChange={e => updateSubzonaSize(z.id, sub.id, sub.width, parseInt(e.target.value) || sub.height)}
                                    placeholder="A"
                                    style={{
                                      width: '50px',
                                      padding: '3px',
                                      background: 'rgba(0,0,0,0.5)',
                                      border: '1px solid rgba(255,170,0,0.3)',
                                      borderRadius: '3px',
                                      color: '#fff',
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                  <input 
                                    type="number" 
                                    value={sub.rotation} 
                                    onChange={e => updateSubzonaRotation(z.id, sub.id, parseInt(e.target.value) || 0)}
                                    placeholder="R"
                                    style={{
                                      width: '50px',
                                      padding: '3px',
                                      background: 'rgba(0,0,0,0.5)',
                                      border: '1px solid rgba(255,170,0,0.3)',
                                      borderRadius: '3px',
                                      color: '#fff',
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Salvar */}
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
        </div>

        {/* Canvas de Desenho */}
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
                  {/* Linhas desenhadas */}
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
                  
                  {/* Linha atual sendo desenhada */}
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

                  {/* Zona sendo desenhada */}
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
                      {/* Mostrar pontos */}
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

                  {/* Zonas */}
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
                      
                      {/* Subzonas */}
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