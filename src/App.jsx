import { useState } from "react";

import Dashboard from "./components/Dashboard";
import Alunos from "./components/Alunos";
import Combos from "./components/Combos";

function App() {
  const [pagina, setPagina] = useState("dashboard");

  return (
    <div className="container">

      <h1 style={{ textAlign: "center" }}>
        Guia do Faixa Branca
      </h1>

      <h2 style={{ textAlign: "center", fontSize: 16 }}>
        By Diogo Carioca
      </h2>

      <div className="navbar">
        <button
          className={pagina === "dashboard" ? "active" : ""}
          onClick={() => setPagina("dashboard")}
        >
          📊
        </button>

        <button
          className={pagina === "alunos" ? "active" : ""}
          onClick={() => setPagina("alunos")}
        >
          👥
        </button>

        <button
          className={pagina === "combos" ? "active" : ""}
          onClick={() => setPagina("combos")}
        >
          🥋
        </button>
      </div>

      {pagina === "dashboard" && <Dashboard />}
      {pagina === "alunos" && <Alunos />}
      {pagina === "combos" && <Combos />}

    </div>
  );
}

export default App;