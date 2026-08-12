"use client";

import { ListIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { AdminNavIcon } from "@/components/admin/admin-nav-icon";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type AdminNavIconName, adminNavItems } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

function navItemClassName(isActive: boolean) {
  return cn(
    "w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

function NavItemContent({
  label,
  icon,
  isActive,
}: {
  label: string;
  icon: AdminNavIconName;
  isActive: boolean;
}) {
  return (
    <span className="flex items-center gap-3">
      <AdminNavIcon
        name={icon}
        className={cn(
          "size-4",
          isActive ? "text-primary-foreground" : "text-primary",
        )}
        weight={isActive ? "duotone" : "regular"}
      />
      <span className="font-medium">{label}</span>
    </span>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Navegação do painel">
      {adminNavItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={navItemClassName(isActive)}
          >
            <NavItemContent
              label={item.label}
              icon={item.icon}
              isActive={isActive}
            />
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const router = useRouter();

  return (
    <nav className="flex flex-col gap-1" aria-label="Navegação do painel">
      {adminNavItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <SheetClose
            key={item.href}
            variant="ghost"
            className={cn(navItemClassName(isActive), "h-auto justify-start")}
            onPress={() => router.push(item.href)}
          >
            <NavItemContent
              label={item.label}
              icon={item.icon}
              isActive={isActive}
            />
          </SheetClose>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_oklch(0.97_0.02_20),_transparent_40%),var(--background)] text-foreground dark:bg-[radial-gradient(circle_at_top_left,_oklch(0.28_0.03_20),_transparent_45%),var(--background)]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[16rem_1fr]">
        <aside className="hidden border-r border-border/80 px-4 py-6 lg:block">
          <div className="mb-8 space-y-1 px-2">
            <p className="font-heading text-xl tracking-tight">Painel</p>
            <p className="text-sm text-muted-foreground">
              Gestão do site do maestro
            </p>
          </div>
          <DesktopNav pathname={pathname} />
          <div className="mt-8 px-2">
            <SignOutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur lg:px-8">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <SheetTrigger>
                  <Button variant="outline" size="icon" aria-label="Abrir menu">
                    <ListIcon className="size-4" />
                  </Button>
                  <SheetContent side="left" className="w-[18rem] p-4">
                    <SheetHeader className="mb-4 px-0 text-left">
                      <SheetTitle>Painel</SheetTitle>
                    </SheetHeader>
                    <MobileNav pathname={pathname} />
                    <div className="mt-8">
                      <SignOutButton />
                    </div>
                  </SheetContent>
                </SheetTrigger>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-lg tracking-tight lg:hidden">
                  Painel
                </p>
                <p className="hidden text-sm text-muted-foreground sm:block">
                  Conteúdo, agenda, mídia e mensagens
                </p>
              </div>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
