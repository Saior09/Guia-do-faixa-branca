import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Combos() {

  const [combos, setCombos] = useState([]);
  const [comboSelecionado, setComboSelecionado] = useState(null);

  async function carregarCombos() {

    const { data } = await supabase
      .from("combos")
      .select(`
        id,
        nome,
        descricao,
        progresso (
          feito
        )
      `)
      .order("id");

    if (!data) return;

    const combosComStats = data.map(combo => {

      const total = combo.progresso?.length || 0;

      const feitos = combo.progresso
        ?.filter(p => p.feito)
        .length || 0;

      const porcentagem = total === 0
        ? 0
        : Math.round((feitos / total) * 100);

      return {
        ...combo,
        porcentagem
      };

    });

    setCombos(combosComStats);
  }

  useEffect(() => {

    carregarCombos();

    const channel = supabase
      .channel("combos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progresso"
        },
        () => {
          carregarCombos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  if (comboSelecionado) {
    return (
      <ComboDetalhe
        combo={comboSelecionado}
        voltar={() => {
          setComboSelecionado(null);
          carregarCombos();
        }}
      />
    );
  }

  return (
    <div>

      <h2 style={{ marginBottom: 16 }}>
        🥋 Combos
      </h2>

      {combos.map(combo => (

        <div
          key={combo.id}
          onClick={() => setComboSelecionado(combo)}
          style={{
            padding: 16,
            borderRadius: 10,
            border: "1px solid #ddd",
            marginBottom: 12,
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            background: "white",
            color: "#222"
          }}
        >

          <div>

            <div style={{ fontWeight: "bold" }}>
              {combo.nome}
            </div>

            <div style={{ fontSize: 13, color: "#666" }}>
              {combo.porcentagem}% da turma concluiu
            </div>

          </div>

          <Pizza porcentagem={combo.porcentagem} />

        </div>

      ))}

    </div>
  );
}

function Pizza({ porcentagem }) {

  const [valorAnimado, setValorAnimado] = useState(0);

  useEffect(() => {

    setTimeout(() => {
      setValorAnimado(porcentagem);
    }, 50);

  }, [porcentagem]);

  const azul = valorAnimado;
  const rosa = 100 - valorAnimado;

  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: `conic-gradient(
          #2196f3 0% ${azul}%,
          #ff5fa2 ${azul}% 100%
        )`,
        boxShadow: "0 0 4px rgba(0,0,0,0.15)",
        transition: "all 0.6s ease"
      }}
    />
  );
}

function ComboDetalhe({ combo, voltar }) {

  const [alunos, setAlunos] = useState([]);

  async function carregarAlunos() {

    const { data } = await supabase
      .from("progresso")
      .select(`
        id,
        feito,
        alunos (
          nome
        )
      `)
      .eq("combo_id", combo.id);

    setAlunos(data || []);
  }

  async function toggleProgresso(id, valor) {

    await supabase
      .from("progresso")
      .update({ feito: valor })
      .eq("id", id);

    carregarAlunos();
  }

  useEffect(() => {

    carregarAlunos();

    const channel = supabase
      .channel("progresso-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progresso"
        },
        () => {
          carregarAlunos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [combo]);

  return (
    <div>

      <button
        onClick={voltar}
        style={{
          marginBottom: 16,
          padding: 10,
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
          background: "white",
          cursor: "pointer",
          color: "black"
        }}
      >
        ⬅ Voltar
      </button>

      <h3 style={{ marginBottom: 10 }}>
        {combo.nome}
      </h3>

      {combo.descricao && (
        <div
          style={{
            background: "#f5f5f5",
            padding: 14,
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
            lineHeight: 1.6,
            border: "1px solid #ddd",
            whiteSpace: "pre-line",
            color: "black"
          }}
        >
          {combo.descricao}
        </div>
      )}

      {alunos.map(item => (

        <div
          key={item.id}
          style={{
            padding: 14,
            borderBottom: "1px solid #eee",
            fontSize: 18
          }}
        >

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12
            }}
          >

            <input
              type="checkbox"
              checked={item.feito}
              onChange={(e) =>
                toggleProgresso(item.id, e.target.checked)
              }
              style={{
                transform: "scale(1.6)",
                cursor: "pointer"
              }}
            />

            {item.alunos?.nome}

          </label>

        </div>

      ))}

    </div>
  );
}