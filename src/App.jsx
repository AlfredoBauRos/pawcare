```jsx
import { useState, useEffect } from "react";
import { supabase, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } from "./supabase.js";

const COLORS = {
  cream: "#FDF6EC", warm: "#F5E6D0", amber: "#E8A44A", amberDark: "#C8872A",
  sage: "#7BAE8A", sageDark: "#5A8A6A", clay: "#C4755A", charcoal: "#2C2416",
  muted: "#8A7A6A", white: "#FFFFFF", cardBg: "#FFFBF5", border: "#EAD9C4",
};

const SERVICES = [
  { id: "walk", icon: "🦮", label: "Paseo", desc: "Paseos diarios", price: 15 },
  { id: "sit", icon: "🏠", label: "Guardería", desc: "En casa del cuidador", price: 25 },
  { id: "board", icon: "🛏️", label: "Hospedaje", desc: "Noche completa", price: 35 },
  { id: "groom", icon: "✂️", label: "Grooming", desc: "Baño y peluquería", price: 40 },
  { id: "vet", icon: "💉", label: "Vet acompañamiento", desc: "Visitas al veterinario", price: 20 },
  { id: "train", icon: "🎓", label: "Adiestramiento", desc: "Entrenamiento básico", price: 50 },
];

const CARETAKERS = [
  { id:"d1", full_name:"María González", city:"Madrid", avatar:"🧑‍🦰", rating:4.9, reviews:127, price:18, services:["walk","sit","groom"], bio:"Veterinaria con 8 años de experiencia.", verified:true, pro:true, completed:340, response:"< 1 hora", availability:"Disponible hoy", badge:"Top Cuidador" },
  { id:"d2", full_name:"Carlos Martínez", city:"Barcelona", avatar:"👨‍🦱", rating:4.8, reviews:89, price:15, services:["walk","board","train"], bio:"Entrenador canino certificado.", verified:true, pro:false, completed:210, response:"< 2 horas", availability:"Disponible mañana", badge:null },
  { id:"d3", full_name:"Ana López", city:"Valencia", avatar:"👩", rating:5.0, reviews:203, price:22, services:["sit","groom","vet"], bio:"5 años en clínica veterinaria.", verified:true, pro:true, completed:580, response:"< 30 min", availability:"Disponible hoy", badge:"Top Cuidador" },
  { id:"d4", full_name:"Luis Fernández", city:"Sevilla", avatar:"👨‍🦳", rating:4.7, reviews:54, price:12, services:["walk","board"], bio:"Jubilado amante de los animales.", verified:true, pro:false, completed:110, response:"< 3 horas", availability:"Disponible hoy", badge:null },
];

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:#FDF6EC;color:#2C2416;overflow-x:hidden}
    h1,h2,h3,h4{font-family:'Playfair Display',serif}
    button{cursor:pointer;border:none;outline:none}
    input,textarea,select{outline:none;font-family:'DM Sans',sans-serif}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .5s ease both}
    .float{animation:float 3s ease-in-out infinite}
    .card-hover{transition:transform .2s,box-shadow .2s}
    .card-hover:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(44,36,22,.12)!important}
    .btn-primary{background:linear-gradient(135deg,#E8A44A,#C8872A);color:white;border-radius:12px;font-family:'DM Sans',sans-serif;font-weight:600;transition:all .2s;box-shadow:0 4px 16px rgba(232,164,74,.4)}
    .btn-primary:hover{transform:translateY(-2px)}
    .btn-secondary{background:white;color:#2C2416;border:2px solid #EAD9C4;border-radius:12px;font-family:'DM Sans',sans-serif;font-weight:500;transition:all .2s}
    .btn-secondary:hover{border-color:#E8A44A;color:#E8A44A}
    .input-field{background:white;border:2px solid #EAD9C4;border-radius:12px;padding:12px 16px;font-size:15px;color:#2C2416;transition:border-color .2s;width:100%}
    .input-field:focus{border-color:#E8A44A}
    .modal-overlay{position:fixed;inset:0;background:rgba(44,36,22,.5);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
    .badge-pro{background:linear-gradient(135deg,#E8A44A,#C4755A);color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px}
    .toast{position:fixed;bottom:24px;right:24px;background:#2C2416;color:white;padding:14px 20px;border-radius:14px;z-index:9999;font-size:14px;font-weight:500;box-shadow:0 8px 32px rgba(44,36,22,.3)}
  `}</style>
);

