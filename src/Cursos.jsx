import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

const API_URL = "/api";
const NAMESPACE = "https://social-insper.com/";

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    instructor: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  // 1. Depois do login, pega o token e descobre se é ADMIN
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

  // 2. Com o token em mãos, busca os cursos
  useEffect(() => {
    if (token) {
      fetchCursos();
    }
  }, [token]);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Erro ao buscar cursos: ${response.status}`);
      }
      const data = await response.json();
      setCursos(Array.isArray(data) ? data : []);
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

    if (!formData.code || !formData.name || !formData.instructor) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar curso: ${response.status}`);
      }

      const novoCurso = await response.json();
      setCursos((prev) => [...prev, novoCurso]);
      setFormData({ code: "", name: "", instructor: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCurso = async (id) => {
    try {
      setError("");
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir curso: ${response.status}`);
      }

      setCursos((prev) => prev.filter((c) => c.id !== id));
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
          <h1 className="text-3xl font-bold mb-4">Cursos</h1>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header com usuário logado */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Cursos</h1>
            <p className="text-gray-600">
              {user.email}{" "}
              <span className="inline-block ml-2 px-2 py-0.5 bg-blue-500 text-white text-sm rounded">
                {isAdmin ? "ADMIN" : "USER"}
              </span>
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Formulário (só ADMIN) */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Cadastrar Curso</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Código do curso
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Ex: PS2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do curso
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Projeto de Software"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do instrutor
                </label>
                <input
                  type="text"
                  id="instructor"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  placeholder="Ex: Eduardo Zambom"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
              >
                {submitting ? "Cadastrando..." : "Cadastrar Curso"}
              </button>
            </form>
          </div>
        )}

        {/* Lista */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Cursos Cadastrados</h2>
            <button
              onClick={fetchCursos}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Recarregar
            </button>
          </div>

          {loading ? (
            <p className="text-gray-600">Carregando cursos...</p>
          ) : cursos.length === 0 ? (
            <p className="text-gray-600">Nenhum curso cadastrado ainda.</p>
          ) : (
            <div className="grid gap-4">
              {cursos.map((curso) => (
                <div key={curso.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {curso.code} — {curso.name}
                      </h3>
                      <p className="text-gray-600">
                        <span className="font-medium">Instrutor:</span> {curso.instructor}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Status:</span> {curso.status}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Cadastrado em:</span> {formatarData(curso.createdAt)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Cadastrado por:</span> {curso.adminEmail}
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => deleteCurso(curso.id)}
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
