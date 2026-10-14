import type { ContentStatus } from "@/lib/content-visibility";

/**
 * The labels say what will happen to the item, not just "save": editing a
 * draft and pressing a plain "Salvar" published it, and "Salvar rascunho" on
 * a published item quietly took it off the site.
 */
export function publishingButtonLabels({
  mode,
  currentStatus,
  scheduleEnabled,
}: {
  mode: "create" | "edit";
  currentStatus: ContentStatus;
  scheduleEnabled: boolean;
}) {
  const isLive = mode === "edit" && currentStatus === "published";

  return {
    draft: isLive ? "Tirar do ar (rascunho)" : "Salvar rascunho",
    primary: scheduleEnabled
      ? "Agendar publicação"
      : isLive
        ? "Salvar alterações"
        : "Publicar",
  };
}
