import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { NexoSymbol } from "./NexoSymbol";
import { SEO } from "./SEO";
import { 
  User, 
  Briefcase, 
  Image as ImageIcon, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Home as HomeIcon,
  Phone, 
  Mail, 
  Check, 
  Eye,
  FileText,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const { user, setUser, loading, logout, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Active view tabs
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCats, setSelectedCategoryList] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  // New Service Form State
  const [newSrvTitle, setNewSrvTitle] = useState("");
  const [newSrvDesc, setNewSrvDescription] = useState("");
  const [newSrvPrice, setNewSrvPrice] = useState("");
  const [addingService, setAddingService] = useState(false);

  // New Portfolio Form State
  const [newPortTitle, setNewPortTitle] = useState("");
  const [newPortDesc, setNewPortDesc] = useState("");
  const [newPortImgUrl, setNewPortImgUrl] = useState("");
  const [addingPortfolio, setAddingPortfolio] = useState(false);

  // Opportunities tab state (matching client demands)
  const [demands, setDemands] = useState([]);
  const [loadingDemands, setLoadingDemands] = useState(false);

  const availableCategories = [
    "Construção e Reformas",
    "Design e Tecnologia",
    "Beleza e Bem-Estar",
    "Educação",
    "Serviços Domésticos"
  ];

  // Initialize form when user state loads
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setSelectedCategoryList(user.categories || []);
    }
  }, [user]);

  // Load client demands if the freelancer checks the opportunities tab
  useEffect(() => {
    if (activeTab === "vagas") {
      const fetchDemands = async () => {
        try {
          setLoadingDemands(true);
          const backendUrl = process.env.REACT_APP_BACKEND_URL;
          const response = await axios.get(`${backendUrl}/api/demands`);
          setDemands(response.data);
        } catch (err) {
          console.error("Error fetching opportunities", err);
          toast.error("Não foi possível carregar as vagas do mercado.");
        } finally {
          setLoadingDemands(false);
        }
      };
      fetchDemands();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919] text-[#E0DCD1] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E0DCD1]"></div>
        <p className="font-light text-sm tracking-widest">Acessando painel...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919] text-[#E0DCD1] p-6 text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-950/20 border border-red-950 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-light uppercase tracking-wide">Acesso restrito</h2>
        <p className="text-muted-foreground max-w-sm font-light">
          Apenas profissionais autônomos cadastrados podem gerenciar perfis e vagas. Faça login social com o Google.
        </p>
        <button 
          onClick={loginWithGoogle}
          data-testid="dashboard-unauth-login-btn"
          className="px-8 py-3.5 bg-[#E0DCD1] text-[#191919] font-bold text-xs uppercase tracking-widest border border-[#E0DCD1] hover:bg-transparent hover:text-[#E0DCD1] transition-all"
        >
          Entrar com o Google
        </button>
        <Link to="/" data-testid="dashboard-unauth-back-home" className="text-xs text-muted-foreground hover:text-white transition-colors">
          Voltar para a página principal
        </Link>
      </div>
    );
  }

  // Handle Category check toggling
  const handleCategoryToggle = (catName) => {
    if (selectedCats.includes(catName)) {
      setSelectedCategoryList(selectedCats.filter(c => c !== catName));
    } else {
      setSelectedCategoryList([...selectedCats, catName]);
    }
  };

  // Profile Update Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error("O nome é um campo obrigatório.");
      return;
    }

    try {
      setSavingProfile(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem("session_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const response = await axios.put(`${backendUrl}/api/auth/me`, {
        name,
        phone,
        bio,
        categories: selectedCats
      }, {
        headers,
        withCredentials: true
      });

      setUser(response.data);
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Error updating profile", err);
      toast.error("Erro ao atualizar o perfil. Tente novamente.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Service Creation
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newSrvTitle || !newSrvDesc || !newSrvPrice) {
      toast.error("Preencha todos os campos do serviço.");
      return;
    }

    try {
      setAddingService(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem("session_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      await axios.post(`${backendUrl}/api/auth/services`, {
        title: newSrvTitle,
        description: newSrvDesc,
        price: newSrvPrice
      }, {
        headers,
        withCredentials: true
      });

      toast.success("Serviço adicionado com sucesso!");
      
      // Reset form
      setNewSrvTitle("");
      setNewSrvDescription("");
      setNewSrvPrice("");

      // Refresh current user data
      const refreshResponse = await axios.get(`${backendUrl}/api/auth/me`, {
        headers,
        withCredentials: true
      });
      setUser(refreshResponse.data);
    } catch (err) {
      console.error("Error adding service", err);
      toast.error("Erro ao adicionar serviço.");
    } finally {
      setAddingService(false);
    }
  };

  // Service Deletion
  const handleDeleteService = async (srvId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem("session_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      await axios.delete(`${backendUrl}/api/auth/services/${srvId}`, {
        headers,
        withCredentials: true
      });

      toast.success("Serviço removido com sucesso!");

      // Refresh user data
      const refreshResponse = await axios.get(`${backendUrl}/api/auth/me`, {
        headers,
        withCredentials: true
      });
      setUser(refreshResponse.data);
    } catch (err) {
      console.error("Error deleting service", err);
      toast.error("Falha ao remover o serviço.");
    }
  };

  // Portfolio Creation
  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!newPortTitle || !newPortDesc) {
      toast.error("Preencha os campos obrigatórios do portfólio.");
      return;
    }

    try {
      setAddingPortfolio(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem("session_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      await axios.post(`${backendUrl}/api/auth/portfolio`, {
        title: newPortTitle,
        description: newPortDesc,
        image_url: newPortImgUrl || "https://images.unsplash.com/photo-1594398985750-3b54ec074a0a?w=600"
      }, {
        headers,
        withCredentials: true
      });

      toast.success("Trabalho adicionado ao seu portfólio!");
      
      // Reset form
      setNewPortTitle("");
      setNewPortDesc("");
      setNewPortImgUrl("");

      // Refresh user
      const refreshResponse = await axios.get(`${backendUrl}/api/auth/me`, {
        headers,
        withCredentials: true
      });
      setUser(refreshResponse.data);
    } catch (err) {
      console.error("Error adding portfolio item", err);
      toast.error("Erro ao adicionar item do portfólio.");
    } finally {
      setAddingPortfolio(false);
    }
  };

  // Portfolio Deletion
  const handleDeletePortfolio = async (portId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem("session_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      await axios.delete(`${backendUrl}/api/auth/portfolio/${portId}`, {
        headers,
        withCredentials: true
      });

      toast.success("Trabalho removido do portfólio.");

      // Refresh user
      const refreshResponse = await axios.get(`${backendUrl}/api/auth/me`, {
        headers,
        withCredentials: true
      });
      setUser(refreshResponse.data);
    } catch (err) {
      console.error("Error deleting portfolio item", err);
      toast.error("Erro ao remover o item do portfólio.");
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/");
    toast.success("Sessão finalizada!");
  };

  return (
    <div className="min-h-screen bg-[#191919] text-[#E0DCD1] pb-20">
      <SEO
        title="Painel do Profissional | NexoMoc"
        description="Área privada do profissional NexoMoc. Gerencie perfil, serviços e portfólio."
        path="/dashboard"
      />
      {/* NAVBAR */}
      <header className="bg-[#1f1f1f] border-b border-[#465242] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" data-testid="dashboard-logo-link" className="flex items-center gap-3">
            <NexoSymbol size={32} />
            <span className="font-light tracking-[0.25em] text-sm uppercase">NexoMoc</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              data-testid="dashboard-home-link"
              className="text-xs uppercase tracking-widest font-light hover:text-white transition-colors flex items-center gap-1.5"
            >
              <HomeIcon className="w-4 h-4" /> Ir para Home
            </Link>
            
            <button 
              onClick={handleLogoutClick}
              data-testid="dashboard-logout-btn"
              className="p-2 border border-[#465242] hover:bg-red-950/20 hover:border-red-500/50 hover:text-red-400 transition-all flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD HERO INFO */}
      <div className="bg-[#1f1f1f] border-b border-[#465242] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4 text-left">
            <img 
              src={user.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
              alt={user.name}
              className="w-16 h-14 border border-[#465242] object-cover"
            />
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Prestador Cadastrado</span>
              <h1 className="text-xl font-bold tracking-wide text-white">{user.name}</h1>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status indicators */}
            {user.phone ? (
              <span className="px-3 py-1.5 bg-[#465242]/30 border border-[#465242] text-[#E0DCD1] text-xs font-light flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> Perfil visível na busca
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-red-950/20 border border-red-950 text-red-400 text-xs font-light flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Invisível (cadastre o WhatsApp)
              </span>
            )}
            
            <Link 
              to={`/freelancer/${user.user_id}`} 
              data-testid="dashboard-preview-profile-link"
              className="px-3 py-1.5 border border-[#E0DCD1] text-[#191919] bg-[#E0DCD1] text-xs font-bold uppercase tracking-wider hover:bg-transparent hover:text-white transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Ver Perfil Público
            </Link>
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE */}
      <main className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR TABS */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            data-testid="dashboard-tab-profile"
            className={`w-full text-left px-5 py-3 text-xs uppercase tracking-widest font-bold border transition-all flex items-center gap-2.5 ${
              activeTab === "profile" 
              ? "bg-[#E0DCD1] text-[#191919] border-[#E0DCD1]" 
              : "bg-[#1f1f1f] border-[#465242] text-[#E0DCD1] hover:border-[#E0DCD1]"
            }`}
          >
            <User className="w-4 h-4" /> Meu Perfil
          </button>
          
          <button
            onClick={() => setActiveTab("services")}
            data-testid="dashboard-tab-services"
            className={`w-full text-left px-5 py-3 text-xs uppercase tracking-widest font-bold border transition-all flex items-center gap-2.5 ${
              activeTab === "services" 
              ? "bg-[#E0DCD1] text-[#191919] border-[#E0DCD1]" 
              : "bg-[#1f1f1f] border-[#465242] text-[#E0DCD1] hover:border-[#E0DCD1]"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Meus Serviços ({user.services?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("portfolio")}
            data-testid="dashboard-tab-portfolio"
            className={`w-full text-left px-5 py-3 text-xs uppercase tracking-widest font-bold border transition-all flex items-center gap-2.5 ${
              activeTab === "portfolio" 
              ? "bg-[#E0DCD1] text-[#191919] border-[#E0DCD1]" 
              : "bg-[#1f1f1f] border-[#465242] text-[#E0DCD1] hover:border-[#E0DCD1]"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Meu Portfólio ({user.portfolio?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("vagas")}
            data-testid="dashboard-tab-vagas"
            className={`w-full text-left px-5 py-3 text-xs uppercase tracking-widest font-bold border transition-all flex items-center gap-2.5 ${
              activeTab === "vagas" 
              ? "bg-[#E0DCD1] text-[#191919] border-[#E0DCD1]" 
              : "bg-[#1f1f1f] border-[#465242] text-[#E0DCD1] hover:border-[#E0DCD1]"
            }`}
          >
            <FileText className="w-4 h-4" /> Vagas do Mercado
          </button>
        </div>

        {/* DETAILS WORKSPACE */}
        <div className="lg:col-span-3">
          
          {/* PROFILE VIEW */}
          {activeTab === "profile" && (
            <div className="bg-[#1f1f1f] border border-[#465242] p-8 space-y-8 animate-fade-in">
              <div>
                <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-white border-b border-[#465242] pb-3 mb-1">
                  Editar Meu Perfil Profissional
                </h2>
                <p className="text-xs text-muted-foreground font-light">
                  Mantenha suas informações atualizadas para atrair clientes. Os campos marcados com * são obrigatórios.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6 text-left">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                    Nome Completo *
                  </label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="edit-profile-name"
                    className="w-full bg-[#191919] border border-[#465242] py-2.5 px-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1]"
                  />
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                    Número de WhatsApp / Contato *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: 5538999999999 (com código do país/DDD)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="edit-profile-phone"
                    className="w-full bg-[#191919] border border-[#465242] py-2.5 px-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1]"
                  />
                  <p className="text-[10px] text-muted-foreground font-light">
                    Importante: Insira o número completo com DDD (Ex: 5538999998888). O cadastro deste campo é obrigatório para que seu perfil fique visível na busca pública.
                  </p>
                </div>

                {/* Bio Description */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                    Biografia / Apresentação *
                  </label>
                  <textarea 
                    rows="5"
                    required
                    placeholder="Fale um pouco sobre sua formação, anos de experiência, especialidades e quais bairros de Montes Claros você costuma atender..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    data-testid="edit-profile-bio"
                    className="w-full bg-[#191919] border border-[#465242] py-2.5 px-4 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] resize-none"
                  />
                </div>

                {/* Category selectors (multiple) */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                    Categorias de Serviço
                  </label>
                  <p className="text-[10px] text-muted-foreground font-light -mt-1 mb-2">Selecione todas as categorias em que você atua na cidade.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableCategories.map((cat) => {
                      const isChecked = selectedCats.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryToggle(cat)}
                          data-testid={`edit-profile-category-${cat.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                          className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider border flex items-center justify-between transition-all ${
                            isChecked 
                            ? "bg-[#465242]/20 border-[#E0DCD1] text-white font-medium" 
                            : "bg-[#191919] border-[#465242] text-muted-foreground hover:border-muted"
                          }`}
                        >
                          <span>{cat}</span>
                          <span className={`w-4 h-4 border border-[#465242] flex items-center justify-center text-[10px] ${isChecked ? "bg-[#E0DCD1] text-[#191919]" : ""}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    data-testid="edit-profile-submit-btn"
                    className="px-8 py-3 bg-[#E0DCD1] text-[#191919] font-bold text-xs uppercase tracking-widest border border-[#E0DCD1] hover:bg-transparent hover:text-white disabled:opacity-50 transition-all"
                  >
                    {savingProfile ? "Salvando alterações..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SERVICES VIEW */}
          {activeTab === "services" && (
            <div className="space-y-8 animate-fade-in text-left">
              
              {/* Add New Service Form */}
              <div className="bg-[#1f1f1f] border border-[#465242] p-8 space-y-6">
                <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-white border-b border-[#465242] pb-3">
                  Adicionar Novo Serviço ao Perfil
                </h2>

                <form onSubmit={handleAddService} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                        Título do Serviço *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Instalação de Padrão CEMIG"
                        value={newSrvTitle}
                        onChange={(e) => setNewSrvTitle(e.target.value)}
                        data-testid="add-service-title"
                        className="w-full bg-[#191919] border border-[#465242] py-2 px-3 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                        Preço / Estimativa *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: R$ 350 ou R$ 50/hora ou A Combinar"
                        value={newSrvPrice}
                        onChange={(e) => setNewSrvPrice(e.target.value)}
                        data-testid="add-service-price"
                        className="w-full bg-[#191919] border border-[#465242] py-2 px-3 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                      Descrição Detalhada do Serviço *
                    </label>
                    <textarea 
                      rows="3"
                      required
                      placeholder="Descreva o escopo do serviço, o que está incluso, o tempo de entrega aproximado..."
                      value={newSrvDesc}
                      onChange={(e) => setNewSrvDescription(e.target.value)}
                      data-testid="add-service-description"
                      className="w-full bg-[#191919] border border-[#465242] py-2 px-3 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addingService}
                    data-testid="add-service-submit-btn"
                    className="px-6 py-2.5 bg-[#E0DCD1] text-[#191919] font-bold text-xs uppercase tracking-widest border border-[#E0DCD1] hover:bg-transparent hover:text-white disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> {addingService ? "Adicionando..." : "Adicionar Serviço"}
                  </button>
                </form>
              </div>

              {/* Existing Services List */}
              <div className="bg-[#1f1f1f] border border-[#465242] p-8 space-y-6">
                <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-white border-b border-[#465242] pb-3">
                  Serviços Catalogados ({user.services?.length || 0})
                </h2>

                {!user.services || user.services.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-light py-4 text-center">
                    Você ainda não cadastrou nenhum serviço específico. Adicione um acima!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {user.services.map((srv) => (
                      <div 
                        key={srv.id} 
                        className="p-5 border border-[#465242] bg-[#191919] flex justify-between items-start gap-4"
                      >
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-[#E0DCD1] text-sm">{srv.title}</h3>
                          <p className="text-xs text-muted-foreground font-light">{srv.description}</p>
                          <span className="text-xs font-medium text-[#bebaa9] block">Preço: {srv.price}</span>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          data-testid={`delete-service-btn-${srv.id}`}
                          className="p-1.5 border border-[#465242] text-red-400 hover:border-red-500 hover:bg-red-950/20 transition-all shrink-0"
                          title="Excluir Serviço"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* PORTFOLIO VIEW */}
          {activeTab === "portfolio" && (
            <div className="space-y-8 animate-fade-in text-left">
              
              {/* Add New Portfolio Item */}
              <div className="bg-[#1f1f1f] border border-[#465242] p-8 space-y-6">
                <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-white border-b border-[#465242] pb-3">
                  Adicionar Projeto / Trabalho ao Portfólio
                </h2>

                <form onSubmit={handleAddPortfolio} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                        Título do Trabalho *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Pintura interna no Bairro Ibituruna"
                        value={newPortTitle}
                        onChange={(e) => setNewPortTitle(e.target.value)}
                        data-testid="add-portfolio-title"
                        className="w-full bg-[#191919] border border-[#465242] py-2 px-3 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                        Link de Imagem Ilustrativa (URL)
                      </label>
                      <input 
                        type="url"
                        placeholder="Cole um link de imagem do Unsplash ou Pexels"
                        value={newPortImgUrl}
                        onChange={(e) => setNewPortImgUrl(e.target.value)}
                        data-testid="add-portfolio-image"
                        className="w-full bg-[#191919] border border-[#465242] py-2 px-3 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-light text-[#E0DCD1] block">
                      Descrição Detalhada do Projeto *
                    </label>
                    <textarea 
                      rows="3"
                      required
                      placeholder="Descreva como o serviço foi executado, materiais utilizados e a satisfação do cliente..."
                      value={newPortDesc}
                      onChange={(e) => setNewPortDesc(e.target.value)}
                      data-testid="add-portfolio-description"
                      className="w-full bg-[#191919] border border-[#465242] py-2 px-3 text-[#E0DCD1] placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[#E0DCD1] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addingPortfolio}
                    data-testid="add-portfolio-submit-btn"
                    className="px-6 py-2.5 bg-[#E0DCD1] text-[#191919] font-bold text-xs uppercase tracking-widest border border-[#E0DCD1] hover:bg-transparent hover:text-white disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> {addingPortfolio ? "Adicionando..." : "Adicionar Projeto"}
                  </button>
                </form>
              </div>

              {/* Portfolio Listing */}
              <div className="bg-[#1f1f1f] border border-[#465242] p-8 space-y-6">
                <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-white border-b border-[#465242] pb-3">
                  Seus Trabalhos Postados ({user.portfolio?.length || 0})
                </h2>

                {!user.portfolio || user.portfolio.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-light py-4 text-center">
                    Você ainda não adicionou nenhum projeto ao portfólio. Cadastre um acima!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.portfolio.map((port) => (
                      <div 
                        key={port.id} 
                        className="border border-[#465242] bg-[#191919] overflow-hidden flex flex-col justify-between"
                      >
                        {port.image_url && (
                          <img 
                            src={port.image_url} 
                            alt={port.title}
                            className="w-full h-32 object-cover border-b border-[#465242]"
                          />
                        )}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <h3 className="font-bold text-white text-sm truncate">{port.title}</h3>
                            <p className="text-xs text-muted-foreground font-light line-clamp-3">{port.description}</p>
                          </div>
                          
                          <div className="text-right border-t border-[#465242]/30 pt-3">
                            <button
                              onClick={() => handleDeletePortfolio(port.id)}
                              data-testid={`delete-portfolio-btn-${port.id}`}
                              className="px-2.5 py-1 bg-red-950/20 border border-red-950 text-red-400 text-[10px] uppercase font-bold hover:bg-red-950 hover:text-white transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <Trash2 className="w-3 h-3" /> Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VAGAS / OPPORTUNITIES VIEW */}
          {activeTab === "vagas" && (
            <div className="bg-[#1f1f1f] border border-[#465242] p-8 space-y-6 text-left animate-fade-in">
              <div>
                <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-white border-b border-[#465242] pb-3 mb-1">
                  Pedidos de Clientes de Montes Claros
                </h2>
                <p className="text-xs text-muted-foreground font-light">
                  Abaixo estão listadas as demandas ativas cadastradas pelos contratantes locais. Entre em contato com eles diretamente!
                </p>
              </div>

              {loadingDemands ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#E0DCD1]"></div>
                  <p className="text-xs text-muted-foreground font-light">Carregando oportunidades...</p>
                </div>
              ) : demands.length === 0 ? (
                <p className="text-xs text-muted-foreground py-10 text-center font-light border border-dashed border-[#465242]">
                  Nenhum pedido de serviço ativo encontrado no mercado. Volte mais tarde!
                </p>
              ) : (
                <div className="space-y-4">
                  {demands.map((demand) => {
                    const cleanPhone = demand.client_phone ? demand.client_phone.replace(/[^0-9]/g, "") : "";
                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Olá, ${demand.client_name}! Vi seu anúncio no NexoMoc sobre "${demand.title}" e estou muito interessado em executar o trabalho.`
                    )}`;
                    return (
                      <div 
                        key={demand.demand_id} 
                        className="p-5 border border-[#465242] bg-[#191919] space-y-4 hover:border-[#E0DCD1]/30 transition-all"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#465242]/20 pb-2">
                          <div>
                            <span className="px-2 py-0.5 bg-[#465242]/30 border border-[#465242] text-[#E0DCD1] text-[9px] uppercase tracking-wider">
                              {demand.category}
                            </span>
                            <h3 className="font-bold text-white text-sm mt-1">{demand.title}</h3>
                          </div>
                          
                          <div className="text-xs font-bold text-[#bebaa9]">
                            Orçamento: {demand.budget}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground font-light leading-relaxed">
                          {demand.description}
                        </p>

                        <div className="pt-2 border-t border-[#465242]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-[10px] text-muted-foreground font-light">
                            Anunciado por: <span className="font-medium text-white">{demand.client_name}</span>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <a 
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid={`opportunity-whatsapp-btn-${demand.demand_id}`}
                              className="flex-1 sm:flex-initial text-center px-3 py-1.5 bg-[#465242] text-white text-[10px] uppercase font-bold hover:bg-[#5d6d58] transition-all flex items-center justify-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> WhatsApp
                            </a>
                            <a 
                              href={`mailto:${demand.client_email}`}
                              data-testid={`opportunity-email-btn-${demand.demand_id}`}
                              className="flex-1 sm:flex-initial text-center px-3 py-1.5 bg-transparent border border-[#465242] text-[#E0DCD1] text-[10px] uppercase font-bold hover:border-[#E0DCD1] transition-all flex items-center justify-center gap-1"
                            >
                              <Mail className="w-3 h-3" /> E-mail
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
