import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Combos() {

  const [combos, setCombos] = useState([]);
  const [comboSelecionado, setComboSelecionado] = useState(null);
  const [novoNome, setNovoNome] = useState("");
  const [novaDesc, setNovaDesc] = useState("");

  async function carregarCombos() {
    const { data } = await supabase
      .from("combos")
      .select(`
        id,
        nome,
        descricao,
        progresso ( feito )
      `);

    setCombos(data || []);
  }

  async function criarCombo() {
  if (!novoNome.trim()) return;

  // 1. cria o combo e já pega ele
  const { data: novoCombo, error: erroCombo } = await supabase
    .from("combos")
    .insert([{ nome: novoNome, descricao: novaDesc }])
    .select()
    .single();

  if (erroCombo) {
    alert("Erro ao criar combo");
    return;
  }

  // 2. busca todos os alunos
  const { data: alunos, error: erroAlunos } = await supabase
    .from("alunos")
    .select("id");

  if (erroAlunos) {
    alert("Erro ao buscar alunos");
    return;
  }

  // 3. cria progresso para todos os alunos
  const progressoInicial = alunos.map(aluno => ({
    aluno_id: aluno.id,
    combo_id: novoCombo.id,
    feito: false
  }));

  if (progressoInicial.length > 0) {
    const { error: erroProgresso } = await supabase
      .from("progresso")
      .insert(progressoInicial);

    if (erroProgresso) {
      alert("Erro ao criar progresso");
      return;
    }
  }

  // 4. limpa e recarrega
  setNovoNome("");
  setNovaDesc("");
  carregarCombos();
}

  async function editarCombo(id, dados) {
    await supabase
      .from("combos")
      .update(dados)
      .eq("id", id);

    carregarCombos();
  }

  async function removerCombo(id) {
    if (!confirm("Excluir combo?")) return;

    await supabase
      .from("combos")
      .delete()
      .eq("id", id);

    carregarCombos();
  }

  useEffect(() => {
    carregarCombos();
  }, []);

  if (comboSelecionado) {
    return (
      <ComboDetalhe
        combo={comboSelecionado}
        voltar={() => {
          setComboSelecionado(null);
          carregarCombos();
        }}
        editarCombo={editarCombo}
        removerCombo={removerCombo}
      />
    );
  }

   return (
    <div>

      <h2>Combos</h2>

      <div className="card">
        <input
          placeholder="Nome"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
        />

        <textarea
          placeholder="Descrição"
          value={novaDesc}
          onChange={(e) => setNovaDesc(e.target.value)}
        />

        <button onClick={criarCombo}>
          Criar combo
        </button>
      </div>

      {combos.map(combo => (
        <div key={combo.id} className="card">

          <strong>{combo.nome}</strong>

          {combo.descricao && (
            <div className="sub">
              {combo.descricao}
            </div>
          )}

          <button onClick={() => setComboSelecionado(combo)}>
            Editar
          </button>

        </div>
      ))}

    </div>
  );
}

function ComboDetalhe({ combo, voltar, editarCombo, removerCombo }) {

  return (
    <div>

      <button onClick={voltar} style={{ marginBottom: 10 }}>
        ⬅ Voltar
      </button>

      <div className="card">

        <input
          defaultValue={combo.nome}
          onBlur={(e) =>
            editarCombo(combo.id, { nome: e.target.value })
          }
        />

        <textarea
          defaultValue={combo.descricao}
          onBlur={(e) =>
            editarCombo(combo.id, { descricao: e.target.value })
          }
        />

        <button
          className="danger"
          onClick={() => removerCombo(combo.id)}
        >
          🗑️ Excluir
        </button>

      </div>

    </div>
  );
}