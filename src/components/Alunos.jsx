import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Alunos() {

  const [alunos, setAlunos] = useState([]);
  const [nome, setNome] = useState("");

  async function carregarAlunos() {

    const { data } = await supabase
      .from("alunos")
      .select(`
        id,
        nome,
        progresso (
          feito
        )
      `);

    const alunosComProgresso = data.map(aluno => {

      const feitos = aluno.progresso.filter(p => p.feito).length;
      const total = aluno.progresso.length;

      return {
        ...aluno,
        feitos,
        total
      };

    });

    setAlunos(alunosComProgresso || []);
  }

  async function criarAluno() {

    if (!nome) return;

    const { data: novoAluno } = await supabase
      .from("alunos")
      .insert([{ nome }])
      .select()
      .single();

    const { data: combos } = await supabase
      .from("combos")
      .select("*");

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

  return (
    <div>

      <h2>Alunos</h2>

      <input
        placeholder="Nome do aluno"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={{ padding: 10, width: "70%" }}
      />

      <button
        onClick={criarAluno}
        style={{ padding: 10, marginLeft: 10 }}
      >
        Adicionar
      </button>

      <hr />

      {alunos.map(aluno => {

        const porcentagem = Math.round(
          (aluno.feitos / aluno.total) * 100
        );

        return (

          <div
            key={aluno.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 12
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