"use client";

import { ListIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { AdminNavIcon } from "@/components/admin/admin-nav-icon";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  type AdminNavIconName,
  type AdminNavItem,
  adminNavGroups,
  adminNavItems,
  isAdminNavItemActive,
} from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

function navItemClassName(isActive: boolean) {
  return cn(
    "flex w-full items-center gap-3 border-l-2 px-3 py-1.5 text-left text-sm transition-colors",
    isActive
      ? "border-primary bg-muted/60 font-medium text-foreground"
      : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground",
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
    <>
      <AdminNavIcon
        name={icon}
        className={cn("size-4", isActive ? "text-primary" : "text-current")}
        weight={isActive ? "duotone" : "regular"}
      />
      <span>{label}</span>
    </>
  );
}

function NavSectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1.5 text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

/** Home shortcut followed by the menu sections; `renderItem` builds each link. */
function NavSections({
  pathname,
  renderItem,
}: {
  pathname: string;
  renderItem: (item: AdminNavItem, isActive: boolean) => React.ReactNode;
}) {
  const home = adminNavItems.find((item) => item.href === "/admin");

  return (
    <nav className="flex flex-col gap-6" aria-label="Navegação do painel">
      {home ? (
        <div>{renderItem(home, isAdminNavItemActive(home.href, pathname))}</div>
      ) : null}
      {adminNavGroups.map((group) => (
        <div key={group.label}>
          <NavSectionLabel>{group.label}</NavSectionLabel>
          <div className="flex flex-col">
            {group.items.map((item) =>
              renderItem(item, isAdminNavItemActive(item.href, pathname)),
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <NavSections
      pathname={pathname}
      renderItem={(item, isActive) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          className={navItemClassName(isActive)}
        >
          <NavItemContent
            label={item.label}
            icon={item.icon}
            isActive={isActive}
          />
        </Link>
      )}
    />
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const router = useRouter();

  return (
    <NavSections
      pathname={pathname}
      renderItem={(item, isActive) => (
        <SheetClose
          key={item.href}
          variant="ghost"
          className={cn(
            navItemClassName(isActive),
            "h-auto justify-start rounded-none border-y-0 border-r-0",
          )}
          onPress={() => router.push(item.href)}
        >
          <NavItemContent
            label={item.label}
            icon={item.icon}
            isActive={isActive}
          />
        </SheetClose>
      )}
    />
  );
}

/** "Painel / Conteúdo / Agenda": where the current screen sits in the menu. */
function Breadcrumb({ pathname }: { pathname: string }) {
  const current = [...adminNavItems]
    .reverse()
    .find((item) => isAdminNavItemActive(item.href, pathname));
  const trail = [current?.group, current?.label].filter(Boolean) as string[];

  return (
    <ol className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <li className="font-heading text-base text-foreground lg:hidden">
        Painel
      </li>
      {trail.map((label, index) => (
        <li
          key={label}
          className={cn(
            "flex items-center gap-2 truncate",
            index === trail.length - 1 && "text-foreground",
            index < trail.length - 1 && "hidden sm:flex",
          )}
        >
          <span
            aria-hidden="true"
            className={cn("text-border", index === 0 && "lg:hidden")}
          >
            /
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-area min-h-svh bg-background text-foreground">
      <div className="mx-auto grid min-h-svh max-w-7xl lg:grid-cols-[16rem_1fr]">
        <aside className="sticky top-0 hidden h-svh flex-col border-r border-border/80 px-4 py-6 lg:flex">
          <div className="mb-8 shrink-0 space-y-1 border-b border-border/80 px-3 pb-6">
            <p className="font-heading text-xl tracking-tight">Painel</p>
            <p className="text-sm text-muted-foreground">
              Gestão do site de Felipe Magalhães
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <DesktopNav pathname={pathname} />
          </div>
          <div className="mt-6 shrink-0 px-3">
            <SignOutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border/80 bg-background/90 px-4 backdrop-blur lg:px-8">
            <div className="flex w-full items-center gap-3">
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
                <Breadcrumb pathname={pathname} />
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