const Spinner = () => (
  <div style={{width:20,height:20,border:"3px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}} />
);

const Avatar = ({ emoji, size=48 }) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:"#F5E6D0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.45,flexShrink:0}}>{emoji}</div>
);

const Toast = ({ msg, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className="toast">✅ {msg}</div>;
};

const Navbar = ({ page, setPage, user, profile, onSignOut, setModal }) => (
  <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(253,246,236,.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid #EAD9C4",padding:"0 24px"}}>
    <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
      <div onClick={() => setPage("home")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,background:"linear-gradient(135deg,#E8A44A,#C4755A)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🐾</div>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700}}>PawCare</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:28}}>
        {["cuidadores","precios"].map(p => (
          <span key={p} onClick={() => setPage(p)} style={{fontSize:14,fontWeight:500,color:page===p?"#E8A44A":"#8A7A6A",cursor:"pointer",textTransform:"capitalize"}}>{p}</span>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {user ? (
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span onClick={() => setPage("dashboard")} style={{fontSize:14,fontWeight:500,cursor:"pointer",color:"#E8A44A"}}>
              {profile?.role === "carer" ? "🧑‍⚕️" : "🏠"} {user.email?.split("@")[0]}
            </span>
            <button className="btn-secondary" style={{padding:"6px 14px",fontSize:13}} onClick={onSignOut}>Salir</button>
          </div>
        ) : (
          <>
            <button className="btn-secondary" style={{padding:"8px 18px",fontSize:14}} onClick={() => setModal("login")}>Entrar</button>
            <button className="btn-primary" style={{padding:"8px 18px",fontSize:14}} onClick={() => setModal("register")}>Registrarse</button>
          </>
        )}
      </div>
    </div>
  </nav>
);

const AuthModal = ({ type, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState({ email:"", password:"", name:"", role:"owner" });
  const [error, setError] = useState("");
  const [mode, setMode] = useState(type);

  const handleGoogle = async () => { setGoogleLoading(true); await signInWithGoogle(); };

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    if (mode === "login") {
      const { data, error } = await signInWithEmail(form.email, form.password);
      if (error) { setError("Email o contraseña incorrectos"); setLoading(false); return; }
      onSuccess(data.user);
    } else {
      if (!form.name) { setError("Ingresa tu nombre"); setLoading(false); return; }
      const { data, error } = await signUpWithEmail(form.email, form.password, { full_name: form.name, role: form.role });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data.user) onSuccess(data.user, form.role);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div style={{background:"white",borderRadius:24,padding:36,maxWidth:420,width:"90%",boxShadow:"0 24px 80px rgba(44,36,22,.2)"}} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{float:"right",background:"none",fontSize:20,color:"#8A7A6A"}}>✕</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>🐾</div>
          <h2 style={{fontSize:26}}>{mode === "login" ? "Bienvenido de nuevo" : "Únete a PawCare"}</h2>
        </div>

        {mode === "register" && (
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[["owner","🏠 Soy dueño"],["carer","🧑‍⚕️ Soy cuidador"]].map(([v,l]) => (
              <button key={v} onClick={() => setForm(f=>({...f,role:v}))}
                style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,border:`2px solid ${form.role===v?"#E8A44A":"#EAD9C4"}`,background:form.role===v?"#FEF3E2":"white",color:form.role===v?"#C8872A":"#8A7A6A"}}>
                {l}
              </button>
            ))}
          </div>
        )}

        <button onClick={handleGoogle} disabled={googleLoading} style={{width:"100%",padding:"12px",borderRadius:12,border:"2px solid #EAD9C4",background:"white",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontSize:15,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",marginBottom:16}}>
          {googleLoading ? <Spinner /> : <><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continuar con Google</>}
        </button>

        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{flex:1,height:1,background:"#EAD9C4"}} /><span style={{fontSize:13,color:"#8A7A6A"}}>o con email</span><div style={{flex:1,height:1,background:"#EAD9C4"}} />
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {mode !== "login" && <input className="input-field" placeholder="Nombre completo" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />}
          <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
          <input className="input-field" placeholder="Contraseña" type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} onKeyDown={e => e.key==="Enter" && handleSubmit()} />
        </div>

        {error && <div style={{padding:"10px 14px",background:"#FEE2E2",borderRadius:10,color:"#B91C1C",fontSize:13,marginBottom:12}}>⚠️ {error}</div>}

        <button className="btn-primary" style={{width:"100%",padding:"14px",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner /> : (mode === "login" ? "Entrar" : "Crear cuenta gratis")}
        </button>

        <p style={{textAlign:"center",marginTop:14,fontSize:14,color:"#8A7A6A"}}>
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <span onClick={() => setMode(mode==="login"?"register":"login")} style={{color:"#E8A44A",cursor:"pointer",fontWeight:600}}>
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </span>
        </p>
      </div>
    </div>
  );
};

const CaretakerCard = ({ c, onSelect }) => (
  <div className="card-hover" style={{background:"#FFFBF5",borderRadius:20,padding:24,border:"1px solid #EAD9C4",boxShadow:"0 4px 20px rgba(44,36,22,.06)",cursor:"pointer"}} onClick={() => onSelect(c)}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <div style={{position:"relative"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"#F5E6D0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{c.avatar}</div>
          {c.verified && <div style={{position:"absolute",bottom:-2,right:-2,background:"#7BAE8A",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"white"}}>✓</div>}
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:16,marginBottom:2}}>{c.full_name}</div>
          <div style={{fontSize:13,color:"#8A7A6A"}}>📍 {c.city}</div>
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:18,fontWeight:700,color:"#E8A44A"}}>{c.price}€</div>
        <div style={{fontSize:11,color:"#8A7A6A"}}>/hora</div>
      </div>
    </div>
    <p style={{fontSize:13,color:"#8A7A6A",lineHeight:1.6,marginBottom:14}}>{c.bio}</p>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
      {c.services.slice(0,3).map(sid => {
        const s = SERVICES.find(x=>x.id===sid);
        return s ? <span key={sid} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:500,background:"#F5E6D0",color:"#8A7A6A"}}>{s.icon} {s.label}</span> : null;
      })}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:14,borderTop:"1px solid #EAD9C4"}}>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <span style={{color:"#E8A44A"}}>⭐</span>
        <span style={{fontWeight:700,fontSize:14}}>{c.rating}</span>
        <span style={{color:"#8A7A6A",fontSize:13}}>({c.reviews})</span>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {c.badge && <span className="badge-pro">{c.badge}</span>}
        <div style={{width:8,height:8,borderRadius:"50%",background:c.availability.includes("hoy")?"#7BAE8A":"#E8A44A"}} />
        <span style={{fontSize:12,color:"#8A7A6A"}}>{c.availability}</span>
      </div>
    </div>
  </div>
);

