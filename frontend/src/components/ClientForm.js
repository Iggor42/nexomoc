import React, { useState } from "react";
import { Link } from "react-router-dom";
import { NexoSymbol } from "./NexoSymbol";
import { SEO } from "./SEO";
import { toast } from "sonner";
import axios from "axios";
import { CheckCircle, ArrowLeft } from "lucide-react";

const SERVICE_TYPES = [
  "Construção e Reformas",
  "Design e Tecnologia",
  "Beleza e Bem-Estar",
  "Educação",
  "Serviços Domésticos",
  "Outro"
];

export default function ClientForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    service_type: "",
    demand_description: "",
    deadline: "",
    work_format: "Presencial",
    whatsapp: "",
    allow_publish: "Sim",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.service_type || !form.demand_description || !form.whatsapp) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setSubmitting(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      await axios.post(`${backendUrl}/api/client-demand`, form);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar demanda. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#191919] text-[#E0DCD1] flex flex-col items-center justify-center px-6 text-center">
        <SEO title="Demanda Enviada — NexoMoc" description="Sua demanda foi recebida." />
        <CheckCircle className="w-16 h-16 text-[#465242] mb-6" />
        <h1 className="text-3xl font-light uppercase tracking-widest mb-4">Demanda Recebida</h1>
        <p className="text-[#E0DCD1]/70 max-w-md mb-8">
          Recebemos sua solicitação. Em breve entraremos em contato via WhatsApp com profissionais indicados para o seu serviço.
        </p>
        <Link to="/" className="px-8 py-3 border border-[#465242] text-[#E0DCD1] text-xs uppercase tracking-widest font-bold hover:bg-[#465242] transition-all">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191919] text-[#E0DCD1]">
      <SEO title="Preciso de um Serviço — NexoMoc" description="Registre sua demanda e encontre o profissional certo." />

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
          <p className="text-xs uppercase tracking-[0.3em] text-[#465242] mb-3 font-bold">Para Contratantes</p>
          <h1 className="text-3xl font-light uppercase tracking-tight text-[#E0DCD1] mb-4">Preciso de um serviço</h1>
          <p className="text-[#E0DCD1]/60 font-light">Descreva o que precisa. Vamos conectar você ao profissional certo em Montes Claros.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Nome *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Seu nome"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Empresa <span className="normal-case text-[#E0DCD1]/40">(opcional)</span></label>
            <input name="company" value={form.company} onChange={handleChange} placeholder="Nome da empresa, se aplicável"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Tipo de serviço que precisa *</label>
            <select name="service_type" value={form.service_type} onChange={handleChange}
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all appearance-none">
              <option value="">Selecione uma categoria</option>
              {SERVICE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Descrição da demanda *</label>
            <textarea name="demand_description" value={form.demand_description} onChange={handleChange} rows={4}
              placeholder="Descreva com detalhes o que você precisa, onde e como"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all resize-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Prazo desejado <span className="normal-case text-[#E0DCD1]/40">(opcional)</span></label>
            <input name="deadline" value={form.deadline} onChange={handleChange} placeholder="Ex: Esta semana, Em até 15 dias, Sem pressa"
              className="bg-[#1f1f1f] border border-[#465242] text-[#E0DCD1] px-4 py-3 text-sm focus:outline-none focus:border-[#E0DCD1] transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Formato de trabalho *</label>
            <div className="flex gap-4">
              {["Presencial", "Remoto", "Ambos"].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="work_format" value={opt} checked={form.work_format === opt} onChange={handleChange}
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
            <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/60">Podemos divulgar sua demanda no perfil? *</label>
            <div className="flex gap-4">
              {["Sim", "Não"].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="allow_publish" value={opt} checked={form.allow_publish === opt} onChange={handleChange}
                    className="accent-[#465242]" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="mt-4 px-8 py-4 bg-[#E0DCD1] text-[#191919] text-xs uppercase tracking-widest font-bold border border-[#E0DCD1] hover:bg-transparent hover:text-[#E0DCD1] transition-all disabled:opacity-50">
            {submitting ? "Enviando..." : "Enviar solicitação"}
          </button>

        </form>
      </main>
    </div>
  );
}
