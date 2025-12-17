"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "organizer" | "participant";
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [editingName, setEditingName] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  useEffect(() => {
    // Aguardar o carregamento da autenticação antes de verificar
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    loadProfile();
  }, [isAuthenticated, isAuthLoading, router]);

  async function loadProfile() {
    try {
      const response = await api.get<UserProfile>("/users/me");
      setProfile(response.data);
      setName(response.data.name);
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast("Erro ao carregar perfil", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateName() {
    if (!profile || !name.trim() || name === profile.name) {
      setEditingName(false);
      setName(profile?.name || "");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put<UserProfile>(`/users/${profile.id}`, { name });
      setProfile(response.data);

      // Update localStorage
      const storedUser = localStorage.getItem("@EventSync:user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.name = response.data.name;
        localStorage.setItem("@EventSync:user", JSON.stringify(userData));
      }

      showToast("Nome atualizado com sucesso!", "success");
      setEditingName(false);

      // Reload page to update header
      window.location.reload();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || "Erro ao atualizar nome", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdatePassword() {
    if (!profile) return;

    if (!currentPassword || !newPassword) {
      showToast("Preencha a senha atual e a nova senha", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("As senhas não conferem", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("A nova senha deve ter pelo menos 6 caracteres", "error");
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/users/${profile.id}`, {
        currentPassword,
        newPassword,
      });
      showToast("Senha atualizada com sucesso!", "success");
      setEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || "Erro ao atualizar senha", "error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

        <div className="space-y-6">
          {/* Informações do perfil */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Pessoais
            </h2>

            <div className="space-y-4">
              {/* Email (não editável) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                  {profile.email}
                </div>
              </div>

              {/* Tipo de conta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Conta
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.role === "organizer"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {profile.role === "organizer" ? "Organizador" : "Participante"}
                  </span>
                </div>
              </div>

              {/* Nome (editável) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                {editingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleUpdateName}
                      disabled={isSaving}
                      isLoading={isSaving}
                      size="sm"
                    >
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingName(false);
                        setName(profile.name);
                      }}
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{profile.name}</span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alterar senha */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Segurança
            </h2>

            {editingPassword ? (
              <div className="space-y-4">
                <Input
                  label="Senha Atual"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
                <Input
                  label="Nova Senha"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                />
                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={isSaving}
                    isLoading={isSaving}
                  >
                    Alterar Senha
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Senha</p>
                  <p className="text-sm text-gray-400">••••••••</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditingPassword(true)}
                >
                  Alterar Senha
                </Button>
              </div>
            )}
          </div>

          {/* Informações da conta */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações da Conta
            </h2>
            <div className="text-sm text-gray-600">
              <p>
                Conta criada em:{" "}
                <span className="text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
