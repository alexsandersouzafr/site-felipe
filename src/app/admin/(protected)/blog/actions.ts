"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  optionalText,
  readLocalizedPair,
  readPublishingFields,
  requireScheduledPublishAt,
} from "@/lib/admin-form";
import { withToast } from "@/lib/admin-toast";
import { type BlogBlock, blogBlocksSchema } from "@/lib/blog-blocks";
import { deleteUnusedMedia } from "@/lib/media-cleanup";
import { validateImageFile } from "@/lib/media-limits";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

export type BlogActionState = {
  error?: string;
};

async function uploadBlogImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  folder: "blog/covers" | "blog/blocks",
) {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    return { ok: false as const, error: "Não foi possível enviar a imagem." };
  }

  return { ok: true as const, path };
}

async function resolveBlocks(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const raw = formData.get("blocks");
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return {
      ok: false as const,
      error: "Adicione ao menos um bloco ao post.",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false as const, error: "Blocos do post inválidos." };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return {
      ok: false as const,
      error: "Adicione ao menos um bloco ao post.",
    };
  }

  const blocks: BlogBlock[] = [];

  for (const item of parsed) {
    if (!item || typeof item !== "object" || !("type" in item)) {
      return { ok: false as const, error: "Blocos do post inválidos." };
    }

    const block = item as BlogBlock;

    if (block.type === "image") {
      const file = formData.get(`blockImage-${block.id}`);
      let storagePath = block.storagePath?.trim() ?? "";

      if (file instanceof File && file.size > 0) {
        const uploaded = await uploadBlogImage(supabase, file, "blog/blocks");
        if (!uploaded.ok) {
          return uploaded;
        }
        storagePath = uploaded.path;
      }

      if (!storagePath) {
        return {
          ok: false as const,
          error: "Envie uma imagem para cada bloco de imagem.",
        };
      }

      blocks.push({
        ...block,
        storagePath,
      });
      continue;
    }

    blocks.push(block);
  }

  const validated = blogBlocksSchema.safeParse(blocks);
  if (!validated.success) {
    return {
      ok: false as const,
      error: validated.error.issues[0]?.message ?? "Blocos do post inválidos.",
    };
  }

  return { ok: true as const, data: validated.data };
}

async function resolveCoverPath(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const file = formData.get("coverFile");
  if (file instanceof File && file.size > 0) {
    return uploadBlogImage(supabase, file, "blog/covers");
  }

  const existing = optionalText(formData, "coverImagePath");
  return { ok: true as const, path: existing };
}

async function parseBlogForm(formData: FormData) {
  const { status, publishAt } = readPublishingFields(formData);
  const scheduleError = requireScheduledPublishAt(status, publishAt);

  if (scheduleError) {
    return { ok: false as const, error: scheduleError };
  }

  const titles = readLocalizedPair(formData, {
    pt: "titlePt",
    en: "titleEn",
    fr: "titleFr",
  });

  if (!titles.pt) {
    return {
      ok: false as const,
      error: "O título em português é obrigatório.",
    };
  }

  const supabase = await createClient();
  const cover = await resolveCoverPath(formData, supabase);
  if (!cover.ok) {
    return cover;
  }

  const blocks = await resolveBlocks(formData, supabase);
  if (!blocks.ok) {
    return blocks;
  }

  return {
    ok: true as const,
    data: {
      status,
      publish_at: publishAt,
      title_pt: titles.pt,
      title_en: titles.en,
      title_fr: titles.fr,
      blocks: blocks.data,
      cover_image_path: cover.path,
      updated_at: new Date().toISOString(),
    },
  };
}

/** Every file a stored post points at: its cover and its image blocks. */
function postMediaPaths(row: {
  cover_image_path?: string | null;
  blocks?: unknown;
}) {
  const paths = new Set<string>();

  if (row.cover_image_path) {
    paths.add(row.cover_image_path);
  }

  for (const block of Array.isArray(row.blocks) ? row.blocks : []) {
    const storagePath =
      block && typeof block === "object" && "storagePath" in block
        ? (block as { storagePath?: unknown }).storagePath
        : null;

    if (typeof storagePath === "string" && storagePath) {
      paths.add(storagePath);
    }
  }

  return paths;
}

async function readPostMedia(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
) {
  const { data } = await supabase
    .from("news_items")
    .select("cover_image_path, blocks")
    .eq("id", id)
    .maybeSingle();

  return data ? postMediaPaths(data) : new Set<string>();
}

export async function createBlogPost(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const parsed = await parseBlogForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const slug = slugify(parsed.data.title_pt);
  if (!slug) {
    return { error: "Não foi possível gerar um slug a partir do título." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("news_items").insert({
    ...parsed.data,
    slug,
  });

  if (error) {
    return { error: "Não foi possível criar o post." };
  }

  revalidatePath("/admin/blog");
  redirect(withToast("/admin/blog", "saved"));
}

export async function updateBlogPost(
  id: string,
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const parsed = await parseBlogForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const previousPaths = await readPostMedia(supabase, id);

  const { error } = await supabase
    .from("news_items")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar o post." };
  }

  // A cover that was swapped, or an image block that was taken out, leaves a
  // file nothing points at any more.
  const currentPaths = postMediaPaths(parsed.data);
  for (const path of previousPaths) {
    if (!currentPaths.has(path)) {
      await deleteUnusedMedia(supabase, path);
    }
  }

  revalidatePath("/admin/blog");
  redirect(withToast("/admin/blog", "saved"));
}

export async function deleteBlogPost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const paths = await readPostMedia(supabase, id);

  await supabase.from("news_items").delete().eq("id", id);

  for (const path of paths) {
    await deleteUnusedMedia(supabase, path);
  }

  revalidatePath("/admin/blog");
  redirect(withToast("/admin/blog", "deleted"));
}
