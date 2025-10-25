import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Text, Circle } from 'react-konva';

const modelos = [
  { id: 'mottu_e', nome: 'MOTTU_E', cor: 'rgba(1,116,58,0.4)'},
  { id: 'sport_110_i', nome: 'SPORT_110_I', cor: 'rgba(1,116,58,0.5)'},
  { id: 'mottu_sport', nome: 'MOTTU_SPORT', cor: 'rgba(1,116,58,0.6)'},
  { id: 'mottu_esd', nome: 'MOTTU_ESD', cor: 'rgba(1,116,58,0.6)'}
];

export default function TelaPlantaEditor() {
  const [etapa, setEtapa] = useState('configuracao'); 
  const [modalAberto, setModalAberto] = useState(false);

  const [nomePatio, setNomePatio] = useState('');
  const [capacidadeTotal, setCapacidadeTotal] = useState('');

   const [street, setStreet] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [cep, setCep] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingZoneMode, setDrawingZoneMode] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const [currentZonePoints, setCurrentZonePoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [expandedZonas, setExpandedZonas] = useState({});

  const stageRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (etapa === 'editor') {
      setModalAberto(true);
    }
  }, [etapa]);

  const avancarParaEditor = () => {
    if (!nomePatio.trim() || !street.trim() || !complement.trim() || !neighborhood.trim() || !cep.trim() || !city.trim() || !state.trim()) {
      alert('DADOS INCOMPLETOS: Preencha todos os campos obrigatórios.');
      return;
    }
    setEtapa('editor');
  };

  const voltarParaConfiguracao = () => {
    setEtapa('configuracao');
    setModalAberto(false);
  };

  const aceitarRegras = () => {
    setModalAberto(false);
  };

  const toggleDrawing = () => {
    if (modalAberto) {
      alert('ACEITE AS REGRAS DE USO ANTES DE COMEÇAR A DESENHAR');
      return;
    }
    setDrawingMode(!drawingMode);
    if (drawingZoneMode) setDrawingZoneMode(false);
  };

  const toggleDrawingZone = () => {
    if (modalAberto) {
      alert('ACEITE AS REGRAS DE USO ANTES DE COMEÇAR A DESENHAR');
      return;
    }
    setDrawingZoneMode(!drawingZoneMode);
    if (drawingMode) setDrawingMode(false);
    if (!drawingZoneMode) setCurrentZonePoints([]);
  };

  const handleMouseDown = (e) => {
    if (modalAberto) return;
    if (!drawingMode && !drawingZoneMode) return;
    if (drawingMode) {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      if (pos) setCurrentLine([pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e) => {
    if (modalAberto) return;
    if (!drawingMode || !isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (point) {
      setCurrentLine(currentLine.concat([point.x, point.y]));
    }
  };

  const handleMouseUp = () => {
    if (modalAberto) return;
    if (!drawingMode) return;
    isDrawing.current = false;
    if (currentLine.length > 0) {
      setLines([...lines, { id: lines.length + 1, points: currentLine }]);
      setCurrentLine([]);
    }
  };

  const handleCanvasClick = (e) => {
    if (modalAberto) return;
    if (!drawingZoneMode) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) setCurrentZonePoints([...currentZonePoints, pos.x, pos.y]);
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

  const apagarZona = (zonaId) => {
    if (window.confirm('CONFIRMAR EXCLUSÃO: Tem certeza que deseja apagar esta zona?')) {
      setZonas(zonas.filter(zona => zona.id !== zonaId));
      const newExpandedZonas = { ...expandedZonas };
      delete newExpandedZonas[zonaId];
      setExpandedZonas(newExpandedZonas);
    }
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

  async function salvarPatio() {
  if (!nomePatio.trim() ||(!nomePatio.trim() || !street.trim() || !complement.trim() || !neighborhood.trim() || !cep.trim() || !city.trim() || !state.trim()|| !capacidadeTotal)) {
    alert('PREENCHA TODOS OS CAMPOS ANTES DE SALVAR.');
    return;
  }

  if (zonas.length === 0) {
    alert('ADICIONE PELO MENOS UMA ZONA AO PÁTIO.'); 
    return;
  }

  try {
    const estruturaSVG = gerarEstruturaSVG();
    const completoSVG = gerarSVGCompleto();

    const payload = {
      name: nomePatio,
      location: {
        street: street,
        complement: complement,
        neighborhood: neighborhood,
        cep:cep,
        city: city,
        state:state
        
      },
      availableArea: 0, // você pode calcular ou deixar 0
      capacity: parseInt(capacidadeTotal),
      structurePlan: estruturaSVG,
      floorPlan: completoSVG
    };

    const response = await fetch("https://localhost:7231/parkings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const erro = await response.json();
      console.error(erro);
      alert(`Erro ao salvar: ${erro.message || response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log("Pátio criado:", data);
    window.location.href = "/tela-success";

  } catch (error) {
    console.error("Erro:", error);
    alert("❌ Erro ao salvar o pátio. Verifique a conexão.");
  }
}


  function gerarEstruturaSVG() {
  const svgContent = lines.map(linha => {
    if (linha.points.length >= 4) {
      const x1 = linha.points[0];
      const y1 = linha.points[1];
      const x2 = linha.points[linha.points.length - 2];
      const y2 = linha.points[linha.points.length - 1];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#11881D" stroke-width="2" />`;
    }
    return '';
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
}

function gerarSVGCompleto() {
  const svgContentLines = lines.map(linha => {
    const pointsStr = linha.points.join(',');
    return `<polyline points="${pointsStr}" stroke="#11881D" stroke-width="2" fill="none"/>`;
  }).join('');

  const svgContentZonas = zonas.map(z => {
    const pointsStr = z.points.join(',');
    return `<polygon points="${pointsStr}" fill="${z.color}" stroke="#ffffff" stroke-width="2"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1050">${svgContentLines}${svgContentZonas}</svg>`;
}


  function exportarEstruturaSVG() {
    const svgContent = lines.map(linha => {
      if (linha.points.length >= 4) {
        const x1 = linha.points[0];
        const y1 = linha.points[1];
        const x2 = linha.points[linha.points.length - 2];
        const y2 = linha.points[linha.points.length - 1];
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#11881D" stroke-width="2" />`;
      }
      return '';
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
    downloadSVG(svg, 'estrutura.svg');
  }

  function exportarCompletoSVG() {
    const svgContentLines = lines.map(linha => {
      const pointsStr = linha.points.join(',');
      return `<polyline points="${pointsStr}" stroke="#11881D" stroke-width="2" fill="none"/>`;
    }).join('');

    const svgContentZonas = zonas.map(z => {
      const pointsStr = z.points.join(',');
      return `<polygon points="${pointsStr}" fill="${z.color}" stroke="#ffffff" stroke-width="2"/>`;
    }).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1050">${svgContentLines}${svgContentZonas}</svg>`;
    downloadSVG(svg, 'completo.svg');
  }

  function downloadSVG(svgString, filename) {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  
  if (modalAberto) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.9)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        color: '#fff', fontFamily: '"Courier New", monospace'
      }}>
        <div style={{
          width: '600px', background: '#111', border: '2px solid #01743A',
          borderRadius: '8px', padding: '30px', textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#0f0' }}>
            REGRAS DE USO DO CONFIGURADOR
          </h2>
          <p style={{ fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.4' }}>
            1️⃣ Desenhe a estrutura do pátio de acordo com o formato real. Assim, evite linhas que não se encontram e pontos desconexos<br/>
            2️⃣ Alinhe as linhas desenhadas pelo menu de controle lateral esquerdo<br/>
            3️⃣ Máximo de 4 zonas por pátio.<br/>
            4️⃣ Salve seu layout antes de exportar.<br/>
            5️⃣ Utilize o menu lateral para gerenciar zonas criadas.<br/>
            ✅ Clique em "ACEITAR" para continuar.
          </p>
          <button
            style={{
              padding: '12px 20px',
              background: '#01743A',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={aceitarRegras}
          >
            ACEITAR
          </button>
        </div>
      </div>
    );
  }

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
          <h2 style={{ margin: '0', fontSize: '1.3rem' }}>1° ETAPA - CADASTRO DO PÁTIO</h2>
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
              RUA
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
              placeholder="EX: AV. PAULISTA"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#01743A', marginBottom: '8px' }}>
              COMPLEMENTO
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
              placeholder="APTO, SALA, ETC."
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#01743A', marginBottom: '8px' }}>
              BAIRRO
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
              placeholder="EX: JARDINS"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#01743A', marginBottom: '8px' }}>
              CEP
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
              placeholder="EX: 01311000"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#01743A', marginBottom: '8px' }}>
              CIDADE
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
              placeholder="EX: SÃO PAULO"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#01743A', marginBottom: '8px' }}>
              ESTADO
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
              placeholder="EX: SP"
              value={state}
              onChange={(e) => setState(e.target.value)}
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
      padding: '20px',
      overflow: 'hidden' 
    }}>
      
      <div style={{
        maxWidth: '1800px', 
        margin: '0 auto', 
        width: '100%'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          borderBottom: '2px solid #01743A',
          paddingBottom: '20px',
          position: 'relative'
        }}>
          <h1 style={{
            fontSize: '2rem', 
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#01743A',
            textShadow: '0 0 20px rgba(1,116,58,0.5)',
            margin: '0'
          }}>
            CONFIGURADOR DE PÁTIO
          </h1>
          <p style={{
            color: '#888',
            fontSize: '0.8rem',
            marginTop: '8px'
          }}>
            EDITOR DE LAYOUT - {nomePatio.toUpperCase()}
          </p>

          <button 
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              padding: '8px 12px',
              background: 'rgba(255,170,0,0.2)',
              border: '1px solid rgba(255,170,0,0.5)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '0.7rem',
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

        
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          height: 'calc(100vh - 180px)', 
          minHeight: '600px'
        }}>
          
          <div style={{
            width: '350px', 
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            flexShrink: 0 
          }}>
            
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(1,116,58,0.3)',
              borderRadius: '8px',
              padding: '15px',
              flex: 1
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                borderBottom: '1px solid rgba(1,116,58,0.2)',
                paddingBottom: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>✏️</span>
                <h2 style={{ margin: '0', fontSize: '1rem' }}>CONTROLES DE DESENHO</h2>
              </div>

              <button 
                style={{
                  width: '100%',
                  padding: '10px',
                  background: drawingMode ? 'rgba(255,0,0,0.3)' : 'rgba(1,116,58,0.2)',
                  border: drawingMode ? '2px solid #ff0000' : '1px solid rgba(1,116,58,0.5)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}
                onClick={toggleDrawing}
              >
                <span>{drawingMode ? '🔴' : '⚫'}</span>
                <span>{drawingMode ? 'DESATIVAR DESENHO' : 'ATIVAR DESENHO'}</span>
              </button>

              <button 
                style={{
                  width: '100%',
                  padding: '10px',
                  background: drawingZoneMode ? 'rgba(0,255,0,0.3)' : 'rgba(1,116,58,0.2)',
                  border: drawingZoneMode ? '2px solid #00ff00' : '1px solid rgba(1,116,58,0.5)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}
                onClick={toggleDrawingZone}
              >
                <span>{drawingZoneMode ? '🟢' : '⚫'}</span>
                <span>{drawingZoneMode ? 'DESATIVAR ZONA' : 'DESENHAR ZONA'}</span>
              </button>

              {drawingZoneMode && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(0,255,0,0.1)',
                  border: '1px solid rgba(0,255,0,0.3)',
                  borderRadius: '4px'
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#0f0',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    Clique no canvas para adicionar pontos. Mínimo 3 pontos.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: currentZonePoints.length < 6 ? 'rgba(100,100,100,0.3)' : 'rgba(0,255,0,0.3)',
                        border: '1px solid rgba(0,255,0,0.5)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.75rem',
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
                        padding: '8px',
                        background: 'rgba(255,0,0,0.3)',
                        border: '1px solid rgba(255,0,0,0.5)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                      onClick={cancelarZonaDesenhada}
                    >
                      ✕ CANCELAR
                    </button>
                  </div>
                  <div style={{
                    marginTop: '8px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: '#0f0'
                  }}>
                    PONTOS: {currentZonePoints.length / 2}
                  </div>
                </div>
              )}

              <div style={{
                marginTop: '12px',
                padding: '8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', color: '#01743A' }}>LINHAS: {lines.length}</span>
              </div>

              {lines.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <h3 style={{ fontSize: '0.8rem', marginBottom: '8px' }}>LINHAS DESENHADAS</h3>
                  <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {lines.map(line => (
                      <div key={line.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '4px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontSize: '0.75rem' }}>LINHA_{String(line.id).padStart(2, '0')}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            style={{
                              padding: '4px 8px',
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
                              padding: '4px 8px',
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
                </div>
              )}
            </div>

            
            <button 
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(1,116,58,0.3), rgba(1,116,58,0.5))',
                border: '2px solid #01743A',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={salvarPatio}
            >
              <span>💾</span>
              <span>REGISTRAR PÁTIO</span>
            </button>

            <button 
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(255,170,0,0.3), rgba(255,170,0,0.5))',
                border: '2px solid #ffaa00',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={exportarEstruturaSVG}
            >
              <span>📦</span>
              <span>EXPORTAR LAYOUT</span>
            </button>
          </div>

          
          <div style={{ 
            flex: 1,
            minWidth: 0 
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(1,116,58,0.3)',
              borderRadius: '8px',
              overflow: 'hidden',
              height: '100%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 15px',
                background: 'rgba(0,0,0,0.3)',
                borderBottom: '1px solid rgba(1,116,58,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🎨</span>
                  <h2 style={{ margin: '0', fontSize: '1rem' }}>ÁREA DE DESENHO</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: drawingMode || drawingZoneMode ? '#00ff00' : '#888',
                      boxShadow: drawingMode || drawingZoneMode ? '0 0 8px #00ff00' : 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: drawingMode || drawingZoneMode ? '#0f0' : '#888' }}>
                    {drawingMode ? 'MODO DESENHO ATIVO' : drawingZoneMode ? 'MODO DESENHO ZONA' : 'MODO VISUALIZAÇÃO'}
                  </span>
                </div>
              </div>

              <div style={{
                background: '#000',
                padding: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100% - 50px)' 
              }}>
                <Stage
                  width={1200} 
                  height={800}  
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

          
          <div style={{
            width: '280px', 
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            flexShrink: 0
          }}>
            
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(1,116,58,0.3)',
              borderRadius: '8px',
              padding: '15px',
              flex: 1
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                borderBottom: '1px solid rgba(1,116,58,0.2)',
                paddingBottom: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>🗂️</span>
                <h2 style={{ margin: '0', fontSize: '1rem' }}>CONTROLE DE ZONAS</h2>
              </div>

              <div style={{
                marginBottom: '12px',
                padding: '8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', color: '#01743A' }}>
                  ZONAS: {zonas.length}/4
                </span>
              </div>

              {zonas.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '15px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                  color: '#888',
                  fontSize: '0.8rem'
                }}>
                  Nenhuma zona criada
                </div>
              ) : (
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {zonas.map((zona, index) => (
                    <div key={zona.id} style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: `2px solid ${zona.color}`,
                      borderRadius: '6px',
                      padding: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '6px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            marginBottom: '3px'
                          }}>
                            {zona.nome}
                          </div>
                          <div style={{
                            fontSize: '0.65rem',
                            color: '#888'
                          }}>
                            Pontos: {zona.points.length / 2}
                          </div>
                        </div>
                        
                        <button 
                          style={{
                            padding: '4px 6px',
                            background: 'rgba(255,0,0,0.3)',
                            border: '1px solid rgba(255,0,0,0.5)',
                            borderRadius: '3px',
                            color: '#fff',
                            fontSize: '0.65rem',
                            cursor: 'pointer'
                          }}
                          onClick={() => apagarZona(zona.id)}
                          title="Apagar zona"
                        >
                          🗑️
                        </button>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '6px'
                      }}>
                        <div 
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            backgroundColor: zona.color
                          }}
                        />
                        <span style={{
                          fontSize: '0.65rem',
                          color: '#888'
                        }}>
                          Cor da zona
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                marginTop: '12px',
                padding: '8px',
                background: 'rgba(1,116,58,0.1)',
                border: '1px solid rgba(1,116,58,0.3)',
                borderRadius: '4px'
              }}>
                <p style={{
                  fontSize: '0.7rem',
                  color: '#01743A',
                  textAlign: 'center',
                  margin: '0'
                }}>
                  💡 Clique em 🗑️ para remover zona
                </p>
              </div>
            </div>

            {/* Estatísticas */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(1,116,58,0.3)',
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                borderBottom: '1px solid rgba(1,116,58,0.2)',
                paddingBottom: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>📊</span>
                <h2 style={{ margin: '0', fontSize: '1rem' }}>ESTATÍSTICAS</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: 'Total de Zonas', value: zonas.length },
                  { label: 'Limite', value: `${zonas.length}/4`, color: zonas.length >= 4 ? '#ff4444' : '#0f0' },
                  { label: 'Total de Linhas', value: lines.length }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem'
                  }}>
                    <span style={{ color: '#888' }}>{item.label}:</span>
                    <span style={{ color: item.color || '#fff' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}