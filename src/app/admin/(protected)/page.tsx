import { SignOutButton } from "@/components/admin/sign-out-button";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl tracking-tight">Bem-vindo</h1>
        <p className="max-w-2xl text-muted-foreground">
          Você está autenticado. As próximas issues adicionam a navegação e os
          CRUDs de conteúdo.
        </p>
      </div>
      <SignOutButton />
    </div>
  );
}
