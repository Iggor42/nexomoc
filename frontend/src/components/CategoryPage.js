import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { NexoSymbol } from "./NexoSymbol";
import { SEO } from "./SEO";
import { CATEGORY_PAGES } from "../data/categories";
import { ArrowLeft, ArrowRight, Star, Phone, Mail, CheckCircle2, MapPin } from "lucide-react";

export default function CategoryPage({ slug }) {
  const navigate = useNavigate();
  const config = CATEGORY_PAGES[slug];

  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) {
      navigate("/", { replace: true });
      return;
    }

    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const params = {};
        if (config.categoryFilter) params.category = config.categoryFilter;
        if (config.searchFilter) params.search = config.searchFilter;
        const res = await axios.get(`${backendUrl}/api/freelancers`, { params });
        setFreelancers(res.data);
      } catch (err) {
        console.error("Error loading category freelancers", err);
        toast.error("Erro ao carregar profissionais.");
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, [slug, config, navigate]);

  if (!config) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": config.heading,
    "description": config.seoDescription,
    "inLanguage": "pt-BR",
    "about": {
      "@type": "Service",
      "name": config.heading,
      "areaServed": {
        "@type": "City",
        "name": "Montes Claros",
        "containedInPlace": { "@type": "State", "name": "Minas Gerais" }
      },
      "provider": {
        "@type": "Organization",
        "name": "NexoMoc",
        "url": "https://nexomoc.netlify.app/"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": config.heading,
        "itemListElement": config.services.map((s, idx) => ({
          "@type": "Offer",
          "position": idx + 1,
          "itemOffered": { "@type": "Service", "name": s }
        }))
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://nexomoc.netlify.app/" },
        { "@type": "ListItem", "position": 2, "name": config.heading, "item": `https://nexomoc.netlify.app/${slug}` }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-[#E0DCD1] pb-20">
      <SEO
        title={config.seoTitle}
        description={config.seoDescription}
        path={`/${slug}`}
        jsonLd={jsonLd}
      />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#191919]/90 backdrop-blur-md border-b border-[#465242] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" data-testid="category-nav-logo-link" className="flex items-center gap-3">
            <NexoSymbol size={32} />
            <span className="font-light tracking-[0.25em] text-sm uppercase">NexoMoc</span>
          </Link>
          <Link
            to="/"
            data-testid="category-back-to-home-link"
            className="text-xs uppercase tracking-widest font-light hover:text-[#bebaa9] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à Home
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-light">
          <Link to="/" className="hover:text-[#E0DCD1] transition-colors">Início</Link>
          <span className="mx-2">/</span>
          <span className="text-[#E0DCD1]">{config.heading}</span>
        </nav>

        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground block mb-3 flex items-center gap-2">
          <MapPin className="w-3 h-3" /> Montes Claros, MG
        </span>
        <h1 className="text-4xl sm:text-5xl font-light uppercase tracking-wide text-[#E0DCD1] mb-6" data-testid="category-heading">
          {config.heading}
        </h1>
        <p className="text-base sm:text-lg font-light text-muted-foreground max-w-3xl leading-relaxed mb-8">
          {config.intro}
        </p>

        {/* Services covered */}
        <div className="border-t border-[#465242] pt-8 mt-8">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground block mb-4">Serviços mais procurados</span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.services.map((service) => (
              <li key={service} className="flex items-start gap-3 text-sm font-light">
                <CheckCircle2 className="w-4 h-4 text-[#bebaa9] mt-0.5 flex-shrink-0" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROFESSIONALS LIST */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-light uppercase tracking-wide text-[#E0DCD1]">
            Profissionais disponíveis
          </h2>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {loading ? "Carregando..." : `${freelancers.length} resultado${freelancers.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {loading && (
          <div className="text-center py-16 text-sm text-muted-foreground">Carregando profissionais...</div>
        )}

        {!loading && freelancers.length === 0 && (
          <div className="text-center border border-dashed border-[#465242] py-16 px-6">
            <h3 className="font-bold uppercase tracking-wider text-sm mb-3">Ainda não há profissionais cadastrados aqui</h3>
            <p className="text-sm text-muted-foreground font-light mb-6 max-w-lg mx-auto">
              Seja o primeiro a divulgar seus serviços de {config.heading.toLowerCase()} em Montes Claros e apareça no topo desta página.
            </p>
            <Link
              to="/"
              data-testid="category-empty-cta-link"
              className="inline-flex items-center gap-2 bg-[#E0DCD1] text-[#191919] px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-transparent hover:text-[#E0DCD1] border border-[#E0DCD1] transition-all"
            >
              Cadastrar meu serviço <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {!loading && freelancers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {freelancers.map((f) => (
              <Link
                key={f.user_id}
                to={`/freelancer/${f.user_id}`}
                data-testid={`category-freelancer-card-${f.user_id}`}
                className="group bg-[#1f1f1f] border border-[#465242] p-6 hover:border-[#E0DCD1] hover:-translate-y-1 transition-all duration-300 block"
              >
                <div className="flex items-start gap-4">
                  {f.picture ? (
                    <img src={f.picture} alt={f.name} className="w-14 h-14 rounded-full object-cover border border-[#465242]" />
                  ) : (
                    <div className="w-14 h-14 rounded-full border border-[#465242] flex items-center justify-center text-lg">
                      {f.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold uppercase tracking-wider text-sm text-[#E0DCD1] group-hover:text-white transition-colors truncate">
                      {f.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-[#bebaa9] fill-[#bebaa9]" />
                      <span>{f.rating?.toFixed(1) || "5.0"}</span>
                      <span>·</span>
                      <span>{f.review_count || 0} avaliações</span>
                    </div>
                    {f.categories && f.categories[0] && (
                      <span className="inline-block mt-2 text-[10px] uppercase tracking-widest text-[#bebaa9] border border-[#465242] px-2 py-0.5">
                        {f.categories[0]}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-light text-muted-foreground mt-4 line-clamp-3">
                  {f.bio}
                </p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#465242] text-xs text-[#bebaa9]">
                  {f.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> WhatsApp</span>}
                  {f.email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> E-mail</span>}
                  <span className="ml-auto flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest">
                    Ver perfil <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CROSS-LINK TO OTHER CATEGORIES */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-[#465242]">
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground block mb-6">Outras categorias em Montes Claros</span>
        <div className="flex flex-wrap gap-3">
          {Object.values(CATEGORY_PAGES)
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <Link
                key={c.slug}
                to={`/${c.slug}`}
                data-testid={`related-category-${c.slug}`}
                className="text-[11px] uppercase tracking-widest px-4 py-2 border border-[#465242] hover:border-[#E0DCD1] hover:text-white transition-all"
              >
                {c.heading}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
