import React, { useState } from "react";
import Footer from "../components/Footer";

type FormFields = {
  box: string;
  categoria: string;
  cidade: string;
  displayName: string;
  email: string;
  telefone: string;
  mensagem: string;
};

export default function LandingCadastro() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<FormFields>({
    box: "",
    categoria: "",
    cidade: "",
    displayName: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      setStatus("success");
      setMsg("Cadastro enviado com sucesso!");
      setForm({
        box: "",
        categoria: "",
        cidade: "",
        displayName: "",
        email: "",
        telefone: "",
        mensagem: "",
      });
    } catch {
      setStatus("error");
      setMsg("Erro ao enviar. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/bg_main.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#0a0a1a]/90" />
      </div>
      <img
        src="/logos/oficial_logo.png"
        alt="CERRADO INTERBØX"
        className="object-contain z-20 mb-4 mx-auto w-48 md:w-64 md:absolute md:top-8 md:left-1/2 md:-translate-x-1/2"
        draggable="false"
      />
        <div className="relative z-10 w-full max-w-md mx-auto mt-4 md:mt-40 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-6 drop-shadow-lg">
          Ecosistema<br />
          <span className="text-pink-500">CERRADO INTERBØX</span>
        </h1>
        <form
          className="w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-4 border border-white/30"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {[
            { name: "box", label: "Nome da academia/box", placeholder: "Ex: Interbox Brasília" },
            { name: "cidade", label: "Cidade", placeholder: "Ex: Brasília" },
            { name: "displayName", label: "Nome completo", placeholder: "Seu nome" },
            { name: "email", label: "Email", type: "email", placeholder: "seu@email.com" },
            { name: "telefone", label: "Celular (WhatsApp)", placeholder: "(99) 99999-9999" }
          ].map(({ name, label, type = "text", placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-gray-800 mb-1">{label}</label>
              <input
                name={name}
                type={type}
                required={name !== "mensagem"}
                value={form[name as keyof FormFields] as string}
                onChange={handleChange}
                className="w-full border border-pink-300 rounded px-3 py-2 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder={placeholder}
      />
    </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Categoria</label>
            <select
              name="categoria"
              required
              value={form.categoria}
              onChange={handleChange}
              className="w-full border border-pink-300 rounded px-3 py-2 bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="">Selecione</option>
              <option value="atleta">Atleta</option>
              <option value="judge">Judge</option>
              <option value="midia">Audiovisual e Creators</option>
              <option value="espectador">Torcida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Mensagem</label>
            <textarea
              name="mensagem"
              rows={3}
              value={form.mensagem}
              onChange={handleChange}
              className="w-full border border-pink-300 rounded px-3 py-2 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Deixe sua mensagem"
            ></textarea>
      </div>

          <div className="text-center text-sm min-h-[1.5em]">
            {status === "success" && <span className="text-pink-600 font-bold">{msg}</span>}
            {status === "error" && <span className="text-red-500 font-bold">{msg}</span>}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-pink-500 text-white font-extrabold py-2 rounded-xl hover:bg-pink-400 transition disabled:opacity-50 shadow-lg text-lg tracking-wide"
          >
            {status === "loading" ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
