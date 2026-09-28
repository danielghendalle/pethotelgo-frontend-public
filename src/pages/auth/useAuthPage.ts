import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/useAuthHook";
import { useToast } from "@/hooks/use-toast";
import {
  isValidEmail,
  isValidPassword,
  passwordsMatch,
} from "@/utils/validation";

// Must match the backend's minimum (AuthServiceImpl.MIN_PASSWORD_LENGTH).
const REGISTER_MIN_PASSWORD_LENGTH = 8;

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

const registerSchema = loginSchema
  .extend({
    name: z
      .string()
      .trim()
      .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
      .max(100),
    password: z.string().min(REGISTER_MIN_PASSWORD_LENGTH, {
      message: `Senha deve ter no mínimo ${REGISTER_MIN_PASSWORD_LENGTH} caracteres`,
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

type AuthMode = "login" | "register";
type AuthFormData = z.infer<typeof loginSchema> &
  (AuthMode extends "register"
    ? { name: string; confirmPassword: string }
    : {});

interface UseAuthProps {
  redirectTo?: string;
}

export function useAuthPage({ redirectTo = "/dashboard" }: UseAuthProps = {}) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const minPasswordLength =
      mode === "register" ? REGISTER_MIN_PASSWORD_LENGTH : 6;

    if (!isValidEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!isValidPassword(formData.password, minPasswordLength)) {
      newErrors.password = `Senha deve ter no mínimo ${minPasswordLength} caracteres`;
    }

    if (mode === "register") {
      if (formData.name.trim().length < 2) {
        newErrors.name = "Nome deve ter no mínimo 2 caracteres";
      }

      if (!passwordsMatch(formData.password, formData.confirmPassword)) {
        newErrors.confirmPassword = "Senhas não conferem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === "login") {
        await login({
          email: formData.email,
          password: formData.password,
        });
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Sua conta foi criada com sucesso.",
        });
      }

      navigate(redirectTo);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return {
    mode,
    isLoading,
    showPassword,
    errors,
    formData,
    handleChange,
    handleSubmit,
    toggleMode,
    togglePasswordVisibility,
  };
}
