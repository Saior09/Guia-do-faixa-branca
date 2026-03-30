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
        progresso ( feito )
      `)
      .order("nome");

    const alunosComProgresso = (data || []).map(aluno => {
      const feitos = aluno.progresso.filter(p => p.feito).length;
      const total = aluno.progresso.length;

      return { ...aluno, feitos, total };
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

    await supabase.from("progresso").insert(progressoInicial);

    setNome("");
    carregarAlunos();
  }

  async function editarAluno(id, novoNome) {
    if (!novoNome.trim()) return;

    await supabase
      .from("alunos")
      .update({ nome: novoNome })
      .eq("id", id);

    carregarAlunos();
  }

  async function removerAluno(id) {
    if (!confirm("Excluir aluno?")) return;

    await supabase
      .from("alunos")
      .delete()
      .eq("id", id);

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

      <div className="card fade-in">
        <input
          placeholder="Nome do aluno"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && criarAluno()}
        />

        <button onClick={criarAluno}>
          Adicionar aluno
        </button>
      </div>

      <input
        placeholder="Buscar aluno..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {alunosFiltrados.map(aluno => {
        const porcentagem = aluno.total === 0
          ? 0
          : Math.round((aluno.feitos / aluno.total) * 100);

        return (
          <div key={aluno.id} className="card fade-in">

            <div className="row">
              <input
                defaultValue={aluno.nome}
                onBlur={(e) => editarAluno(aluno.id, e.target.value)}
              />

              <button
                className="danger"
                onClick={() => removerAluno(aluno.id)}
              >
                🗑️
              </button>
            </div>

            <div className="sub">
              {aluno.feitos} / {aluno.total}
            </div>

            <div className="progress">
              <div
                className="progress-fill"
                style={{
                  width: `${porcentagem}%`,
                  transition: "width 0.4s ease"
                }}
              />
            </div>

            <button onClick={() => setAlunoSelecionado(aluno)}>
              Ver detalhes
            </button>

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
        combo_id,
        combos ( id, nome )
      `)
      .eq("aluno_id", aluno.id);

    setCombos(data || []);
  }

  async function toggleProgresso(item) {
    await supabase
      .from("progresso")
      .update({ feito: !item.feito })
      .eq("aluno_id", aluno.id)
      .eq("combo_id", item.combo_id);

    carregarCombos();
  }

  useEffect(() => {
    carregarCombos();
  }, []);

  return (
    <div>

      <button onClick={voltar} style={{ marginBottom: 10 }}>
        ⬅ Voltar
      </button>

      <h3>{aluno.nome}</h3>

      {combos.map((c, i) => (
        <div key={i} className="card fade-in">

          <div className="row">
            <strong>{c.combos?.nome}</strong>

            <button
              className={c.feito ? "success" : ""}
              onClick={() => toggleProgresso(c)}
            >
              {c.feito ? "✔ Desfazer" : "Concluir"}
            </button>
          </div>

          <div className="sub">
            {c.feito ? "✔ Concluído" : "⏳ Pendente"}
          </div>

        </div>
      ))}

    </div>
  );
}