const OwnerDashboard = ({ user, setPage }) => (
  <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px"}}>
    <h1 style={{fontSize:32,marginBottom:8}}>Hola, {user.email?.split("@")[0]} 🐾</h1>
    <p style={{color:"#8A7A6A",marginBottom:32}}>Panel de dueño de mascota</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:32}}>
      {[["🐾","Mis mascotas","0 registradas"],["📅","Reservas","0 activas"],["❤️","Favoritos","0 cuidadores"]].map(([i,t,s])=>(
        <div key={t} style={{background:"white",borderRadius:16,padding:20,border:"1px solid #EAD9C4"}}>
          <div style={{fontSize:28,marginBottom:8}}>{i}</div>
          <div style={{fontWeight:700,fontSize:16}}>{t}</div>
          <div style={{fontSize:13,color:"#8A7A6A"}}>{s}</div>
        </div>
      ))}
    </div>
    <div style={{background:"white",borderRadius:20,padding:28,border:"1px solid #EAD9C4",textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:12}}>🔍</div>
      <h3 style={{fontSize:20,marginBottom:8}}>¡Encuentra tu cuidador ideal!</h3>
      <p style={{color:"#8A7A6A",marginBottom:20}}>Tenemos cuidadores verificados esperando por ti</p>
      <button className="btn-primary" style={{padding:"12px 28px",fontSize:15}} onClick={() => setPage("cuidadores")}>
        Buscar cuidadores →
      </button>
    </div>
  </div>
);

