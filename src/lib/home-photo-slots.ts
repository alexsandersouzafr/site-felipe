export const HOME_PHOTO_SLOTS = [
  {
    key: "hero",
    label: "Capa / hero da home",
    help: "Foto de abertura da home (somente imagem). As seções seguintes passam por cima ao rolar.",
  },
  {
    key: "band_1",
    label: "Faixa 1 (entre seções)",
    help: "Faixa de imagem fixa (~85vh) entre a primeira e a segunda seção.",
  },
  {
    key: "band_2",
    label: "Faixa 2 (entre seções)",
    help: "Faixa de imagem fixa (~85vh) entre a segunda e a terceira seção.",
  },
] as const;

export type HomePhotoSlot = (typeof HOME_PHOTO_SLOTS)[number]["key"];

export function isHomePhotoSlot(value: string): value is HomePhotoSlot {
  return HOME_PHOTO_SLOTS.some((slot) => slot.key === value);
}
