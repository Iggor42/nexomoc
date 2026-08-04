import React, { useState } from "react";
import { Link } from "react-router-dom";
import { NexoSymbol } from "./NexoSymbol";
import { SEO } from "./SEO";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, CheckCircle, Send } from "lucide-react";

const SERVICE_TYPES = [
  "Design e identidade visual",
  "Social media e marketing",
  "Fotografia e audiovisual",
  "Tecnologia e desenvolvimento",
  "Eventos e produção",
  "Construção e reformas",
  "Manutenção e serviços técnicos",
  "Serviços administrativos",
  "Alimentação e fornecimento",
  "Transporte e logística",
  "Consultoria e serviços profissionais",
  "Outro",
];

const OPPORTUNITY_TYPES = [
  "Freela ou projeto pontual",
  "Contratação de profissional",
  "Serviço recorrente",
  "Fornecimento de produto ou serviço",
  "Parceria profissional",
  "Ainda não sei — preciso conversar",
];

const DEADLINES = [
  "O quanto antes",
  "Nos próximos 7 dias",
  "Nas próximas semanas",
  "Nos próximos meses",
  "Ainda estou planejando",
];

const BUDGETS = [
  "Até R$ 500",
  "De R$ 500 a R$ 1.500",
  "De R$ 1.500 a R$ 3.000",
  "Acima de R$ 3.000",
  "Ainda não defini",
  "Prefiro conversar antes",
];

const initialForm = {
  name: "",
  company: "",
  service_type: "",
  demand_description: "",
  opportunity_type: "",
  deadline: "",
  city_region: "Montes Claros",
  budget: "",
  work_format: "Presencial",
  whatsapp: "",
  allow_contact: false,
};

export default function ClientForm() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.company || !form.name || !form.service_type || !form.demand_description || !form.opportunity_type || !form.deadline || !form.city_region || !form.whatsapp) {
      toast.error("Preencha os campos obrigatórios para enviar sua demanda.");
      return;
    }

    if (!form.allow_contact) {
      toast.error("Autorize o contato do NexoMoc para enviar sua demanda.");
      return;
    }

    setSubmitting(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      await axios.post(`${backendUrl}/api/client-demand`, {
        ...form,
        allow_publish: "Não",
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#191919] text-[#E0DCD1] flex flex-col items-center justify-center px-6 text-center">
        <SEO title="Demanda Recebida — NexoMoc" description="Sua demanda foi recebida pelo NexoMoc." />
        <CheckCircle className="w-16 h-16 text-[#465242] mb-6" strokeWidth={1.5} />
        <p className="text-xs uppercase tracking-[0.3em] text-[#465242] mb-4 font-bold">NexoMoc · Solução local</p>
        <h1 className="text-3xl md:text-4xl font-light uppercase tracking-tight mb-4">Demanda recebida.</h1>
        <p className="text-[#E0DCD1]/70 max-w-md leading-relaxed mb-8">
          Vamos analisar as informações e buscar conexões possíveis para o que sua empresa precisa. Em breve, entraremos em contato pelo canal informado.
        </p>
        <Link to="/" className="px-8 py-3 border border-[#465242] text-[#E0DCD1] text-xs uppercase tracking-widest font-bold hover:bg-[#465242] transition-all">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191919] text-[#E0DCD1]">
      <SEO
        title="Encontre quem resolve sua demanda — NexoMoc"
        description="Descreva o que sua empresa precisa. O NexoMoc busca quem faz em Montes Claros."
      />

      <header className="border-b border-[#465242]/70 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <NexoSymbol size={28} color="#E0DCD1" />
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#E0DCD1]">NexoMoc</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-xs text-[#E0DCD1]/60 hover:text-[#E0DCD1] transition-all uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-10 md:mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#465242] mb-3 font-bold">Para empresas e contratantes</p>
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-tight text-[#E0DCD1] mb-5">
            Encontre quem resolve sua demanda
          </h1>
          <p className="text-[#E0DCD1]/65 font-light leading-relaxed">
            Sua empresa precisa contratar, produzir ou resolver alguma coisa? Conte o que está procurando. O NexoMoc analisa a demanda e busca profissionais ou negócios locais que possam atender.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
          <Field label="Nome da empresa" required>
            <input name="company" value={form.company} onChange={handleChange} placeholder="Nome da empresa" className="form-input" />
          </Field>

          <Field label="Nome da pessoa responsável" required>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Com quem podemos falar?" className="form-input" />
          </Field>

          <Field label="WhatsApp ou e-mail para contato" hint="Informe um contato que você acompanha com frequência." required>
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="(38) 99999-9999 ou contato@empresa.com" className="form-input" />
          </Field>

          <Field label="O que sua empresa está procurando?" required>
            <select name="service_type" value={form.service_type} onChange={handleChange} className="form-input form-select">
              <option value="">Selecione uma categoria</option>
              {SERVICE_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <Field label="Descreva o que você precisa" hint="Quanto mais informações você fornecer, mais fácil será encontrar quem pode atender." required>
            <textarea name="demand_description" value={form.demand_description} onChange={handleChange} rows={5} placeholder="Conte o que precisa, onde será realizado e quais são os principais detalhes." className="form-input resize-none" />
          </Field>

          <Field label="Que tipo de oportunidade é essa?" required>
            <select name="opportunity_type" value={form.opportunity_type} onChange={handleChange} className="form-input form-select">
              <option value="">Selecione uma opção</option>
              {OPPORTUNITY_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <div className="grid md:grid-cols-2 gap-7">
            <Field label="Quando você precisa?" required>
              <select name="deadline" value={form.deadline} onChange={handleChange} className="form-input form-select">
                <option value="">Selecione o prazo</option>
                {DEADLINES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="Cidade ou região" required>
              <input name="city_region" value={form.city_region} onChange={handleChange} placeholder="Montes Claros, bairro ou região" className="form-input" />
            </Field>
          </div>

          <Field label="Faixa de investimento" hint="Opcional — você pode conversar sobre isso depois.">
            <select name="budget" value={form.budget} onChange={handleChange} className="form-input form-select">
              <option value="">Prefiro não informar agora</option>
              {BUDGETS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <Field label="Formato do trabalho" required>
            <div className="grid grid-cols-3 gap-2">
              {["Presencial", "Remoto", "Ambos"].map((option) => (
                <label key={option} className={`choice-card ${form.work_format === option ? "choice-card-active" : ""}`}>
                  <input type="radio" name="work_format" value={option} checked={form.work_format === option} onChange={handleChange} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </Field>

          <label className="flex items-start gap-3 mt-1 cursor-pointer text-sm text-[#E0DCD1]/70 leading-relaxed">
            <input type="checkbox" name="allow_contact" checked={form.allow_contact} onChange={handleChange} className="mt-1 accent-[#465242]" />
            <span>Autorizo o NexoMoc a entrar em contato comigo sobre esta demanda e a buscar profissionais ou negócios que possam atendê-la. *</span>
          </label>

          <button type="submit" disabled={submitting} className="mt-2 flex items-center justify-center gap-3 px-8 py-4 bg-[#E0DCD1] text-[#191919] text-xs uppercase tracking-widest font-bold border border-[#E0DCD1] hover:bg-transparent hover:text-[#E0DCD1] transition-all disabled:opacity-50">
            <Send className="w-4 h-4" />
            {submitting ? "Enviando..." : "Enviar demanda"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-wider text-[#E0DCD1]/70">
        {label} {required && <span className="text-[#465242]">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#E0DCD1]/40 leading-relaxed">{hint}</p>}
    </div>
  );
}
