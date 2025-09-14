import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Rect, Text } from 'react-konva';
import '../Styles/TelaPlantaEditor.css';

const modelos = [
  { id: 'mottu_e', nome: 'MOTTU_E', cor: 'rgba(0,102,255,0.4)', capacidade: 50 },
  { id: 'sport_110_i', nome: 'SPORT_110_I', cor: 'rgba(0,128,255,0.4)', capacidade: 40 },
  { id: 'mottu_sport', nome: 'MOTTU_SPORT', cor: 'rgba(0,255,255,0.4)', capacidade: 35 }
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
  const [currentLine, setCurrentLine] = useState([]);
  const [lines, setLines] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [subzonaIndex, setSubzonaIndex] = useState(0);
  const [expandedZonas, setExpandedZonas] = useState({});

  // Refs
  const stageRef = useRef(null);
  const isDrawing = useRef(false);

  // Funções de desenho
  const toggleDrawing = () => setDrawingMode(!drawingMode);

  const handleMouseDown = (e) => {
    if (!drawingMode) return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    if (pos) setCurrentLine([pos.x, pos.y]);
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
          x: z.x + 10,
          y: z.y + 10 + subzonaIndex * 90,
          width: z.width - 20,
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

    // Salvar no localStorage
    const patiosExistentes = JSON.parse(localStorage.getItem('patios') || '[]');
    patiosExistentes.push(patio);
    localStorage.setItem('patios', JSON.stringify(patiosExistentes));

    alert('OPERAÇÃO CONCLUÍDA: Pátio cadastrado no sistema.');
    console.log('Pátio salvo:', patio);
  };

  const capacidadeTotalCalculada = zonas.reduce((total, zona) => {
    const capacidadeSubzonas = zona.subzonas.reduce((sub, subzona) => sub + 15, 0);
    return total + (capacidadeSubzonas > 0 ? capacidadeSubzonas : zona.capacidade);
  }, 0);

  return (
    <div className="container">
      {/* Header do Sistema */}
      <div className="system-header">
        <div className="header-glow"></div>
        <h1 className="system-title">CONFIGURADOR DE PÁTIO</h1>
        <p className="system-subtitle">SISTEMA DE GERENCIAMENTO ESPACIAL</p>
      </div>

      {/* Layout Principal */}
      <div className="main-layout">
        {/* Painel de Controles */}
        <div className="control-panel">
          {/* Dados Básicos */}
          <div className="config-section">
            <div className="section-header">
              <div className="config-glow"></div>
              <span className="section-icon">⚙️</span>
              <h2 className="section-title">CONFIGURAÇÃO BÁSICA</h2>
            </div>

            <div className="input-field">
              <label className="input-label">NOME_PATIO</label>
              <input
                className="input"
                placeholder="DIGITE O NOME DO PÁTIO"
                value={nomePatio}
                onChange={(e) => setNomePatio(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label className="input-label">ENDERECO_SISTEMA</label>
              <input
                className="input"
                placeholder="LOCALIZAÇÃO GEOGRÁFICA"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label className="input-label">RESPONSAVEL_TECNICO</label>
              <input
                className="input"
                placeholder="NOME DO RESPONSÁVEL"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label className="input-label">CAPACIDADE_MAXIMA</label>
              <input
                className="input"
                type="number"
                placeholder="NÚMERO MÁXIMO DE VEÍCULOS"
                value={capacidadeTotal}
                onChange={(e) => setCapacidadeTotal(e.target.value)}
              />
            </div>
          </div>

          {/* Controles de Desenho */}
          <div className="drawing-section">
            <div className="section-header">
              <div className="drawing-glow"></div>
              <span className="section-icon">✏️</span>
              <h2 className="section-title">CONTROLES DE DESENHO</h2>
            </div>

            <button 
              className={`drawing-button ${drawingMode ? 'active' : ''}`}
              onClick={toggleDrawing}
            >
              <span>{drawingMode ? '🔴' : '⚫'}</span>
              <span>{drawingMode ? 'DESATIVAR DESENHO' : 'ATIVAR DESENHO'}</span>
            </button>

            <div className="drawing-stats">
              <span className="stats-text">LINHAS: {lines.length}</span>
            </div>

            {lines.length > 0 && (
              <div className="lines-list">
                <h3 className="list-title">LINHAS DESENHADAS</h3>
                {lines.map(line => (
                  <div key={line.id} className="line-item">
                    <span className="line-name">LINHA_{String(line.id).padStart(2, '0')}</span>
                    <div className="line-controls">
                      <button 
                        className="line-button straighten"
                        onClick={() => straightenLine(line.id)}
                      >
                        📏
                      </button>
                      <button 
                        className="line-button delete"
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
          <div className="zone-section">
            <div className="section-header">
              <div className="zone-glow"></div>
              <span className="section-icon">⚡</span>
              <h2 className="section-title">SISTEMA DE ZONAS</h2>
              <div className="zone-stats">
                <span className="zone-stats-text">
                  {zonas.length}/3 | {capacidadeTotalCalculada} VAGAS
                </span>
              </div>
            </div>

            <div className="zone-controls">
              <button 
                className={`zone-button ${zonas.length >= 3 ? 'disabled' : ''}`}
                onClick={addZona} 
                disabled={zonas.length >= 3}
              >
                <span>➕</span>
                <span>ADICIONAR ZONA</span>
              </button>

              <button 
                className={`zone-button ${zonas.length < 3 || subzonaIndex >= condicoes.length ? 'disabled' : ''}`}
                onClick={addSubzona} 
                disabled={zonas.length < 3 || subzonaIndex >= condicoes.length}
              >
                <span>🔧</span>
                <span>ADICIONAR SUBZONA</span>
              </button>
            </div>

            {zonas.length > 0 && (
              <div className="zones-list">
                <h3 className="list-title">ZONAS CONFIGURADAS</h3>
                {zonas.map(z => (
                  <div key={z.id} className="zone-item">
                    <div className="zone-header-item">
                      <div 
                        className="zone-color" 
                        style={{ backgroundColor: z.color }}
                      ></div>
                      <div className="zone-info">
                        <span className="zone-name">{z.id} - {z.nome}</span>
                        <span className="zone-details">
                          {z.width}x{z.height} | {z.capacidade} VAGAS
                        </span>
                      </div>
                      <button
                        className="expand-btn"
                        onClick={() => toggleCollapse(z.id)}
                      >
                        {expandedZonas[z.id] ? '▲' : '▼'}
                      </button>
                    </div>

                    {expandedZonas[z.id] && (
                      <div className="zone-controls-expanded">
                        <div className="size-controls">
                          <div className="control-row">
                            <label>LARGURA:</label>
                            <input 
                              type="number" 
                              value={z.width} 
                              onChange={e => updateZonaSize(z.id, parseInt(e.target.value) || z.width, z.height)}
                              className="size-input"
                            />
                          </div>
                          <div className="control-row">
                            <label>ALTURA:</label>
                            <input 
                              type="number" 
                              value={z.height} 
                              onChange={e => updateZonaSize(z.id, z.width, parseInt(e.target.value) || z.height)}
                              className="size-input"
                            />
                          </div>
                          <div className="control-row">
                            <label>ROTAÇÃO:</label>
                            <input 
                              type="number" 
                              value={z.rotation} 
                              onChange={e => updateZonaRotation(z.id, parseInt(e.target.value) || 0)}
                              className="size-input"
                            />
                          </div>
                        </div>

                        <button 
                          className="remove-zone-btn"
                          onClick={() => removerZona(z.id)}
                        >
                          🗑️ REMOVER ZONA
                        </button>

                        {z.subzonas.length > 0 && (
                          <div className="subzones-list">
                            <h4 className="subzones-title">SUBZONAS</h4>
                            {z.subzonas.map(sub => (
                              <div key={sub.id} className="subzone-item">
                                <div 
                                  className="subzone-color"
                                  style={{ backgroundColor: sub.color }}
                                ></div>
                                <div className="subzone-info">
                                  <span className="subzone-name">{sub.nome}</span>
                                </div>
                                <div className="subzone-size-controls">
                                  <input 
                                    type="number" 
                                    value={sub.width} 
                                    onChange={e => updateSubzonaSize(z.id, sub.id, parseInt(e.target.value) || sub.width, sub.height)}
                                    className="subzone-input"
                                    placeholder="L"
                                  />
                                  <input 
                                    type="number" 
                                    value={sub.height} 
                                    onChange={e => updateSubzonaSize(z.id, sub.id, sub.width, parseInt(e.target.value) || sub.height)}
                                    className="subzone-input"
                                    placeholder="A"
                                  />
                                  <input 
                                    type="number" 
                                    value={sub.rotation} 
                                    onChange={e => updateSubzonaRotation(z.id, sub.id, parseInt(e.target.value) || 0)}
                                    className="subzone-input"
                                    placeholder="R"
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
          <div className="save-section">
            <button className="save-button" onClick={salvarPatio}>
              <div className="save-glow"></div>
              <span>💾</span>
              <span className="save-text">REGISTRAR PÁTIO</span>
            </button>
          </div>
        </div>

        {/* Canvas de Desenho */}
        <div className="canvas-container">
          <div className="canvas-header">
            <div className="canvas-glow"></div>
            <span className="canvas-icon">🎨</span>
            <h2 className="canvas-title">ÁREA DE DESENHO</h2>
            <div className="canvas-status">
              <div className={`status-dot ${drawingMode ? 'active' : 'inactive'}`}></div>
              <span className="status-text">
                {drawingMode ? 'MODO DESENHO ATIVO' : 'MODO VISUALIZAÇÃO'}
              </span>
            </div>
          </div>

          <div className="canvas-wrapper">
            <Stage
              width={1400}
              height={1050}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              ref={stageRef}
              className="canvas-stage"
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

                {/* Zonas */}
                {zonas.map(z => (
                  <React.Fragment key={z.id}>
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
  );
}