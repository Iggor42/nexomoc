import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { NexoSymbol } from "./NexoSymbol";
import { SEO } from "./SEO";
import { 
  ArrowLeft, 
  Star, 
  Phone, 
  Mail, 
  Briefcase, 
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";

export default function FreelancerProfile() {
  const { user_id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/freelancers/${user_id}`);
        setFreelancer(response.data);
      } catch (err) {
        console.error("Error loading freelancer profile", err);
        toast.error("Não foi possível carregar o perfil do profissional.");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, [user_id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919] text-[#E0DCD1] gap-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E0DCD1]"></div>
        <p className="font-light tracking-wider text-sm">Carregando perfil do profissional...</p>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919] text-[#E0DCD1] p-6 text-center gap-6">
        <h2 className="text-2xl font-light">Profissional não encontrado</h2>
        <p className="text-muted-foreground max-w-md">O link pode estar inválido ou o profissional desativou seu cadastro temporariamente.</p>
        <Link 
          to="/" 
          data-testid="back-to-home-btn"
          className="px-6 py-2.5 bg-[#E0DCD1] text-[#191919] font-bold text-xs uppercase tracking-widest hover:bg-transparent hover:text-[#E0DCD1] border border-[#E0DCD1] transition-all"
        >
          Voltar para Home
        </Link>
      </div>
    );
  }

  // Format WhatsApp Link
  // Clean phone number (remove +, spaces, brackets, etc.)
  const cleanPhone = freelancer.phone ? freelancer.phone.replace(/[^0-9]/g, "") : "";
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Olá, ${freelancer.name}! Vi seu perfil no NexoMoc e gostaria de solicitar um orçamento sobre seus serviços.`
  )}`;
  const mailtoUrl = `mailto:${freelancer.email}?subject=${encodeURIComponent(
    "Orçamento via NexoMoc"
  )}&body=${encodeURIComponent(
    `Olá, ${freelancer.name}. Vi seu perfil no NexoMoc e gostaria de saber mais informações sobre os seus serviços.`
  )}`;

  return (
    <div className="min-h-screen bg-[#191919] text-[#E0DCD1] pb-20">
      <SEO
        title={`${freelancer.name} — ${(freelancer.categories && freelancer.categories[0]) || "Profissional"} em Montes Claros`}
        description={
          (freelancer.bio && freelancer.bio.slice(0, 160)) ||
          `Perfil profissional de ${freelancer.name} em Montes Claros, MG. Veja portfólio, serviços e entre em contato direto por WhatsApp.`
        }
        path={`/freelancer/${freelancer.user_id}`}
        image={freelancer.picture || "https://nexomoc.netlify.app/og-image.png"}
        type="profile"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": freelancer.name,
          "description": freelancer.bio,
          "image": freelancer.picture,
          "jobTitle": (freelancer.categories && freelancer.categories[0]) || "Profissional Autônomo",
          "worksFor": {
            "@type": "Organization",
            "name": "NexoMoc"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Montes Claros",
            "addressRegion": "MG",
            "addressCountry": "BR"
          },
          "aggregateRating": freelancer.review_count > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": freelancer.rating,
            "reviewCount": freelancer.review_count
          } : undefined
        }}
      />
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#191919]/90 backdrop-blur-md border-b border-[#465242] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" data-testid="profile-nav-logo-link" className="flex items-center gap-3">
            <NexoSymbol size={32} />
            <span className="font-light tracking-[0.25em] text-sm uppercase">NexoMoc</span>
          </Link>
          <Link 
            to="/" 
            data-testid="profile-back-to-home-link"
            className="text-xs uppercase tracking-widest font-light hover:text-[#bebaa9] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Diretório
          </Link>
        </div>
      </header>

      {/* CORE PROFILE CONTENT */}
      <main className="max-w-5xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* PROFILE LEFT COLUMN - CARD */}
          <div className="lg:col-span-1 bg-[#1f1f1f] border border-[#465242] p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <img 
                src={freelancer.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                alt={freelancer.name}
                className="w-28 h-28 rounded-none border border-[#465242] object-cover"
              />
              <div>
                <h1 className="text-xl font-bold tracking-wide text-white">{freelancer.name}</h1>
                
                {/* Rating blocks */}
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold">{freelancer.rating || "5.0"}</span>
                  <span className="text-muted-foreground">({freelancer.review_count || "0"} avaliações)</span>
                </div>
              </div>
            </div>

            {/* Badges categories */}
            <div className="border-t border-b border-[#465242]/40 py-4 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground block">Categorias de Atuação</span>
              <div className="flex flex-wrap gap-1.5">
                {freelancer.categories && freelancer.categories.map((c, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 bg-[#465242]/20 border border-[#465242] text-[#E0DCD1] text-[10px] uppercase tracking-wider"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* ACTION DIRECT CHAT BOX */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-white font-bold mb-3">Fale com o profissional</h3>
              
              {freelancer.phone ? (
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="whatsapp-contact-btn"
                  className="w-full text-center py-3.5 bg-[#465242] hover:bg-[#5d6d58] text-white text-xs uppercase tracking-widest font-bold border border-[#465242] hover:border-[#5d6d58] transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Enviar WhatsApp
                </a>
              ) : (
                <div className="p-3 bg-red-950/20 border border-red-950 text-red-400 text-xs rounded text-center">
                  Telefone de contato não cadastrado.
                </div>
              )}

              <a 
                href={mailtoUrl}
                data-testid="email-contact-btn"
                className="w-full text-center py-3.5 bg-transparent hover:bg-[#465242]/20 text-[#E0DCD1] text-xs uppercase tracking-widest font-bold border border-[#465242] hover:border-[#E0DCD1] transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Enviar E-mail
              </a>
            </div>

            <div className="text-[10px] text-center text-muted-foreground font-light tracking-wide border-t border-[#465242]/40 pt-4">
              Dica: Contato direto com o profissional. Toda a negociação e pagamento ocorrem diretamente entre você e o profissional.
            </div>
          </div>

          {/* PROFILE RIGHT COLUMN - BIO & LISTS */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Bio section */}
            <div className="bg-[#1f1f1f] border border-[#465242] p-8 md:p-10 space-y-4">
              <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sobre o Profissional</h2>
              <p className="text-[#E0DCD1] font-light leading-relaxed whitespace-pre-line text-base">
                {freelancer.bio || "Este profissional ainda não preencheu sua biografia de apresentação."}
              </p>
            </div>

            {/* TABS CONTAINER */}
            <div className="space-y-6">
              <div className="flex border-b border-[#465242]">
                <button
                  onClick={() => setActiveTab("services")}
                  data-testid="profile-tab-services"
                  className={`px-6 py-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all ${
                    activeTab === "services" 
                    ? "border-[#E0DCD1] text-[#E0DCD1]" 
                    : "border-transparent text-muted-foreground hover:text-[#E0DCD1]"
                  }`}
                >
                  Serviços Disponíveis
                </button>
                <button
                  onClick={() => setActiveTab("portfolio")}
                  data-testid="profile-tab-portfolio"
                  className={`px-6 py-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all ${
                    activeTab === "portfolio" 
                    ? "border-[#E0DCD1] text-[#E0DCD1]" 
                    : "border-transparent text-muted-foreground hover:text-[#E0DCD1]"
                  }`}
                >
                  Portfólio / Projetos
                </button>
              </div>

              {/* SERVICES TAB */}
              {activeTab === "services" && (
                <div className="space-y-6">
                  {!freelancer.services || freelancer.services.length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-[#465242] text-muted-foreground text-sm">
                      Nenhum serviço catalogado por este profissional no momento.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {freelancer.services.map((srv) => (
                        <div 
                          key={srv.id} 
                          data-testid={`profile-service-card-${srv.id}`}
                          className="bg-[#1f1f1f] border border-[#465242] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#E0DCD1]/50 transition-all"
                        >
                          <div className="space-y-2">
                            <h3 className="font-bold text-[#E0DCD1] tracking-wide text-base">{srv.title}</h3>
                            <p className="text-sm font-light text-muted-foreground">{srv.description}</p>
                          </div>
                          <div className="text-left md:text-right shrink-0">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Preço estimado</span>
                            <span className="text-lg font-bold text-white tracking-wide">{srv.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PORTFOLIO TAB */}
              {activeTab === "portfolio" && (
                <div className="space-y-6">
                  {!freelancer.portfolio || freelancer.portfolio.length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-[#465242] text-muted-foreground text-sm">
                      Nenhum trabalho adicionado ao portfólio ainda.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {freelancer.portfolio.map((port) => (
                        <div 
                          key={port.id}
                          data-testid={`profile-portfolio-card-${port.id}`}
                          className="bg-[#1f1f1f] border border-[#465242] overflow-hidden hover:border-[#E0DCD1]/50 transition-all"
                        >
                          {port.image_url && (
                            <img 
                              src={port.image_url} 
                              alt={port.title}
                              className="w-full h-48 object-cover border-b border-[#465242]"
                            />
                          )}
                          <div className="p-5 space-y-2">
                            <h3 className="font-bold text-[#E0DCD1] tracking-wide text-sm">{port.title}</h3>
                            <p className="text-xs font-light text-muted-foreground">{port.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
