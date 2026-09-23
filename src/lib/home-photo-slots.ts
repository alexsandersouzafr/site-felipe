export const HOME_PHOTO_SLOTS = [
  {
    key: "hero",
    label: "Foto de abertura",
    help: "A primeira imagem da página inicial, no topo. Aparece sozinha, sem texto por cima.",
  },
  {
    key: "band_1",
    label: "Foto entre seções 1",
    help: "Aparece na largura toda, entre o primeiro e o segundo bloco da página inicial.",
  },
  {
    key: "band_2",
    label: "Foto entre seções 2",
    help: "Aparece na largura toda, entre o segundo e o terceiro bloco da página inicial.",
  },
] as const;

export type HomePhotoSlot = (typeof HOME_PHOTO_SLOTS)[number]["key"];

export function isHomePhotoSlot(value: string): value is HomePhotoSlot {
  return HOME_PHOTO_SLOTS.some((slot) => slot.key === value);
}
