import { useState } from "react";

export default function TelaLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleLogin = async () => {
    setMensagem(""); 

    try {
      const response = await fetch("https://localhost:7231/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: senha,
        }),
      });

      if (!response.ok) {
        const erro = await response.text();
        setMensagem(erro || "Erro ao fazer login");
        return;
      }

      const data = await response.json();
      const token = data.token;

      
      localStorage.setItem("token", token);

      setMensagem("Login realizado com sucesso!");
      console.log("Token JWT:", token);

      // Redirecionar para outra página
      window.location.href = "/tela-editor";
    } catch (error) {
      console.error(error);
      setMensagem("Erro de conexão com o servidor");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000 0%, #002714ff 100%)",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "50px",
          borderBottom: "2px solid #01743A",
          paddingBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "3px",
            color: "#01743A",
            textShadow: "0 0 20px rgba(1,116,58,0.5)",
            margin: "0",
          }}
        >
          LOGIN
        </h1>
        <p
          style={{
            color: "#888",
            fontSize: "0.9rem",
            marginTop: "10px",
          }}
        >
          SISTEMA DE GERENCIAMENTO ESPACIAL
        </p>
      </div>

      <div
        style={{
          width: "350px",
          height: "50vh",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(1,116,58,0.3)",
          borderRadius: "8px",
          padding: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "30px",
            borderBottom: "1px solid rgba(1,116,58,0.2)",
            paddingBottom: "15px",
          }}
        >
          <h2 style={{ margin: "0", fontSize: "1.3rem" }}>
            Entre com sua conta Pulse
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#01743A",
                marginBottom: "8px",
              }}
            >
              EMAIL
            </label>
            <input
              style={{
                width: "90%",
                padding: "12px",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(1,116,58,0.3)",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "0.9rem",
                fontFamily: '"Courier New", monospace',
              }}
              placeholder="DIGITE SEU EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#01743A",
                marginBottom: "8px",
              }}
            >
              SENHA
            </label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(1,116,58,0.3)",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "0.9rem",
                fontFamily: '"Courier New", monospace',
              }}
              placeholder="DIGITE SUA SENHA"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button
            style={{
              width: "100%",
              padding: "15px",
              background:
                "linear-gradient(135deg, rgba(1,116,58,0.3), rgba(1,116,58,0.5))",
              border: "2px solid #01743A",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              boxShadow: "0 0 20px rgba(1,116,58,0.3)",
              transition: "all 0.3s",
              marginTop: "30px",
            }}
            onClick={handleLogin}
          >
            <span>ENTRAR</span>
          </button>

          {mensagem && (
            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                color: mensagem.includes("sucesso")
                  ? "#00ff99"
                  : "#ff6666",
              }}
            >
              {mensagem}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
