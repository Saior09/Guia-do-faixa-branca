import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {

  const [stats, setStats] = useState({
    alunos: 0,
    combos: 0,
    media: 0
  });

  async function carregarStats() {

    const { data: alunos } = await supabase
      .from("alunos")
      .select("id");

    const { data: combos } = await supabase
      .from("combos")
      .select("id");

    const { data: progresso } = await supabase
      .from("progresso")
      .select("feito");

    const total = progresso.length;

    const feitos = progresso.filter(p => p.feito).length;

    const media = total === 0
      ? 0
      : Math.round((feitos / total) * 100);

    setStats({
      alunos: alunos.length,
      combos: combos.length,
      media
    });

  }

  useEffect(() => {
    carregarStats();
  }, []);

  return (

    <div
      style={{
        border: "1px solid #ddd",
        padding: 16,
        marginBottom: 20
      }}
    >

      <h2>Dashboard</h2>

      <div style={{ marginBottom: 10 }}>
        👥 Alunos: {stats.alunos}
      </div>

      <div style={{ marginBottom: 10 }}>
        🥋 Combos: {stats.combos}
      </div>

      <div style={{ marginBottom: 6 }}>
        📊 Progresso médio da turma
      </div>

      <div
        style={{
          height: 12,
          background: "#eee",
          borderRadius: 6,
          overflow: "hidden"
        }}
      >

        <div
          style={{
            width: `${stats.media}%`,
            height: "100%",
            background: "#2196f3"
          }}
        />

      </div>

      <div style={{ marginTop: 6 }}>
        {stats.media}%
      </div>

    </div>

  );
}