import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { NexoSymbol } from "./NexoSymbol";
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  User, 
  Search,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export default function VagasBoard() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = [
    "Todos",
    "Construção e Reformas",
    "Design e Tecnologia",
    "Beleza e Bem-Estar",
    "Educação",
    "Serviços Domésticos"
  ];

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${backendUrl}/api/demands`, {
        params: selectedCategory !== "Todos" ? { category: selectedCategory } : {}
      });
      setDemands(response.data);
    } catch (err) {
      console.error("Error loading demands", err);
      toast.error("Não foi possível carregar as vagas e demandas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, [selectedCategory]);

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (e) {
      return isoStr;
    }
  };

  const getWhatsappUrl = (phone, title) => {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Olá! Vi sua vaga para "${title}" cadastrada no NexoMoc e gostaria de me candidatar e enviar uma proposta.`
    )}`;
  };

  return (
    <div className="min-h-screen bg-[#191919] text-[#E0DCD1] pb-20">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#191919]/90 backdrop-blur-md border-b border-[#465242] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" data-testid="vagas-nav-logo-link" className="flex items-center gap-3">
            <NexoSymbol size={32} />
            <span className="font-light tracking-[0.25em] text-sm uppercase">NexoMoc</span>
          </Link>
          <Link 
            to="/" 
            data-testid="vagas-back-to-home-link"
            className="text-xs uppercase tracking-widest font-light hover:text-[#bebaa9] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à Home
          </Link>
        </div>
      </header>

      {/* CORE BOARD */}
      <main className="max-w-5xl mx-auto px-6 pt-12">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground block mb-2">Painel de Oportunidades</span>
          <h1 className="text-3xl font-light uppercase tracking-wide text-[#E0DCD1] mb-4">Vagas e Demandas em Montes Claros</h1>
          <p className="text-sm text-muted-foreground font-light max-w-xl mx-auto">
            Veja abaixo os pedidos de serviços cadastrados por clientes reais na cidade. Entre em contato direto via WhatsApp ou e-mail.
          </p>
        </div>

        {/* CATEGORY SELECTOR PILLS */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 bg-[#1f1f1f] border border-[#465242] p-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              data-testid={`vagas-category-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              className={`px-3.5 py-1.5 text-xs uppercase tracking-wider border transition-all ${
                selectedCategory === cat 
                ? "bg-[#E0DCD1] text-[#191919] border-[#E0DCD1] font-bold" 
                : "bg-transparent text-[#E0DCD1] border-[#465242] hover:border-[#E0DCD1] font-light"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* DEMANDS CONTAINER */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E0DCD1]"></div>
            <p className="text-sm font-light text-muted-foreground">Carregando oportunidades de trabalho...</p>
          </div>
        ) : demands.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#465242] p-8 space-y-4">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-white uppercase tracking-wide">Nenhuma vaga ativa no momento</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              Não há pedidos de serviço ativos para a categoria selecionada. Volte mais tarde ou anuncie uma nova demanda!
            </p>
            <Link 
              to="/"
              onClick={() => setTimeout(() => {
                document.getElementById("anunciar-vaga")?.scrollIntoView({ behavior: "smooth" });
              }, 100)}
              className="inline-block px-5 py-2 bg-[#E0DCD1] text-[#191919] font-bold text-xs uppercase tracking-widest"
            >
              Publicar uma Demanda
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {demands.map((demand) => (
              <div 
                key={demand.demand_id}
                data-testid={`demand-item-${demand.demand_id}`}
                className="bg-[#1f1f1f] border border-[#465242] p-6 md:p-8 space-y-6 hover:border-[#E0DCD1]/50 transition-all"
              >
                {/* Demand Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#465242]/30 pb-4">
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 bg-[#465242]/30 border border-[#465242] text-[#E0DCD1] text-[10px] uppercase tracking-wider">
                      {demand.category}
                    </span>
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">{demand.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-light">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {demand.client_name}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(demand.created_at)}</span>
                    </div>
                  </div>

                  <div className="bg-[#191919] border border-[#465242] px-4 py-2 text-left md:text-right shrink-0">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">Orçamento Estimado</span>
                    <span className="text-sm font-bold text-white tracking-wide">{demand.budget}</span>
                  </div>
                </div>

                {/* Demand Description */}
                <p className="text-sm font-light text-muted-foreground leading-relaxed whitespace-pre-line">
                  {demand.description}
                </p>

                {/* Demand Actions */}
                <div className="pt-4 border-t border-[#465242]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-green-400 font-light flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Vaga aberta para propostas
                  </span>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Direct WhatsApp Contact Button */}
                    <a 
                      href={getWhatsappUrl(demand.client_phone, demand.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`demand-whatsapp-btn-${demand.demand_id}`}
                      className="px-5 py-2.5 bg-[#465242] hover:bg-[#5d6d58] text-white text-xs uppercase tracking-widest font-bold border border-[#465242] hover:border-[#5d6d58] transition-all flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" /> Candidatar-se (WhatsApp)
                    </a>

                    {/* Email Contact Button */}
                    <a 
                      href={`mailto:${demand.client_email}?subject=Proposta NexoMoc: ${encodeURIComponent(demand.title)}`}
                      data-testid={`demand-email-btn-${demand.demand_id}`}
                      className="px-5 py-2.5 bg-transparent hover:bg-[#465242]/20 text-[#E0DCD1] text-xs uppercase tracking-widest font-bold border border-[#465242] hover:border-[#E0DCD1] transition-all flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" /> Enviar E-mail
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
