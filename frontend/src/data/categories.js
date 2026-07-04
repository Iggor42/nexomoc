/**
 * Configuração das páginas de categoria SEO-optimized.
 * Cada slug vira uma landing page com URL amigável, meta tags únicas e JSON-LD.
 * Filtra freelancers por categoria backend + termo de busca opcional.
 */

export const CATEGORY_PAGES = {
  "eletricistas-em-montes-claros": {
    slug: "eletricistas-em-montes-claros",
    heading: "Eletricistas em Montes Claros",
    subtitle: "Profissionais certificados para instalação, reforma e manutenção elétrica",
    seoTitle: "Eletricistas em Montes Claros | NexoMoc",
    seoDescription: "Contrate eletricistas em Montes Claros para instalações residenciais, industriais, chuveiros e ar-condicionado. Contato direto via WhatsApp. Peça orçamento agora.",
    categoryFilter: "Construção e Reformas",
    searchFilter: "eletric",
    services: [
      "Instalação elétrica residencial",
      "Reforma elétrica completa",
      "Instalação de chuveiro e ar-condicionado",
      "Quadro de disjuntores"
    ],
    intro: "Encontre eletricistas experientes em Montes Claros e região para reformas, instalações prediais e emergências. Todos os profissionais atendem via WhatsApp direto, sem intermediação.",
  },
  "designers-em-montes-claros": {
    slug: "designers-em-montes-claros",
    heading: "Designers e Criação em Montes Claros",
    subtitle: "Web designers, UI/UX, identidade visual e branding local",
    seoTitle: "Designers e Criação em Montes Claros | NexoMoc",
    seoDescription: "Designers em Montes Claros para landing pages, identidade visual, logos e UX/UI. Peça orçamentos direto no WhatsApp com os melhores profissionais criativos da cidade.",
    categoryFilter: "Design e Tecnologia",
    searchFilter: "design",
    services: [
      "Design de landing pages",
      "Identidade visual e logos",
      "UI/UX de aplicativos",
      "Design gráfico para redes sociais"
    ],
    intro: "Profissionais de design em Montes Claros para desenvolver marcas, sites e materiais visuais que geram vendas.",
  },
  "fotografos-em-montes-claros": {
    slug: "fotografos-em-montes-claros",
    heading: "Fotógrafos em Montes Claros",
    subtitle: "Casamentos, eventos, ensaios e fotografia profissional local",
    seoTitle: "Fotógrafos em Montes Claros | NexoMoc",
    seoDescription: "Fotógrafos profissionais em Montes Claros para casamentos, eventos corporativos, ensaios pré-wedding, gestantes e newborn. Portfólio online e contato direto.",
    categoryFilter: null,
    searchFilter: "fotograf",
    services: [
      "Fotografia de casamento",
      "Eventos corporativos",
      "Ensaios pré-wedding e gestante",
      "Fotografia de produto"
    ],
    intro: "Registre momentos especiais com os melhores fotógrafos de Montes Claros. Veja portfólios e contrate direto.",
  },
  "reformas-em-montes-claros": {
    slug: "reformas-em-montes-claros",
    heading: "Reformas e Construção em Montes Claros",
    subtitle: "Pedreiros, pintores, encanadores e equipes completas de reforma",
    seoTitle: "Reformas e Construção em Montes Claros | NexoMoc",
    seoDescription: "Empresas e profissionais de reforma em Montes Claros: pedreiros, pintores, encanadores, gesseiros e reformas completas de casas e apartamentos. Orçamento grátis.",
    categoryFilter: "Construção e Reformas",
    searchFilter: null,
    services: [
      "Reforma residencial completa",
      "Pintura interna e externa",
      "Alvenaria e reboco",
      "Encanamento e hidráulica"
    ],
    intro: "Do pequeno reparo à reforma completa, encontre profissionais confiáveis de construção civil em Montes Claros.",
  },
  "marketing-montes-claros": {
    slug: "marketing-montes-claros",
    heading: "Marketing e Redes Sociais em Montes Claros",
    subtitle: "Gestão de Instagram, tráfego pago, social media e conteúdo local",
    seoTitle: "Marketing e Redes Sociais em Montes Claros | NexoMoc",
    seoDescription: "Profissionais de marketing digital em Montes Claros: gestão de Instagram e Facebook, tráfego pago Google/Meta Ads, criação de conteúdo e estratégia para pequenos negócios locais.",
    categoryFilter: "Design e Tecnologia",
    searchFilter: "marketing",
    services: [
      "Gestão de Instagram e Facebook",
      "Tráfego pago (Google Ads e Meta Ads)",
      "Criação de conteúdo",
      "Estratégia de marca local"
    ],
    intro: "Aumente as vendas do seu negócio local com profissionais de marketing digital em Montes Claros que entendem do mercado da cidade.",
  },
  "beleza-montes-claros": {
    slug: "beleza-montes-claros",
    heading: "Beleza e Estética em Montes Claros",
    subtitle: "Manicures, cabeleireiros, maquiadores e esteticistas",
    seoTitle: "Beleza e Estética em Montes Claros | NexoMoc",
    seoDescription: "Serviços de beleza em Montes Claros: manicure, alongamento de unhas, cabeleireiro, maquiagem, sobrancelha, estética facial e corporal. Agende via WhatsApp.",
    categoryFilter: "Beleza e Bem-Estar",
    searchFilter: null,
    services: [
      "Manicure e pedicure",
      "Alongamento de unhas",
      "Corte e coloração de cabelo",
      "Maquiagem para eventos",
      "Design de sobrancelha"
    ],
    intro: "Os melhores profissionais de beleza e estética de Montes Claros: atendimento personalizado, materiais esterilizados e agendamento rápido.",
  },
  "servicos-domesticos-montes-claros": {
    slug: "servicos-domesticos-montes-claros",
    heading: "Serviços Domésticos em Montes Claros",
    subtitle: "Diaristas, cozinheiras, jardineiros, montadores e serviços gerais",
    seoTitle: "Serviços Domésticos em Montes Claros | NexoMoc",
    seoDescription: "Contrate diaristas, cozinheiras, jardineiros, montadores de móveis e outros profissionais domésticos em Montes Claros. Confiança, referência local e contato direto por WhatsApp.",
    categoryFilter: "Serviços Domésticos",
    searchFilter: null,
    services: [
      "Diarista e faxineira",
      "Cozinha semanal e marmitas",
      "Jardinagem e paisagismo",
      "Montagem de móveis"
    ],
    intro: "Deixe sua casa em ordem com profissionais domésticos avaliados e verificados em Montes Claros.",
  },
  "ti-tecnologia-montes-claros": {
    slug: "ti-tecnologia-montes-claros",
    heading: "Tecnologia e TI em Montes Claros",
    subtitle: "Desenvolvedores, suporte técnico, manutenção de computadores e redes",
    seoTitle: "Tecnologia e TI em Montes Claros | NexoMoc",
    seoDescription: "Profissionais de TI em Montes Claros: desenvolvimento de sites e sistemas, manutenção de computadores, formatação, instalação de redes e suporte técnico presencial ou remoto.",
    categoryFilter: "Design e Tecnologia",
    searchFilter: "desenvolv",
    services: [
      "Desenvolvimento de sites e sistemas",
      "Manutenção de computadores",
      "Configuração de redes e Wi-Fi",
      "Suporte técnico remoto e presencial"
    ],
    intro: "Suporte técnico e desenvolvimento de tecnologia em Montes Claros: profissionais qualificados para negócios e residências.",
  },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_PAGES);
