import React, { useState } from "react";
import { Link } from "react-router-dom";
import { NexoSymbol } from "./NexoSymbol";
import { SEO } from "./SEO";
import { toast } from "sonner";
import axios from "axios";
import { CheckCircle, ArrowLeft } from "lucide-react";

const CATEGORIES = [
  "Construção e Reformas",
  "Design e Tecnologia",
  "Beleza e Bem-Estar",
  "Educação",
  "Serviços Domésticos",
  "Outros"
];

export default function FreelancerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    professional_name: "",
    category: "",
    service_description: "",
    city_neighborhood: "",
    remote: "Não",
    whatsapp: "",
    instagram: "",
    portfolio_link: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.professional_name || !form.category || !form.service_description || !form.city_neighborhood || !form.whatsapp) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setSubmitting(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      await axios.post(`${backendUrl}/api/freelancer-registration`, form);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#191919] text-[#E0DCD1] flex flex-col items-center justify-center px-6 text-center">
        <SEO title="Cadastro Enviado — NexoMoc" description="Cadastro de prestador recebido." />
        <CheckCircle className="w-16 h-16 text-[#465242] mb-6" />
        <h1 className="text-3xl font-light uppercase tracking-widest mb-4">Cadastro Recebido</h1>
        <p className="text-[#E0DCD1]/70 max-w-md mb-8">
          Recebemos suas informações. Em breve entraremos em contato via WhatsApp para confirmar seu cadastro e publicar seu perfil no Instagram.
        </p>
        <Link to="/" className="px-8 py-3 border border-[#465242] text-[#E0DCD1] text-xs uppercase tracking-widest font-bold hover:bg-[#465242] transition-all">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191919] text-[#E0DCD1]">
      <SEO title="Cadastre seu Serviço — NexoMoc" description="Divulgue seu serviço gratuitamente no NexoMoc." />

      <header className="border-b border-[#465242] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <NexoSymbol size={28} color="#E0DCD1" />
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#E0DCD1]">NexoMoc</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-xs text-[#E0DCD1]/60 hover:text-[#E0DCD1] transition-all uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#465242] mb-3 font-bold">Para Prestadores</p>
          <h1 className="text-3xl font-light uppercase tracking-tight text-[#E0DCD1] mb-4">Divulgue seu serviço</h1>
          <p className="text-[#E0DCD1]/60 font-light">Preencha o formulário abaixo. Após a análise, criaremos seu perfil e publicaremos no Instagram gratuitamente.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Nome completo *</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Seu nome completo"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Nome profissional / Como quer ser chamado *</label>
            <input name="professional_name" value={form.professional_name} onChange={handleChange} placeholder="Ex: Thiago Eletricista, Studio Bella, Carlos Dev"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Especialidade / Categoria *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all appearance-none">
              <option value="">Selecione uma categoria</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Descrição do serviço * <span className="normal-case">(até 3 linhas)</span></label>
            <textarea name="service_description" value={form.service_description} onChange={handleChange} rows={3}
              placeholder="Descreva o que você faz, sua experiência e diferenciais"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all resize-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Cidade / Bairro de atuação *</label>
            <input name="city_neighborhood" value={form.city_neighborhood} onChange={handleChange} placeholder="Ex: Montes Claros — Ibituruna, Major Prates"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Atende de forma remota? *</label>
            <div className="flex gap-4">
              {["Sim", "Não", "Ambos"].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="remote" value={opt} checked={form.remote === opt} onChange={handleChange}
                    className="accent-[#465242]" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">WhatsApp para contato *</label>
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="(38) 99999-9999"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Instagram <span className="normal-case text-[#E0DCD1]/40">(opcional)</span></label>
            <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@seuperfil"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Link de portfólio ou trabalhos anteriores <span className="normal-case text-[#E0DCD1]/40">(opcional)</span></label>
            <input name="portfolio_link" value={form.portfolio_link} onChange={handleChange} placeholder="https://..."
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all" />
          </div>

          <button type="submit" disabled={submitting}
            className="mt-4 px-8 py-4 bg-[#E0DCD1] text-[#191919] text-xs uppercase tracking-widest font-bold border border-[#E0DCD1] hover:bg-transparent hover:text-[#E0DCD1] transition-all disabled:opacity-50">
            {submitting ? "Enviando..." : "Enviar cadastro"}
          </button>

        </form>
      </main>
    </div>
  );
}
