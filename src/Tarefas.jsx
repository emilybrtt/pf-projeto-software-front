import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

const API_URL = "/api";
const NAMESPACE = "https://social-insper.com/";

export default function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    prioridade: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchTokenAndRoles = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);

        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const roles = payload[`${NAMESPACE}roles`] || [];
        setIsAdmin(roles.includes("ADMIN"));
      } catch (e) {
        console.error("Erro ao buscar token:", e);
      }
    };

    if (isAuthenticated) {
      fetchTokenAndRoles();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (token) {
      fetchTarefas();
    }
  }, [token]);

  const fetchTarefas = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/tarefas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Erro ao buscar tarefas: ${response.status}`);
      }
      const data = await response.json();
      setTarefas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descricao || formData.prioridade === "") {
      setError("Todos os campos são obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_URL}/tarefas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          prioridade: Number(formData.prioridade),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar tarefa: ${response.status}`);
      }

      const novaTarefa = await response.json();
      setTarefas((prev) => [...prev, novaTarefa]);
      setFormData({ titulo: "", descricao:"", prioridade: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTarefa = async (id) => {
    try {
      setError("");
      const response = await fetch(`${API_URL}/tarefas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir tarefa: ${response.status}`);
      }

      setTarefas((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return "-";
    return new Date(dataString).toLocaleString("pt-BR");
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 font-sans">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Tarefas</h1>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tarefas</h1>
            <p className="text-gray-600">
              {user.email}{" "}
              <span className="inline-block ml-2 px-2 py-0.5 bg-blue-500 text-white text-sm rounded">
                {isAdmin ? "ADMIN" : "USER"}
              </span>
            </p>
          </div>
          <LogoutButton />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Cadastrar Tarefa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Ex: Revisar PR"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Ex: Ler linha a linha e revisar."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade (1 a 5)
                </label>
                <input
                  type="number"
                  id="prioridade"
                  name="prioridade"
                  min="1"
                  max="5"
                  value={formData.prioridade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
              >
                {submitting ? "Cadastrando..." : "Cadastrar Tarefa"}
              </button>
            </form>
          </div>
    

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Tarefas Cadastradas</h2>
            <button
              onClick={fetchTarefas}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Recarregar
            </button>
          </div>

          {loading ? (
            <p className="text-gray-600">Carregando tarefas...</p>
          ) : tarefas.length === 0 ? (
            <p className="text-gray-600">Nenhuma tarefa cadastrada ainda.</p>
          ) : (
            <div className="grid gap-4">
              {tarefas.map((tarefa) => (
                <div key={tarefa.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tarefa.titulo} — prioridade {tarefa.prioridade}
                      </h3>
                      <p className="text-gray-600">
                        <span className="font-medium">Criada em:</span> {formatarData(tarefa.dataCriacao)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Responsável:</span> {tarefa.emailResponsavel}
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => deleteTarefa(tarefa.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
