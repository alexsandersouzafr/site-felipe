import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sessao?: string }>;
}) {
  const { error, sessao } = await searchParams;

  return (
    <LoginForm
      unauthorized={error === "unauthorized"}
      sessionExpired={sessao === "expirada"}
    />
  );
}
