import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function MapaTecnico() {

  const [alunos, setAlunos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [progresso, setProgresso] = useState([]);

  async function carregarDados() {

    const { data: alunosData } = await supabase
      .from("alunos")
      .select("*")
      .order("nome");

    const { data: combosData } = await supabase
      .from("combos")
      .select("*")
      .order("id");

    const { data: progressoData } = await supabase
      .from("progresso")
      .select("*");

    setAlunos(alunosData || []);
    setCombos(combosData || []);
    setProgresso(progressoData || []);

  }

  function fezCombo(alunoId, comboId) {

    const registro = progresso.find(
      p => p.aluno_id === alunoId && p.combo_id === comboId
    );

    return registro?.feito;
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (

    <div style={{ marginTop: 40 }}>

      <h2 style={{ marginBottom: 16 }}>
        🧠 Mapa Técnico da Turma
      </h2>

      <div style={{ overflowX: "auto" }}>

        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            background: "white"
          }}
        >

          <thead>
            <tr>

              <th style={{ padding: 10, borderBottom: "1px solid #ddd", color:"black"}}>
                Aluno
              </th>

              {combos.map(combo => (
                <th
                  key={combo.id}
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #ddd",
                    fontSize: 14,
                    color: "black"
                  }}
                >
                  {combo.nome}
                </th>
              ))}

            </tr>
          </thead>

          <tbody>

            {alunos.map(aluno => (

              <tr key={aluno.id}>

                <td
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #eee",
                    fontWeight: "bold",
                    color: "black"
                  }}
                >
                  {aluno.nome}
                </td>

                {combos.map(combo => {

                  const feito = fezCombo(aluno.id, combo.id);

                  return (

                    <td
                      key={combo.id}
                      style={{
                        textAlign: "center",
                        padding: 10,
                        borderBottom: "1px solid #eee",
                        color: "black"
                      }}
                    >

                      <div
                        style={{
                          width: 18,
                          height: 18,
                          margin: "auto",
                          borderRadius: 4,
                          background: feito ? "#2196f3" : "#ff5fa2",
                          color: "black"
                        }}
                      />

                    </td>

                  );

                })}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}