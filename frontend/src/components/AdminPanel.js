import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { NexoSymbol } from "./NexoSymbol";
import {
  CheckCircle, XCircle, Trash2, Pencil, Save, X, Eye, EyeOff, LogOut, User, Briefcase
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

// ── Tela de login ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.get(`${API}/api/admin/published?password=${encodeURIComponent(pwd)}`);
      onLogin(pwd);
    } catch {
      toast.error("Senha incorreta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <NexoSymbol size={48} />
        </div>
        <h1 className="text-[#E0DCD1] text-2xl font-light tracking-widest text-center uppercase mb-2">
          NEXOMOC
        </h1>
        <p className="text-[#465242] text-sm text-center tracking-wider mb-8">Painel Admin</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Senha de acesso"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-[#2e2e2e] text-[#E0DCD1] px-4 py-3 rounded-lg focus:outline-none focus:border-[#465242] pr-12"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-3.5 text-[#666]"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !pwd}
            className="w-full bg-[#465242] text-[#E0DCD1] py-3 rounded-lg font-medium tracking-wider uppercase hover:bg-[#3a4437] transition disabled:opacity-40"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Card de cadastro pendente ─────────────────────────────────────────────────
function PendingCard({ reg, password, onApproved, onRejected }) {
  const [loading, setLoading] = useState(null);

  const approve = async () => {
    setLoading("approve");
    try {
      await axios.get(`${API}/api/admin/approve/${reg.registration_id}`);
      toast.success(`${reg.professional_name} aprovado!`);
      onApproved(reg.registration_id);
    } catch {
      toast.error("Erro ao aprovar.");
    } finally {
      setLoading(null);
    }
  };

  const reject = async () => {
    setLoading("reject");
    try {
      await axios.post(`${API}/api/admin/reject/${reg.registration_id}?password=${encodeURIComponent(password)}`);
      toast.success("Cadastro rejeitado.");
      onRejected(reg.registration_id);
    } catch {
      toast.error("Erro ao rejeitar.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-[#1f1f1f] border border-[#2e2e2e] rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[#E0DCD1] font-medium">{reg.professional_name}</p>
          <p className="text-[#888] text-sm">{reg.full_name}</p>
        </div>
        <span className="text-xs bg-[#2a2a2a] text-[#888] px-2 py-1 rounded-full shrink-0">
          {reg.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-[#555]">Categoria</span><p className="text-[#E0DCD1]">{reg.category}</p></div>
        <div><span className="text-[#555]">Bairro</span><p className="text-[#E0DCD1]">{reg.city_neighborhood}</p></div>
        <div><span className="text-[#555]">WhatsApp</span><p className="text-[#E0DCD1]">{reg.whatsapp}</p></div>
        <div><span className="text-[#555]">Remoto</span><p className="text-[#E0DCD1]">{reg.remote}</p></div>
      </div>
      <p className="text-[#999] text-sm border-t border-[#2e2e2e] pt-3">{reg.service_description}</p>
      {reg.instagram && <p className="text-[#465242] text-sm">{reg.instagram}</p>}
      {reg.status === "pending" && (
        <div className="flex gap-3 pt-1">
          <button
            onClick={approve}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#465242] text-[#E0DCD1] py-2 rounded-lg hover:bg-[#3a4437] transition disabled:opacity-40 text-sm"
          >
            <CheckCircle size={16} />
            {loading === "approve" ? "Aprovando..." : "Aprovar"}
          </button>
          <button
            onClick={reject}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#2a1a1a] text-[#c87777] py-2 rounded-lg hover:bg-[#3a2020] transition disabled:opacity-40 text-sm"
          >
            <XCircle size={16} />
            {loading === "reject" ? "Rejeitando..." : "Rejeitar"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Card de prestador publicado ───────────────────────────────────────────────
function PublishedCard({ freelancer, password, onDeleted, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(null);
  const [form, setForm] = useState({
    name: freelancer.name || "",
    bio: freelancer.bio || "",
    phone: freelancer.phone || "",
    instagram: freelancer.instagram || "",
    city_neighborhood: freelancer.city_neighborhood || "",
    remote: freelancer.remote || "",
    picture: freelancer.picture || "",
  });

  const save = async () => {
    setLoading("save");
    try {
      await axios.patch(`${API}/api/admin/freelancer/${freelancer.user_id}`, {
        password,
        ...form,
      });
      toast.success("Atualizado!");
      onUpdated(freelancer.user_id, form);
      setEditing(false);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remover ${freelancer.name} do site?`)) return;
    setLoading("delete");
    try {
      await axios.delete(`${API}/api/admin/freelancer/${freelancer.user_id}?password=${encodeURIComponent(password)}`);
      toast.success("Prestador removido.");
      onDeleted(freelancer.user_id);
    } catch {
      toast.error("Erro ao remover.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-[#1f1f1f] border border-[#2e2e2e] rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        {(form.picture || freelancer.picture) ? (
          <img
            src={form.picture || freelancer.picture}
            alt={form.name}
            className="w-12 h-12 rounded-full object-cover border border-[#2e2e2e]"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
            <User size={20} className="text-[#555]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[#E0DCD1] font-medium truncate">{freelancer.name}</p>
          <p className="text-[#465242] text-sm truncate">{freelancer.categories?.join(", ")}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-lg bg-[#2a2a2a] text-[#E0DCD1] hover:bg-[#333] transition"
          >
            {editing ? <X size={16} /> : <Pencil size={16} />}
          </button>
          <button
            onClick={remove}
            disabled={loading === "delete"}
            className="p-2 rounded-lg bg-[#2a1a1a] text-[#c87777] hover:bg-[#3a2020] transition disabled:opacity-40"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3 border-t border-[#2e2e2e] pt-3">
          {[
            { label: "Nome profissional", key: "name" },
            { label: "WhatsApp", key: "phone" },
            { label: "Instagram", key: "instagram" },
            { label: "Cidade/Bairro", key: "city_neighborhood" },
            { label: "Atende remoto", key: "remote" },
            { label: "Foto (URL)", key: "picture" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-[#555] text-xs">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-[#191919] border border-[#2e2e2e] text-[#E0DCD1] px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#465242] mt-1"
              />
            </div>
          ))}
          <div>
            <label className="text-[#555] text-xs">Descrição / Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full bg-[#191919] border border-[#2e2e2e] text-[#E0DCD1] px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#465242] mt-1 resize-none"
            />
          </div>
          <button
            onClick={save}
            disabled={loading === "save"}
            className="w-full flex items-center justify-center gap-2 bg-[#465242] text-[#E0DCD1] py-2 rounded-lg hover:bg-[#3a4437] transition disabled:opacity-40 text-sm"
          >
            <Save size={16} />
            {loading === "save" ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      ) : (
        <p className="text-[#888] text-sm line-clamp-2">{freelancer.bio || "—"}</p>
      )}
    </div>
  );
}

// ── Painel principal ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [password, setPassword] = useState(null);
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [published, setPublished] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async (pwd) => {
    setLoading(true);
    try {
      const [regRes, pubRes] = await Promise.all([
        axios.get(`${API}/api/admin/registrations`),
        axios.get(`${API}/api/admin/published?password=${encodeURIComponent(pwd)}`),
      ]);
      setPending(regRes.data.filter((r) => r.status !== "approved"));
      setPublished(pubRes.data);
    } catch {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (pwd) => {
    setPassword(pwd);
    load(pwd);
  };

  if (!password) return <LoginScreen onLogin={handleLogin} />;

  const pendingCount = pending.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#191919] text-[#E0DCD1]">
      {/* Header */}
      <div className="border-b border-[#2e2e2e] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NexoSymbol size={28} />
          <div>
            <p className="text-[#E0DCD1] font-light tracking-widest text-sm uppercase">NEXOMOC</p>
            <p className="text-[#465242] text-xs tracking-wider">Painel Admin</p>
          </div>
        </div>
        <button
          onClick={() => setPassword(null)}
          className="flex items-center gap-1.5 text-[#666] hover:text-[#E0DCD1] text-sm transition"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2e2e2e]">
        <button
          onClick={() => setTab("pending")}
          className={`flex-1 py-3 text-sm tracking-wider flex items-center justify-center gap-2 transition ${
            tab === "pending"
              ? "text-[#E0DCD1] border-b-2 border-[#465242]"
              : "text-[#555] hover:text-[#888]"
          }`}
        >
          <Briefcase size={15} />
          Pendentes
          {pendingCount > 0 && (
            <span className="bg-[#465242] text-[#E0DCD1] text-xs px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("published")}
          className={`flex-1 py-3 text-sm tracking-wider flex items-center justify-center gap-2 transition ${
            tab === "published"
              ? "text-[#E0DCD1] border-b-2 border-[#465242]"
              : "text-[#555] hover:text-[#888]"
          }`}
        >
          <User size={15} />
          Publicados
          <span className="text-[#555] text-xs">({published.length})</span>
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center text-[#555] py-20">Carregando...</div>
        ) : tab === "pending" ? (
          pending.length === 0 ? (
            <div className="text-center text-[#555] py-20">Nenhum cadastro pendente.</div>
          ) : (
            <div className="space-y-4">
              {pending.map((reg) => (
                <PendingCard
                  key={reg.registration_id}
                  reg={reg}
                  password={password}
                  onApproved={(id) => setPending((p) => p.filter((r) => r.registration_id !== id))}
                  onRejected={(id) => setPending((p) => p.filter((r) => r.registration_id !== id))}
                />
              ))}
            </div>
          )
        ) : published.length === 0 ? (
          <div className="text-center text-[#555] py-20">Nenhum prestador publicado.</div>
        ) : (
          <div className="space-y-4">
            {published.map((f) => (
              <PublishedCard
                key={f.user_id}
                freelancer={f}
                password={password}
                onDeleted={(id) => setPublished((p) => p.filter((f) => f.user_id !== id))}
                onUpdated={(id, data) =>
                  setPublished((p) =>
                    p.map((f) => (f.user_id === id ? { ...f, ...data } : f))
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
