import { useState } from "react";

import Dashboard from "./components/Dashboard";
import Alunos from "./components/Alunos";
import Combos from "./components/Combos";

function App() {

  const [pagina, setPagina] = useState("dashboard");

  return (
    <div style={{ padding: 16, maxWidth: 500, margin: "0 auto" }}>

      <h1 style={{ textAlign: "center" }}>
        Guia do Faixa Branca
      </h1>
       <h2 style={{ textAlign: "center" }}>
        By Diogo Carioca
        </h2>

      <Navbar setPagina={setPagina} pagina={pagina} />

      {pagina === "dashboard" && <Dashboard />}
      {pagina === "alunos" && <Alunos />}
      {pagina === "combos" && <Combos />}

    </div>
  );
}

function Navbar({ pagina, setPagina }) {

  const botao = (nome, label) => ({
    flex: 1,
    padding: 12,
    border: "none",
    fontSize: 16,
    background: pagina === nome ? "#2196f3" : "#eee",
    color: pagina === nome ? "white" : "black",
    cursor: "pointer"
  });

  return (

    <div
      style={{
      display: "flex",
      gap: 8,
      marginBottom: 20
      }}
    >

      <button
        style={botao("dashboard")}
        onClick={() => setPagina("dashboard")}
      >
        📊
      </button>

      <button
        style={botao("alunos")}
        onClick={() => setPagina("alunos")}
      >
        👥
      </button>

      <button
        style={botao("combos")}
        onClick={() => setPagina("combos")}
      >
        🥋
      </button>

    </div>
  );
}

export default App;