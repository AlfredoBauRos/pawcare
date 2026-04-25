import { useState, useEffect } from "react";
import { supabase, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, getProfile } from "./supabase.js";

const COLORS = {
  cream: "#FDF6EC", warm: "#F5E6D0", amber: "#E8A44A", amberDark: "#C8872A",
  sage: "#7BAE8A", sageDark: "#5A8A6A", clay: "#C4755A", charcoal: "#2C2416",
  muted: "#8A7A6A", white: "#FFFFFF", cardBg: "#FFFBF5", border: "#EAD9C4",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🐾</div>
        <h1 style={{ fontFamily: "serif", fontSize: 48, color: COLORS.charcoal, marginBottom: 8 }}>PawCare</h1>
        <p style={{ color: COLORS.muted, fontSize: 18, marginBottom: 32 }}>La plataforma de cuidado de mascotas de confianza</p>
        {user ? (
          <div>
            <p style={{ color: COLORS.sage, marginBottom: 16 }}>✅ Hola, {user.email}</p>
            <button onClick={() => signOut()} style={{ padding: "12px 24px", background: COLORS.amber, color: "white", border: "none", borderRadius: 12, fontSize: 16, cursor: "pointer" }}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button onClick={() => signInWithGoogle()} style={{ padding: "12px 32px", background: COLORS.amber, color: "white", border: "none", borderRadius: 12, fontSize: 16, cursor: "pointer" }}>
            Entrar con Google
          </button>
        )}
      </div>
    </div>
  );
}