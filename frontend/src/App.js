import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { AuthCallback } from "./components/AuthCallback";
import Home from "./components/Home";
import FreelancerProfile from "./components/FreelancerProfile";
import Dashboard from "./components/Dashboard";
import VagasBoard from "./components/VagasBoard";
import CategoryPage from "./components/CategoryPage";
import { CATEGORY_SLUGS } from "./data/categories";
import { Toaster } from "sonner";
import "@/App.css";

function AppRouter() {
  const location = useLocation();

  // CRITICAL SYNCHRONOUS ROUTING CHECK FOR OAUTH CALLBACK
  // This synchronous check prevents race conditions by processing session_id FIRST before checking existing session_token
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/freelancer/:user_id" element={<FreelancerProfile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/vagas" element={<VagasBoard />} />
      {/* SEO-friendly category landing pages */}
      {CATEGORY_SLUGS.map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<CategoryPage slug={slug} />} />
      ))}
      {/* Fallback route */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App bg-[#191919] min-h-screen text-[#E0DCD1]">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
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
