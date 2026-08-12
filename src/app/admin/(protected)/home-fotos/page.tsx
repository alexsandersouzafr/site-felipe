import { saveHomePhotoSlots } from "@/app/admin/(protected)/home-fotos/actions";
import { AdminPageHeader } from "@/components/admin/admin-list";
import {
  HomePhotoSlotsForm,
  type HomePhotoSlotValue,
} from "@/components/admin/home-photo-slots-form";
import { HOME_PHOTO_SLOTS, type HomePhotoSlot } from "@/lib/home-photo-slots";
import { DEFAULT_IMAGE_FOCUS } from "@/lib/image-focus";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePhotosPage() {
  const supabase = await createClient();
  const photosResult = await supabase
    .from("home_photos")
    .select("slot, storage_path, alt_pt, alt_en, alt_es, object_position");

  const slots = Object.fromEntries(
    HOME_PHOTO_SLOTS.map((slot) => [
      slot.key,
      {
        storagePath: null,
        altPt: "",
        altEn: null,
        altEs: null,
        objectPosition: DEFAULT_IMAGE_FOCUS,
      } satisfies HomePhotoSlotValue,
    ]),
  ) as Record<HomePhotoSlot, HomePhotoSlotValue>;

  for (const row of photosResult.data ?? []) {
    const key = row.slot as HomePhotoSlot;
    if (key in slots) {
      slots[key] = {
        storagePath: row.storage_path,
        altPt: row.alt_pt,
        altEn: row.alt_en,
        altEs: row.alt_es,
        objectPosition: row.object_position || DEFAULT_IMAGE_FOCUS,
      };
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Fotos da home"
        description="Capa/hero da home e faixas de parallax entre as seções de conteúdo."
      />
      {photosResult.error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar as fotos da home.
        </p>
      ) : (
        <HomePhotoSlotsForm action={saveHomePhotoSlots} initialSlots={slots} />
      )}
    </div>
  );
}