const CarerDashboard = ({ user, setPage }) => {
  const [form, setForm] = useState({ city:"", price:"", bio:"", services:[] });
  const [saved, setSaved] = useState(false);

  const toggleService = (id) => setForm(f => ({
    ...f,
    services: f.services.includes(id) ? f.services.filter(s=>s!==id) : [...f.services, id]
  }));

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px"}}>
      <h1 style={{fontSize:32,marginBottom:8}}>Hola, {user.email?.split("@")[0]} 🧑‍⚕️</h1>
      <p style={{color:"#8A7A6A",marginBottom:32}}>Panel de cuidador</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:32}}>
        {[["💰","Ganancias","€0 este mes"],["📅","Reservas","0 activas"],["⭐","Valoración","Sin reseñas"]].map(([i,t,s])=>(
          <div key={t} style={{background:"white",borderRadius:16,padding:20,border:"1px solid #EAD9C4"}}>
            <div style={{fontSize:28,marginBottom:8}}>{i}</div>
            <div style={{fontWeight:700,fontSize:16}}>{t}</div>
            <div style={{fontSize:13,color:"#8A7A6A"}}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{background:"white",borderRadius:20,padding:28,border:"1px solid #EAD9C4"}}>
        <h3 style={{fontSize:20,marginBottom:20}}>Completa tu perfil</h3>

        <div style={{display:"grid",gap:14,marginBottom:20}}>
          <div>
            <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:6}}>Ciudad</label>
            <input className="input-field" placeholder="Ej: Madrid, Barcelona..." value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} />
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:6}}>Precio por hora (€)</label>
            <input className="input-field" placeholder="Ej: 15" type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:6}}>Sobre ti</label>
            <textarea className="input-field" placeholder="Cuéntanos tu experiencia con mascotas..." value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} style={{resize:"none",height:100}} />
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:10}}>Servicios que ofreces</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {SERVICES.map(s => (
                <button key={s.id} onClick={() => toggleService(s.id)}
                  style={{padding:"8px 14px",borderRadius:20,border:`2px solid ${form.services.includes(s.id)?"#E8A44A":"#EAD9C4"}`,background:form.services.includes(s.id)?"#FEF3E2":"white",fontSize:13,cursor:"pointer",color:form.services.includes(s.id)?"#C8872A":"#8A7A6A",fontWeight:form.services.includes(s.id)?600:400}}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {saved ? (
          <div style={{padding:16,background:"#E8F5ED",borderRadius:12,textAlign:"center",color:"#5A8A6A",fontWeight:600}}>
            ✅ ¡Perfil guardado! Ya apareces en las búsquedas.
          </div>
        ) : (
          <button className="btn-primary" style={{width:"100%",padding:"14px",fontSize:15}} onClick={() => setSaved(true)}>
            Guardar perfil
          </button>
        )}
      </div>
    </div>
  );
};

const HomePage = ({ setPage, setModal }) => (
  <div>
    <section style={{minHeight:"88vh",display:"flex",alignItems:"center",padding:"60px 24px",background:"linear-gradient(135deg,#FDF6EC 0%,#F5E6D0 100%)"}}>
      <div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:16}} className="float">🐾</div>
        <h1 style={{fontSize:"clamp(36px,5vw,60px)",lineHeight:1.1,marginBottom:20}}>
          Tu mascota merece<br/><em style={{color:"#E8A44A"}}>el mejor cuidado</em>
        </h1>
        <p style={{fontSize:18,color:"#8A7A6A",lineHeight:1.7,marginBottom:36,maxWidth:500,margin:"0 auto 36px"}}>
          Conectamos dueños con cuidadores verificados. Paseos, guardería, hospedaje y más.
        </p>
        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-primary" style={{padding:"14px 32px",fontSize:16}} onClick={() => setPage("cuidadores")}>Buscar cuidador →</button>
          <button className="btn-secondary" style={{padding:"14px 24px",fontSize:16}} onClick={() => setModal("register")}>Ser cuidador</button>
        </div>
        <div style={{marginTop:40,display:"flex",gap:32,justifyContent:"center",flexWrap:"wrap"}}>
          {[["🛡️","Seguro incluido"],["✅","Cuidadores verificados"],["⭐","4.9 valoración media"]].map(([i,t])=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:6,fontSize:14,color:"#8A7A6A"}}><span>{i}</span><span>{t}</span></div>
          ))}
        </div>
      </div>
    </section>
    <section style={{padding:"72px 24px",background:"#F5E6D0"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(26px,3.5vw,38px)",textAlign:"center",marginBottom:40}}>Todos los servicios que necesitas</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14}}>
          {SERVICES.map((s,i) => (
            <div key={s.id} className="card-hover fade-up" style={{animationDelay:`${i*.07}s`,background:"white",borderRadius:16,padding:"22px 18px",textAlign:"center",border:"1px solid #EAD9C4",cursor:"pointer"}} onClick={() => setPage("cuidadores")}>
              <div className="float" style={{fontSize:34,marginBottom:10}}>{s.icon}</div>
              <div style={{fontWeight:700,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:12,color:"#8A7A6A",marginBottom:10}}>{s.desc}</div>
              <div style={{fontWeight:700,color:"#E8A44A"}}>Desde {s.price}€</div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <section style={{padding:"72px 24px",background:"linear-gradient(135deg,#2C2416,#3D2E1A)",color:"white",textAlign:"center"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(26px,3.5vw,40px)",color:"white",marginBottom:14}}>¿Eres cuidador de mascotas?</h2>
        <p style={{color:"rgba(255,255,255,.7)",fontSize:17,lineHeight:1.7,marginBottom:28}}>Únete y gana dinero haciendo lo que amas. Sin cuota de entrada.</p>
        <button className="btn-primary" style={{padding:"14px 32px",fontSize:16}} onClick={() => setModal("register")}>Registrarme como cuidador →</button>
      </div>
    </section>
  </div>
);

const CaretakersPage = ({ user, setModal, toast }) => {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState("");
  const [booked, setBooked] = useState(false);

  if (selected) return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 24px"}}>
      <button onClick={() => setSelected(null)} style={{background:"none",color:"#8A7A6A",fontSize:14,marginBottom:24,fontFamily:"'DM Sans',sans-serif"}}>← Volver</button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:28}}>
        <div style={{background:"white",borderRadius:20,padding:28,border:"1px solid #EAD9C4"}}>
          <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:16}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:"#F5E6D0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>{selected.avatar}</div>
            <div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <h2 style={{fontSize:24}}>{selected.full_name}</h2>
                {selected.pro && <span className="badge-pro">PRO</span>}
              </div>
              <div style={{color:"#8A7A6A",fontSize:14}}>📍 {selected.city} · ⭐ {selected.rating} · ✅ {selected.completed} servicios</div>
            </div>
          </div>
          <p style={{lineHeight:1.7,marginBottom:16}}>{selected.bio}</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {selected.services.map(sid => { const s = SERVICES.find(x=>x.id===sid); return s ? <span key={sid} style={{padding:"6px 12px",borderRadius:20,background:"#F5E6D0",fontSize:13}}>{s.icon} {s.label}</span> : null; })}
          </div>
        </div>
        <div style={{background:"white",borderRadius:20,padding:24,border:"1px solid #EAD9C4",position:"sticky",top:80,height:"fit-content"}}>
          {booked ? (
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>🎉</div>
              <h3 style={{fontSize:20,marginBottom:8}}>¡Solicitud enviada!</h3>
              <p style={{color:"#8A7A6A",fontSize:14}}>Confirmará en {selected.response}</p>
              <button className="btn-primary" style={{marginTop:16,padding:"12px",width:"100%"}} onClick={() => setBooked(false)}>Nueva reserva</button>
            </div>
          ) : (
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <h3 style={{fontSize:20}}>Reservar</h3>
                <div><span style={{fontSize:22,fontWeight:700,color:"#E8A44A"}}>{selected.price}€</span><span style={{fontSize:12,color:"#8A7A6A"}}>/h</span></div>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:6}}>Fecha</label>
                <input type="date" className="input-field" value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
              </div>
              <button className="btn-primary" style={{width:"100%",padding:"14px",fontSize:16}} onClick={() => { if(!user){setModal("login");return;} if(!date){toast("Selecciona una fecha");return;} setBooked(true); toast(`¡Solicitud enviada a ${selected.full_name}!`); }}>
                {user ? "Solicitar reserva" : "Entrar para reservar"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"40px 24px"}}>
      <h1 style={{fontSize:"clamp(28px,4vw,40px)",marginBottom:8}}>Encuentra tu cuidador</h1>
      <p style={{color:"#8A7A6A",marginBottom:24}}>{CARETAKERS.length} cuidadores disponibles</p>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        <button onClick={()=>setFilter("")} style={{padding:"8px 16px",borderRadius:20,border:`2px solid ${!filter?"#E8A44A":"#EAD9C4"}`,background:!filter?"#FEF3E2":"white",fontSize:13,cursor:"pointer",color:!filter?"#C8872A":"#8A7A6A",fontWeight:!filter?600:400}}>Todos</button>
        {SERVICES.map(s => (
          <button key={s.id} onClick={()=>setFilter(filter===s.id?"":s.id)} style={{padding:"8px 14px",borderRadius:20,border:`2px solid ${filter===s.id?"#E8A44A":"#EAD9C4"}`,background:filter===s.id?"#FEF3E2":"white",fontSize:13,cursor:"pointer",color:filter===s.id?"#C8872A":"#8A7A6A",fontWeight:filter===s.id?600:400}}>{s.icon} {s.label}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:18}}>
        {CARETAKERS.filter(c => !filter || c.services.includes(filter)).map(c => <CaretakerCard key={c.id} c={c} onSelect={setSelected} />)}
      </div>
    </div>
  );
};

const PricingPage = ({ setModal }) => (
  <div style={{maxWidth:1000,margin:"0 auto",padding:"60px 24px"}}>
    <div style={{textAlign:"center",marginBottom:52}}>
      <h1 style={{fontSize:"clamp(28px,4vw,44px)",marginBottom:10}}>Planes transparentes, <em style={{color:"#E8A44A"}}>sin sorpresas</em></h1>
      <p style={{color:"#8A7A6A",fontSize:17}}>Empieza gratis. Escala cuando lo necesites.</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:20}}>
      {[
        {name:"Básico",price:"Gratis",features:["Perfil de mascota","Buscar cuidadores","3 reservas/mes"],cta:"Empezar gratis",highlight:false},
        {name:"Premium",price:"€9.99/mes",features:["Reservas ilimitadas","Seguro incluido","Cuidadores PRO","Soporte 24/7"],cta:"14 días gratis",highlight:true},
        {name:"Cuidador PRO",price:"€19.99/mes",features:["Perfil destacado","Sin comisión","Agenda profesional","Badge verificado"],cta:"Ser cuidador PRO",highlight:false},
      ].map((p,i) => (
        <div key={p.name} style={{background:p.highlight?"linear-gradient(145deg,#2C2416,#3D2E1A)":"white",borderRadius:22,padding:30,border:p.highlight?"none":"1px solid #EAD9C4",boxShadow:p.highlight?"0 20px 60px rgba(44,36,22,.25)":"0 4px 20px rgba(44,36,22,.05)",transform:p.highlight?"scale(1.03)":"none",position:"relative"}}>
          {p.highlight && <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#E8A44A,#C4755A)",color:"white",padding:"4px 18px",borderRadius:20,fontSize:11,fontWeight:700}}>⭐ MÁS POPULAR</div>}
          <h3 style={{fontSize:22,color:p.highlight?"white":"#2C2416",marginBottom:8}}>{p.name}</h3>
          <div style={{fontSize:28,fontWeight:700,color:"#E8A44A",marginBottom:20}}>{p.price}</div>
          <ul style={{listStyle:"none",marginBottom:24,display:"flex",flexDirection:"column",gap:8}}>
            {p.features.map(f=><li key={f} style={{display:"flex",gap:8,fontSize:14,color:p.highlight?"rgba(255,255,255,.8)":"#2C2416"}}><span style={{color:p.highlight?"#E8A44A":"#7BAE8A"}}>✓</span>{f}</li>)}
          </ul>
          <button onClick={() => setModal("register")} style={{width:"100%",padding:"13px",borderRadius:12,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:p.highlight?"linear-gradient(135deg,#E8A44A,#C8872A)":"transparent",color:p.highlight?"white":"#2C2416",border:p.highlight?"none":"2px solid #EAD9C4"}}>{p.cta}</button>
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const toast = (msg) => setToastMsg(msg);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (u) => {
    const role = u.user_metadata?.role || "owner";
    setProfile({ role, full_name: u.user_metadata?.full_name || u.email });
  };

  useEffect(() => { window.scrollTo(0,0); }, [page]);

  const handleSignOut = async () => { await signOut(); setUser(null); setProfile(null); setPage("home"); };

  const handleSuccess = (u, role) => {
    setUser(u);
    setProfile({ role: role || u.user_metadata?.role || "owner" });
    setModal(null);
    toast("¡Bienvenido a PawCare! 🐾");
    if (role === "carer" || u.user_metadata?.role === "carer") setPage("dashboard");
  };

  if (authLoading) return (
    <div style={{minHeight:"100vh",background:"#FDF6EC",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <GlobalStyle />
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🐾</div>
        <p style={{color:"#8A7A6A"}}>Cargando PawCare...</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#FDF6EC"}}>
      <GlobalStyle />
      <Navbar page={page} setPage={setPage} user={user} profile={profile} onSignOut={handleSignOut} setModal={setModal} />
      <main>
        {page === "home" && <HomePage setPage={setPage} setModal={setModal} />}
        {page === "cuidadores" && <CaretakersPage user={user} setModal={setModal} toast={toast} />}
        {page === "precios" && <PricingPage setModal={setModal} />}
        {page === "dashboard" && user && (
          profile?.role === "carer"
            ? <CarerDashboard user={user} setPage={setPage} />
            : <OwnerDashboard user={user} setPage={setPage} />
        )}
        {page === "dashboard" && !user && (
          <div style={{textAlign:"center",padding:"100px 24px"}}>
            <div style={{fontSize:48,marginBottom:16}}>🔒</div>
            <p style={{marginBottom:16,color:"#8A7A6A"}}>Debes iniciar sesión</p>
            <button className="btn-primary" style={{padding:"12px 24px"}} onClick={() => setModal("login")}>Iniciar sesión</button>
          </div>
        )}
      </main>
      <footer style={{background:"#2C2416",color:"white",padding:"32px 24px",textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:8}}>🐾</div>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:18,marginBottom:8}}>PawCare</p>
        <p style={{fontSize:13,color:"rgba(255,255,255,.4)"}}>© 2026 PawCare. Todos los derechos reservados.</p>
      </footer>
      {(modal === "login" || modal === "register") && (
        <AuthModal type={modal} onClose={() => setModal(null)} onSuccess={handleSuccess} />
      )}
      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}
```

Guarda con **Ctrl+S**, cierra el Bloc de notas y dime. 🚀