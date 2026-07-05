import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import Home from "./components/Home";
import FreelancerProfile from "./components/FreelancerProfile";
import FreelancerForm from "./components/FreelancerForm";
import ClientForm from "./components/ClientForm";
import Dashboard from "./components/Dashboard";
import VagasBoard from "./components/VagasBoard";
import CategoryPage from "./components/CategoryPage";
import { CATEGORY_SLUGS } from "./data/categories";
import { Toaster } from "sonner";
import "@/App.css";

function App() {
  return (
    <div className="App bg-[#191919] min-h-screen text-[#E0DCD1]">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/freelancer/:user_id" element={<FreelancerProfile />} />
            <Route path="/cadastrar-servico" element={<FreelancerForm />} />
            <Route path="/preciso-de-servico" element={<ClientForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vagas" element={<VagasBoard />} />
            {CATEGORY_SLUGS.map((slug) => (
              <Route key={slug} path={`/${slug}`} element={<CategoryPage slug={slug} />} />
            ))}
            <Route path="*" element={<Home />} />
          </Routes>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f1f1f',
                color: '#E0DCD1',
                border: '1px solid #465242'
              }
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
