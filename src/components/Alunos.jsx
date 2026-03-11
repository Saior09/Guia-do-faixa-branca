import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Alunos() {

  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [nome, setNome] = useState("");
  const [busca, setBusca] = useState("");

  async function carregarAlunos() {

    const { data } = await supabase
      .from("alunos")
      .select(`
        id,
        nome,
        progresso (
          feito
        )
      `)
      .order("nome");

    const alunosComProgresso = (data || []).map(aluno => {

      const feitos = aluno.progresso.filter(p => p.feito).length;
      const total = aluno.progresso.length;

      return {
        ...aluno,
        feitos,
        total
      };

    });

    setAlunos(alunosComProgresso);
  }

  async function criarAluno() {

    if (!nome.trim()) return;

    const { data: novoAluno } = await supabase
      .from("alunos")
      .insert([{ nome }])
      .select()
      .single();

    const { data: combos } = await supabase
      .from("combos")
      .select("id");

    const progressoInicial = combos.map(combo => ({
      aluno_id: novoAluno.id,
      combo_id: combo.id,
      feito: false
    }));

    await supabase
      .from("progresso")
      .insert(progressoInicial);

    setNome("");
    carregarAlunos();
  }

  useEffect(() => {
    carregarAlunos();
  }, []);

  const alunosFiltrados = alunos.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (alunoSelecionado) {
    return (
      <AlunoDetalhe
        aluno={alunoSelecionado}
        voltar={() => setAlunoSelecionado(null)}
      />
    );
  }

  return (
    <div>

      <h2>Alunos</h2>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12
        }}
      >

        <input
          placeholder="Nome do aluno"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") criarAluno();
          }}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={criarAluno}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            background: "#2196f3",
            color: "white",
            cursor: "pointer"
          }}
        >
          Adicionar
        </button>

      </div>

      <input
        placeholder="Buscar aluno..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={{
          width: "60%",
          padding: 8,
          marginBottom: 16,
          borderRadius: 6,
          border: "1px solid #ccc"
        }}
      />

      {alunosFiltrados.map(aluno => {

        const porcentagem = aluno.total === 0
          ? 0
          : Math.round((aluno.feitos / aluno.total) * 100);

        return (

          <div
            key={aluno.id}
            onClick={() => setAlunoSelecionado(aluno)}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 12,
              borderRadius: 8,
              cursor: "pointer"
            }}
          >

            <strong>{aluno.nome}</strong>

            <div style={{ marginTop: 6 }}>
              {aluno.feitos} / {aluno.total}
            </div>

            <div
              style={{
                height: 10,
                background: "#eee",
                borderRadius: 6,
                marginTop: 6,
                overflow: "hidden"
              }}
            >

              <div
                style={{
                  width: `${porcentagem}%`,
                  height: "100%",
                  background: "#2196f3"
                }}
              />

            </div>

          </div>

        );

      })}

    </div>
  );
}

function AlunoDetalhe({ aluno, voltar }) {

  const [combos, setCombos] = useState([]);

  async function carregarCombos() {

    const { data } = await supabase
      .from("progresso")
      .select(`
        feito,
        combos (
          nome
        )
      `)
      .eq("aluno_id", aluno.id);

    setCombos(data || []);
  }

  useEffect(() => {
    carregarCombos();
  }, []);

  const feitos = combos.filter(c => c.feito).length;
  const faltam = combos.length - feitos;

  return (
    <div>

      <button
        onClick={voltar}
        style={{
          marginBottom: 16,
          padding: 10,
          borderRadius: 8,
          border: "1px solid #ccc",
          background: "white",
          cursor: "pointer",
          color: "black"
        }}
      >
        ⬅ Voltar
      </button>

      <h3>{aluno.nome}</h3>

      <div style={{ marginBottom: 16 }}>
        ✔ {feitos} feitos  
        <br />
        ⏳ {faltam} faltando
      </div>

      {combos.map((c, index) => (

        <div
          key={index}
          style={{
            padding: 12,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between"
          }}
        >

          {c.combos?.nome}

          <span>
            {c.feito ? "✔" : "⏳"}
          </span>

        </div>

      ))}

    </div>
  );
}