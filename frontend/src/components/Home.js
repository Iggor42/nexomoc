import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { NexoSymbol } from "./NexoSymbol";
import { SEO } from "./SEO";
import { toast } from "sonner";
import { 
  Search, 
  MapPin, 
  Users, 
  Sparkles, 
  Send, 
  Star, 
  Phone, 
  Mail, 
  ArrowRight,
  PlusCircle,
  Menu,
  X,
  FileText,
  Hammer,
  Laptop,
  Scissors,
  GraduationCap,
  Wrench
} from "lucide-react";

export default function Home() {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [freelancers, setFreelancers] = useState([]);
  const [loadingFreelancers, setLoadingFreelancers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  
  // Client Demand Form State
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [demandTitle, setDemandTitle] = useState("");
  const [demandCategory, setDemandCategory] = useState("Construção e Reformas");
  const [demandDescription, setDemandDescription] = useState("");
  const [demandBudget, setBudget] = useState("");
  const [submittingDemand, setSubmittingDemand] = useState(false);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Per-category professional counts (for featured categories)
  const [categoryCounts, setCategoryCounts] = useState({});

  const categories = [
    "Todos",
    "Construção e Reformas",
    "Design e Tecnologia",
    "Beleza e Bem-Estar",
    "Educação",
    "Serviços Domésticos"
  ];

  // Fetch freelancers
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoadingFreelancers(true);
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/freelancers`, {
          params: {
            category: selectedCategory,
            search: searchTerm
          }
        });
        setFreelancers(response.data);
      } catch (err) {
        console.error("Error loading freelancers", err);
        toast.error("Erro ao carregar profissionais. Tente novamente.");
      } finally {
        setLoadingFreelancers(false);
      }
    };

    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchFreelancers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchTerm]);

  // Fetch all freelancers once to compute per-category counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/freelancers`);
        const counts = {};
        response.data.forEach((f) => {
          (f.categories || []).forEach((c) => {
            counts[c] = (counts[c] || 0) + 1;
          });
        });
        setCategoryCounts(counts);
      } catch (err) {
        console.error("Error loading category counts", err);
      }
    };
    fetchCounts();
  }, []);

  // Handle Demand Submit
  const handleDemandSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !clientEmail || !demandTitle || !demandDescription) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSubmittingDemand(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      await axios.post(`${backendUrl}/api/demands`, {
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        title: demandTitle,
        category: demandCategory,
        description: demandDescription,
        budget: demandBudget || "A combinar"
      });

      toast.success("Demanda cadastrada com sucesso! Os profissionais de Montes Claros já podem ver seu pedido.");
      
      // Clear form
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setDemandTitle("");
      setDemandDescription("");
      setBudget("");
      
      // Navigate or scroll to demands board
      navigate("/vagas");
    } catch (err) {
      console.error("Error submitting demand", err);
      toast.error("Erro ao publicar demanda. Tente novamente.");
    } finally {
      setSubmittingDemand(false);
    }
  };

  const handleHeroFindContractorClick = () => {
    document.getElementById("freelancer-directory").scrollIntoView({ behavior: "smooth" });
  };

  const featuredCategories = [
    { name: "Construção e Reformas", icon: Hammer, desc: "Pedreiros, pintores, eletricistas e encanadores.", slug: "reformas-em-montes-claros" },
    { name: "Design e Tecnologia", icon: Laptop, desc: "Web designers, devs, social media e marketing.", slug: "designers-em-montes-claros" },
    { name: "Beleza e Bem-Estar", icon: Scissors, desc: "Manicures, cabeleireiros, maquiadores e estética.", slug: "beleza-montes-claros" },
    { name: "Educação", icon: GraduationCap, desc: "Professores particulares, reforço e cursos.", slug: null },
    { name: "Serviços Domésticos", icon: Wrench, desc: "Diaristas, montadores, jardineiros e mais.", slug: "servicos-domesticos-montes-claros" }
  ];

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    document.getElementById("freelancer-directory").scrollIntoView({ behavior: "smooth" });
  };

  const handleHeroProvideServiceClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      loginWithGoogle();
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-[#E0DCD1]">
      <SEO
        title="NexoMoc — Serviços e Profissionais em Montes Claros, MG"
        description="Marketplace local de Montes Claros. Encontre eletricistas, designers, manicures, professores e outros profissionais autônomos. Publique demandas grátis e feche direto por WhatsApp."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "NexoMoc",
          "url": "https://nexomoc.netlify.app/",
          "inLanguage": "pt-BR",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://nexomoc.netlify.app/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#191919]/90 backdrop-blur-md border-b border-[#465242] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" data-testid="navbar-logo-link" className="flex items-center gap-3">
            <NexoSymbol size={32} />
            <span className="font-light tracking-[0.25em] text-sm uppercase">NexoMoc</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm tracking-wider font-light">
            <a 
              href="#freelancer-directory" 
              data-testid="nav-link-encontrar"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("freelancer-directory").scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-[#bebaa9] transition-colors"
            >
              Encontrar Profissionais
            </a>
            <Link to="/vagas" data-testid="nav-link-vagas" className="hover:text-[#bebaa9] transition-colors">
              Painel de Vagas
            </Link>
            <a 
              href="#anunciar-vaga" 
              data-testid="nav-link-anunciar"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("anunciar-vaga").scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-[#bebaa9] transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Anunciar Vaga
            </a>
          </nav>

          {/* Auth Action */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link 
                to="/dashboard" 
                data-testid="navbar-dashboard-link"
                className="px-5 py-2 border border-[#465242] text-[#E0DCD1] text-xs uppercase tracking-wider font-bold hover:bg-[#465242] transition-all"
              >
                Painel do Prestador
              </Link>
            ) : (
              <button 
                onClick={loginWithGoogle}
                data-testid="navbar-login-btn"
                className="px-5 py-2 bg-[#E0DCD1] text-[#191919] text-xs uppercase tracking-wider font-bold border border-[#E0DCD1] hover:bg-transparent hover:text-[#E0DCD1] transition-all"
              >
                Entrar como Prestador
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-toggle"
            className="md:hidden text-[#E0DCD1] p-1 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#465242] flex flex-col gap-4 animate-fade-in text-sm font-light tracking-wider">
            <a 
              href="#freelancer-directory" 
              data-testid="mobile-nav-link-encontrar"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                document.getElementById("freelancer-directory").scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-[#bebaa9] py-2 border-b border-[#465242]/20"
            >
              Encontrar Profissionais
            </a>
            <Link 
              to="/vagas" 
              data-testid="mobile-nav-link-vagas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-[#bebaa9] py-2 border-b border-[#465242]/20"
            >
              Painel de Vagas
            </Link>
            <a 
              href="#anunciar-vaga" 
              data-testid="mobile-nav-link-anunciar"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                document.getElementById("anunciar-vaga").scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-[#bebaa9] py-2 border-b border-[#465242]/20 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Anunciar Vaga
            </a>

            <div className="pt-2">
              {user ? (
                <Link 
                  to="/dashboard" 
                  data-testid="mobile-navbar-dashboard-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center px-5 py-2.5 border border-[#465242] text-[#E0DCD1] text-xs uppercase tracking-wider font-bold hover:bg-[#465242] transition-all"
                >
                  Painel do Prestador
                </Link>
              ) : (
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    loginWithGoogle();
                  }}
                  data-testid="mobile-navbar-login-btn"
                  className="w-full text-center px-5 py-2.5 bg-[#E0DCD1] text-[#191919] text-xs uppercase tracking-wider font-bold border border-[#E0DCD1] hover:bg-transparent hover:text-[#E0DCD1] transition-all"
                >
                  Entrar como Prestador
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-20 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(25, 25, 25, 0.92), rgba(25, 25, 25, 0.95)), url("https://images.unsplash.com/photo-1650661926447-9efb2610f64c?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=80&w=1200")` }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <NexoSymbol size={24} />
            <span className="text-xs uppercase tracking-[0.3em] font-light">NexoMoc Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#E0DCD1] leading-tight uppercase mb-6 max-w-3xl">
            O seu marketplace de serviços em Montes Claros
          </h1>

          <p className="text-base sm:text-lg text-rgba(224, 220, 209, 0.75) font-light tracking-wide italic max-w-2xl mb-12">
            Conectando quem precisa de soluções rápidas aos melhores profissionais autônomos locais. Rápido e sem burocracia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <button 
              onClick={handleHeroFindContractorClick}
              data-testid="hero-primary-cta"
              className="px-8 py-4 bg-[#E0DCD1] text-[#191919] text-xs uppercase tracking-widest font-bold border border-[#E0DCD1] hover:bg-transparent hover:text-[#E0DCD1] transition-all"
            >
              Preciso contratar
            </button>
            <button 
              onClick={handleHeroProvideServiceClick}
              data-testid="hero-secondary-cta"
              className="px-8 py-4 border border-[#465242] text-[#E0DCD1] text-xs uppercase tracking-widest font-bold bg-[#191919]/50 hover:bg-[#465242] transition-all"
            >
              Quero divulgar meu serviço
            </button>
          </div>
        </div>

        {/* Linear divider element representing brand visual */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#465242]" aria-hidden="true" />
      </section>

      {/* METRICS SECTION */}
      <section className="bg-[#E0DCD1] text-[#191919] py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#191919]/60 mb-12 font-bold">
            O mercado que você vive — Montes Claros, MG
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#191919] mb-3">437.601</span>
              <span className="text-sm font-light text-[#191919]/70 max-w-[220px]">habitantes em Montes Claros</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#191919] mb-3">47.894</span>
              <span className="text-sm font-light text-[#191919]/70 max-w-[220px]">empresas ativas na cidade</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#191919] mb-3">58%</span>
              <span className="text-sm font-light text-[#191919]/70 max-w-[220px]">das empresas locais são de MEIs / autônomos</span>
            </div>
          </div>

          <p className="text-base sm:text-lg italic text-[#191919]/80 font-light max-w-2xl mx-auto border-t border-[#191919]/10 pt-8">
            A demanda por serviços existe. Os talentos locais estão aqui. O NexoMoc é a ponte direta de conexão.
          </p>
        </div>
      </section>

      {/* FEATURED CATEGORIES SECTION */}
      <section id="categorias-destaque" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground block mb-3">Explore por Área</span>
          <h2 className="text-3xl font-light uppercase tracking-wide text-[#E0DCD1] mb-6">
            Categorias em destaque
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-light max-w-2xl mx-auto">
            Encontre o profissional certo em um clique. Escolha a categoria e veja os talentos locais disponíveis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCategories.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.name] || 0;
            const cardInner = (
              <>
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-full border border-[#465242] flex items-center justify-center text-[#E0DCD1] group-hover:bg-[#465242] transition-colors">
                    <Icon className="w-5 h-5" />
                  </span>
                  {count >= 5 && (
                    <span
                      data-testid={`featured-category-count-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      className="text-[10px] uppercase tracking-widest text-[#191919] bg-[#E0DCD1] font-bold px-2.5 py-1"
                    >
                      {count} profissionais
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-[#E0DCD1] uppercase tracking-wider text-sm group-hover:text-white transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm font-light text-muted-foreground flex-1">{cat.desc}</p>
                <span className="text-xs uppercase tracking-widest text-[#bebaa9] flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Ver profissionais <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </>
            );

            const commonClass = "group text-left bg-[#1f1f1f] border border-[#465242] p-8 hover:border-[#E0DCD1] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4";
            const testId = `featured-category-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

            return cat.slug ? (
              <Link
                key={cat.name}
                to={`/${cat.slug}`}
                data-testid={testId}
                className={commonClass}
              >
                {cardInner}
              </Link>
            ) : (
              <button
                key={cat.name}
                onClick={() => handleCategorySelect(cat.name)}
                data-testid={testId}
                className={commonClass}
              >
                {cardInner}
              </button>
            );
          })}
        </div>
      </section>

      {/* POPULAR LOCAL SEARCHES — SEO internal linking */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-[#465242]">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground block mb-3">Buscas populares</span>
          <h2 className="text-2xl font-light uppercase tracking-wide text-[#E0DCD1]">
            Serviços mais procurados em Montes Claros
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          <Link to="/eletricistas-em-montes-claros" data-testid="popular-link-eletricistas" className="text-[11px] uppercase tracking-widest px-4 py-2 border border-[#465242] hover:border-[#E0DCD1] hover:text-white transition-all">Eletricistas</Link>
          <Link to="/reformas-em-montes-claros" data-testid="popular-link-reformas" className="text-[11px] uppercase tracking-widest px-4 py-2 border border-[#465242] hover:border-[#E0DCD1] hover:text-white transition-all">Reformas e Construção</Link>
          <Link to="/designers-em-montes-claros" data-testid="popular-link-designers" className="text-[11px] uppercase tracking-widest px-4 py-2 border border-[#465242] hover:border-[#E0DCD1] hover:text-white transition-all">Designers</Link>
          <Link to="/fotografos-em-montes-claros" data-testid="popular-link-fotografos" className="text-[11px] uppercase tracking-widest px-4 py-2 border border-[#465242] hover:border-[#E0DCD1] hover:text-white transition-all">Fotógrafos</Link>
          <Link to="/marketing-montes-claros" data-testid="popular-link-marketing" className="text-[11px] uppercase tracking-widest px-4 py-2 border border-[#465242] hover:border-[#E0DCD1] hover:text-white transition-all">Marketing e Redes Sociais</Link>
          <Link to="/beleza-montes-claros" data-testid="popular-link-beleza" className="text-[11px] uppercase tracking-widest px-4 py-2 border border-[#465242] hover:border-[#E0DCD1] hover:text-white transition-all">Beleza e Estética</Link>
          <Link to="/servicos-domesticos-montes-claros" data-testid="popular-link-domesticos" className="text-[11px] uppercase tracking-widest px-4 py-2 border border-[#465242] hover:border-[#E0DCD1] hover:text-white transition-all">Serviços Domésticos</Link>
          <Link to="/ti-tecnologia-montes-claros" data-testid="popular-link-ti" className="text-[11px] uppercase tracking-widest px-4 py-2 border border-[#465242] hover:border-[#E0DCD1] hover:text-white transition-all">TI e Tecnologia</Link>
        </div>
      </section>

      {/* FREELANCER DIRECTORY SECTION */}
      <section id="freelancer-directory" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground block mb-3">Diretório de Talentos</span>
          <h2 className="text-3xl font-light uppercase tracking-wide text-[#E0DCD1] mb-6">
            Encontre o profissional certo
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-light max-w-2xl mx-auto">
            Filtre os melhores prestadores por categoria ou faça uma busca por palavras-chave como nomes ou termos específicos.
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-[#1f1f1f] border border-[#465242] p-6 mb-12">
          <div className="flex flex-col gap-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Busque por eletricista, web designer, pintor, aulas, manicure..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-input-field"
                className="w-full bg-[#191919] border border-[#465242] rounded-none py-3.5 pl-12 pr-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`category-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all ${
                    selectedCategory === cat 
                    ? "bg-[#E0DCD1] text-[#191919] border-[#E0DCD1] font-bold" 
                    : "bg-transparent text-[#E0DCD1] border-[#465242] hover:border-[#E0DCD1] font-light"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FREELANCERS GRID */}
        {loadingFreelancers ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E0DCD1]"></div>
            <p className="text-sm font-light text-muted-foreground">Buscando profissionais qualificados...</p>
          </div>
        ) : freelancers.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#465242] p-8">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold mb-2">Nenhum profissional cadastrado nesta categoria</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Seja o primeiro a divulgar serviços nessa categoria! Cadastre-se agora clicando no botão &quot;Quero divulgar meu serviço&quot; acima.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {freelancers.map((freelancer) => (
              <div 
                key={freelancer.user_id}
                data-testid={`freelancer-card-${freelancer.user_id}`}
                className="bg-[#1f1f1f] border border-[#465242] flex flex-col justify-between p-6 hover:border-[#E0DCD1] transition-all group"
              >
                <div>
                  {/* Card Header Profile */}
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={freelancer.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                      alt={freelancer.name}
                      className="w-14 h-14 rounded-none border border-[#465242] object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-[#E0DCD1] tracking-wide text-base group-hover:text-white transition-colors">
                        {freelancer.name}
                      </h3>
                      {/* Rating block */}
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-bold">{freelancer.rating || "5.0"}</span>
                        <span className="text-muted-foreground">({freelancer.review_count || "0"} avaliações)</span>
                      </div>
                    </div>
                  </div>

                  {/* Categories list */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {freelancer.categories && freelancer.categories.map((c, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-0.5 bg-[#465242]/30 border border-[#465242] text-[#E0DCD1] text-[10px] uppercase tracking-wider"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Bio snippet */}
                  <p className="text-sm font-light text-muted-foreground line-clamp-3 mb-6">
                    {freelancer.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#465242]/40 flex flex-col gap-3">
                  {/* Service Highlight */}
                  {freelancer.services && freelancer.services.length > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground uppercase tracking-widest text-[9px] block mb-1">Serviço principal</span>
                      <div className="flex justify-between font-light">
                        <span className="truncate pr-2 font-medium">{freelancer.services[0].title}</span>
                        <span className="text-[#bebaa9] shrink-0">{freelancer.services[0].price}</span>
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Link 
                    to={`/freelancer/${freelancer.user_id}`}
                    data-testid={`freelancer-profile-link-${freelancer.user_id}`}
                    className="w-full text-center py-2.5 bg-transparent border border-[#465242] text-[#E0DCD1] text-xs uppercase tracking-widest font-bold hover:bg-[#E0DCD1] hover:text-[#191919] hover:border-[#E0DCD1] transition-all flex items-center justify-center gap-1.5"
                  >
                    Ver Perfil Completo <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ANUNCIAR VAGA / DEMANDA FORM SECTION */}
      <section id="anunciar-vaga" className="bg-[#1f1f1f] border-t border-b border-[#465242] py-24 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground block mb-3">Para quem precisa contratar</span>
            <h2 className="text-3xl font-light uppercase tracking-wide text-[#E0DCD1] mb-6">
              Anuncie sua demanda
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-light max-w-2xl mx-auto">
              Precisa de um pintor, mecânico, designer ou encanador? Descreva o serviço de forma rápida. Sem precisar criar senhas ou contas complexas!
            </p>
          </div>

          <form onSubmit={handleDemandSubmit} className="bg-[#191919] border border-[#465242] p-8 md:p-12 space-y-8">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#E0DCD1] border-b border-[#465242] pb-3 mb-6">
              Detalhes da Demanda de Serviço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Name */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                  Seu Nome *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: João da Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  data-testid="demand-client-name-input"
                  className="w-full bg-[#191919] border border-[#465242] py-3 px-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] transition-all"
                />
              </div>

              {/* Client Phone */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                  WhatsApp para Contato *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: (38) 99999-9999"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  data-testid="demand-client-phone-input"
                  className="w-full bg-[#191919] border border-[#465242] py-3 px-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] transition-all"
                />
              </div>

              {/* Client Email */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                  E-mail de Contato *
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="Ex: joao@gmail.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  data-testid="demand-client-email-input"
                  className="w-full bg-[#191919] border border-[#465242] py-3 px-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] transition-all"
                />
              </div>

              {/* Demand Title */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                  O que você precisa? (Título) *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Pintura de fachada residencial de 2 andares"
                  value={demandTitle}
                  onChange={(e) => setDemandTitle(e.target.value)}
                  data-testid="demand-title-input"
                  className="w-full bg-[#191919] border border-[#465242] py-3 px-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] transition-all"
                />
              </div>

              {/* Demand Category */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                  Categoria de Serviço
                </label>
                <select 
                  value={demandCategory}
                  onChange={(e) => setDemandCategory(e.target.value)}
                  data-testid="demand-category-select"
                  className="w-full bg-[#191919] border border-[#465242] py-3 px-4 text-[#E0DCD1] text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] transition-all"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat} className="bg-[#191919]">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                  Orçamento Estimado (Opcional)
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: R$ 500, R$ 50/hora, ou a combinar"
                  value={demandBudget}
                  onChange={(e) => setBudget(e.target.value)}
                  data-testid="demand-budget-input"
                  className="w-full bg-[#191919] border border-[#465242] py-3 px-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                Descrição do Trabalho *
              </label>
              <textarea 
                required
                rows="4"
                placeholder="Descreva com detalhes o que deseja. Ex: Preciso de pintor para lixar e aplicar duas demãos de tinta acrílica em parede externa. Área aproximada de 60m², necessita de andaime próprio..."
                value={demandDescription}
                onChange={(e) => setDemandDescription(e.target.value)}
                data-testid="demand-description-textarea"
                className="w-full bg-[#191919] border border-[#465242] py-3 px-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] transition-all resize-none"
              />
            </div>

            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={submittingDemand}
                data-testid="demand-submit-button"
                className="px-10 py-4 bg-[#E0DCD1] text-[#191919] font-bold text-xs uppercase tracking-widest border border-[#E0DCD1] hover:bg-transparent hover:text-[#E0DCD1] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {submittingDemand ? "Publicando..." : "Publicar Demanda Agora"} <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground block mb-3">Como Funciona</span>
        <h2 className="text-3xl font-light uppercase tracking-wide text-[#E0DCD1] mb-16">
          Simples de ponta a ponta
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* For Clients */}
          <div className="bg-[#1f1f1f] border border-[#465242] p-8 text-left space-y-6">
            <h3 className="text-lg font-bold text-[#E0DCD1] uppercase tracking-wide border-b border-[#465242] pb-3">
              Para quem quer Contratar
            </h3>
            <ol className="space-y-4 text-sm font-light text-muted-foreground list-decimal pl-5">
              <li>
                <strong className="text-[#E0DCD1]">Descreva o que precisa:</strong> Preencha o formulário rápido com as informações básicas do seu projeto sem se preocupar em criar senhas.
              </li>
              <li>
                <strong className="text-[#E0DCD1]">Busque talentos locais:</strong> Se preferir, navegue diretamente pelo nosso diretório e filtre por qualificações e avaliações.
              </li>
              <li>
                <strong className="text-[#E0DCD1]">Feche o negócio:</strong> Chame o freelancer no WhatsApp com apenas um clique e acerte os detalhes diretamente com ele. Contato direto com o profissional.
              </li>
            </ol>
          </div>

          {/* For Freelancers */}
          <div className="bg-[#1f1f1f] border border-[#465242] p-8 text-left space-y-6">
            <h3 className="text-lg font-bold text-[#E0DCD1] uppercase tracking-wide border-b border-[#465242] pb-3">
              Para o Prestador / Freelancer
            </h3>
            <ol className="space-y-4 text-sm font-light text-muted-foreground list-decimal pl-5">
              <li>
                <strong className="text-[#E0DCD1]">Crie seu perfil:</strong> Faça login com sua conta do Google e monte seu perfil de serviços e portfólio de forma intuitiva.
              </li>
              <li>
                <strong className="text-[#E0DCD1]">Veja oportunidades:</strong> Acesse o &quot;Painel de Vagas&quot; para ver o que os clientes de Montes Claros estão precisando em tempo real.
              </li>
              <li>
                <strong className="text-[#E0DCD1]">Feche novos clientes:</strong> Responda às vagas propostas ou seja encontrado por novos contratantes e aumente seu faturamento!
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#465242] bg-[#191919] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <NexoSymbol size={24} />
            <span className="font-light tracking-[0.25em] text-xs uppercase text-[#E0DCD1]">NexoMoc</span>
          </div>
          <p className="text-xs text-muted-foreground tracking-wider font-light">
            © 2026 NexoMoc. Montes Claros, MG. Conectando quem precisa a quem faz.
          </p>
        </div>
      </footer>
    </div>
  );
}
