/**
 * Feedback that has to survive the redirect a save ends with. The action puts a
 * code in the URL, the admin layout turns it into a toast and cleans the URL.
 */
export const TOAST_PARAM = "toast";

export const ADMIN_TOASTS = {
  saved: { tone: "success", message: "Alterações salvas." },
  created: { tone: "success", message: "Conteúdo criado." },
  deleted: { tone: "success", message: "Conteúdo excluído." },
  "save-error": {
    tone: "error",
    message: "Não foi possível salvar. Tente novamente.",
  },
  "delete-error": {
    tone: "error",
    message: "Não foi possível excluir. Tente novamente.",
  },
  "featured-error": {
    tone: "error",
    message: "Não foi possível atualizar o destaque do evento.",
  },
  "order-error": {
    tone: "error",
    message: "Não foi possível reordenar a lista.",
  },
} as const;

export type AdminToastCode = keyof typeof ADMIN_TOASTS;
export type AdminToastTone = (typeof ADMIN_TOASTS)[AdminToastCode]["tone"];

export function isAdminToastCode(value: string): value is AdminToastCode {
  return Object.hasOwn(ADMIN_TOASTS, value);
}

/** `/admin/fotos` → `/admin/fotos?toast=saved`, for `redirect()` in an action. */
export function withToast(path: string, code: AdminToastCode) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${TOAST_PARAM}=${code}`;
}
