import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext";

export function AuthCallback() {
  const { setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setError("Token de sessão ausente na URL.");
      return;
    }

    const exchangeSession = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/auth/session`, {
          params: { session_id: sessionId },
          withCredentials: true
        });
        
        const { user, session_token } = response.data;
        // Save session_token to localStorage as a fallback for authorization header
        localStorage.setItem("session_token", session_token);
        
        setUser(user);
        navigate("/dashboard", { replace: true, state: { user } });
      } catch (err) {
        console.error("Auth session exchange failed", err);
        setError("Erro ao autenticar com o Google. Tente novamente.");
      }
    };

    exchangeSession();
  }, [location, navigate, setUser]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919] text-[#E0DCD1] p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => navigate("/")}
          data-testid="callback-error-back-btn"
          className="px-6 py-2 bg-[#E0DCD1] text-[#191919] font-bold rounded hover:bg-transparent hover:text-[#E0DCD1] border border-[#E0DCD1] transition-all"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919] text-[#E0DCD1] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E0DCD1]"></div>
      <p className="font-light tracking-wider text-sm">Autenticando com o Google...</p>
    </div>
  );
}
