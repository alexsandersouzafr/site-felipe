import Link from "next/link";

export function AdminSectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl tracking-tight">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Esta seção será implementada na próxima issue.{" "}
        <Link href="/admin" className="underline underline-offset-4">
          Voltar ao início
        </Link>
      </p>
    </div>
  );
}
