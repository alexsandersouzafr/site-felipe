"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ImageIcon,
  ParagraphIcon,
  PlusIcon,
  TrashIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { ImageUploadField } from "@/components/admin/image-upload-field";
import { LocalizedRichTextEditor } from "@/components/admin/localized-rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type BlogBlock,
  createImageBlock,
  createParagraphBlock,
  createVideoBlock,
} from "@/lib/blog-blocks";
import { isRichTextEmpty } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

const ADMIN_STICKY_HEADER_OFFSET = 88;

function scrollBlockIntoView(element: HTMLElement) {
  const viewportHeight = window.innerHeight;
  const availableHeight = viewportHeight - ADMIN_STICKY_HEADER_OFFSET - 24;
  const fitsInView = element.getBoundingClientRect().height <= availableHeight;

  element.scrollIntoView({
    behavior: "smooth",
    block: fitsInView ? "center" : "start",
    inline: "nearest",
  });
}

function moveBlock(blocks: BlogBlock[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= blocks.length) {
    return blocks;
  }

  const next = [...blocks];
  const [item] = next.splice(index, 1);
  if (!item) {
    return blocks;
  }
  next.splice(target, 0, item);
  return next;
}

function InsertBlockBar({
  onInsert,
}: {
  onInsert: (block: BlogBlock) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-transparent px-3 py-2">
      <span className="mr-1 text-xs text-muted-foreground">Inserir</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onPress={() => onInsert(createParagraphBlock())}
      >
        <PlusIcon className="size-3.5" data-icon="inline-start" />
        <ParagraphIcon className="size-3.5" />
        Parágrafo
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onPress={() => onInsert(createImageBlock())}
      >
        <PlusIcon className="size-3.5" data-icon="inline-start" />
        <ImageIcon className="size-3.5" />
        Imagem
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onPress={() => onInsert(createVideoBlock())}
      >
        <PlusIcon className="size-3.5" data-icon="inline-start" />
        <YoutubeLogoIcon className="size-3.5" />
        Vídeo
      </Button>
    </div>
  );
}

export function BlogBlocksEditor({
  initialBlocks,
}: {
  initialBlocks?: BlogBlock[];
}) {
  const [blocks, setBlocks] = useState<BlogBlock[]>(
    initialBlocks && initialBlocks.length > 0
      ? initialBlocks
      : [createParagraphBlock()],
  );
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [focusRequestId, setFocusRequestId] = useState<string | null>(null);
  const blockRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (!focusRequestId) {
      return;
    }

    const id = focusRequestId;

    const focusAndScroll = () => {
      const element = blockRefs.current.get(id);
      if (!element) {
        return;
      }

      setActiveBlockId(id);
      element.focus({ preventScroll: true });
      scrollBlockIntoView(element);
    };

    const frame = window.requestAnimationFrame(focusAndScroll);
    // Re-align after enter animation / content layout settles.
    const timeout = window.setTimeout(() => {
      focusAndScroll();
      setFocusRequestId(null);
    }, 320);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [focusRequestId]);

  function updateBlock(id: string, updater: (block: BlogBlock) => BlogBlock) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? updater(block) : block)),
    );
  }

  function insertBlockAt(index: number, block: BlogBlock) {
    setActiveBlockId(block.id);
    setFocusRequestId(block.id);
    setBlocks((current) => {
      const next = [...current];
      next.splice(index, 0, block);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-bold">Conteúdo do post</p>
        <FieldDescription>
          Monte a postagem com parágrafos (texto rico por idioma), imagens e
          vídeos do YouTube. Use as barras antes e depois de cada bloco para
          inserir novos componentes. Português é obrigatório; EN/ES são
          opcionais.
        </FieldDescription>
      </div>

      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />

      <div className="space-y-3">
        <InsertBlockBar onInsert={(block) => insertBlockAt(0, block)} />

        {blocks.map((block, index) => (
          <div key={block.id} className="space-y-3">
            <div
              ref={(node) => {
                if (node) {
                  blockRefs.current.set(block.id, node);
                } else {
                  blockRefs.current.delete(block.id);
                }
              }}
              tabIndex={-1}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-1 space-y-4 rounded-3xl border border-border/80 bg-muted/20 p-4 fill-mode-both outline-none duration-300 transition-[box-shadow,border-color] scroll-mt-24",
                "hover:border-primary/40 hover:ring-2 hover:ring-primary/50",
                activeBlockId === block.id &&
                  "border-primary/50 ring-2 ring-primary",
              )}
              onFocusCapture={() => setActiveBlockId(block.id)}
              onBlurCapture={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                ) {
                  setActiveBlockId((current) =>
                    current === block.id ? null : current,
                  );
                }
              }}
              onPointerDown={() => setActiveBlockId(block.id)}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold">
                  {block.type === "paragraph"
                    ? "Parágrafo"
                    : block.type === "image"
                      ? "Imagem"
                      : "Vídeo"}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Item {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Mover para cima"
                    isDisabled={index === 0}
                    onPress={() =>
                      setBlocks((current) => moveBlock(current, index, -1))
                    }
                  >
                    <ArrowUpIcon className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Mover para baixo"
                    isDisabled={index === blocks.length - 1}
                    onPress={() =>
                      setBlocks((current) => moveBlock(current, index, 1))
                    }
                  >
                    <ArrowDownIcon className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Remover bloco"
                    isDisabled={blocks.length === 1}
                    onPress={() =>
                      setBlocks((current) =>
                        current.filter((item) => item.id !== block.id),
                      )
                    }
                  >
                    <TrashIcon className="size-3.5" />
                  </Button>
                </div>
              </div>

              {block.type === "paragraph" ? (
                <LocalizedRichTextEditor
                  label="Texto do parágrafo"
                  required
                  showTitles
                  titles={block.title}
                  onTitleChange={(locale, title) =>
                    updateBlock(block.id, (current) =>
                      current.type === "paragraph"
                        ? {
                            ...current,
                            title: { ...current.title, [locale]: title },
                          }
                        : current,
                    )
                  }
                  values={{
                    pt: block.body.pt,
                    en: block.body.en,
                    es: block.body.es,
                  }}
                  onChange={(locale, document) =>
                    updateBlock(block.id, (current) => {
                      if (current.type !== "paragraph") {
                        return current;
                      }

                      return {
                        ...current,
                        body: {
                          ...current.body,
                          [locale]:
                            locale === "pt"
                              ? document
                              : isRichTextEmpty(document)
                                ? null
                                : document,
                        },
                      };
                    })
                  }
                />
              ) : null}

              {block.type === "image" ? (
                <FieldGroup>
                  <ImageUploadField
                    id={`image-${block.id}`}
                    name={`blockImage-${block.id}`}
                    label="Arquivo"
                    existingPath={block.storagePath || null}
                    required={!block.storagePath}
                    description={
                      block.storagePath
                        ? "Envie outra imagem para substituir a atual."
                        : undefined
                    }
                  />
                  <Field>
                    <FieldLabel htmlFor={`caption-pt-${block.id}`}>
                      Legenda (PT)
                    </FieldLabel>
                    <Input
                      id={`caption-pt-${block.id}`}
                      value={block.caption.pt ?? ""}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "image"
                            ? {
                                ...current,
                                caption: {
                                  ...current.caption,
                                  pt: event.target.value || null,
                                },
                              }
                            : current,
                        )
                      }
                    />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`caption-en-${block.id}`}>
                        Legenda (EN)
                      </FieldLabel>
                      <Input
                        id={`caption-en-${block.id}`}
                        value={block.caption.en ?? ""}
                        onChange={(event) =>
                          updateBlock(block.id, (current) =>
                            current.type === "image"
                              ? {
                                  ...current,
                                  caption: {
                                    ...current.caption,
                                    en: event.target.value || null,
                                  },
                                }
                              : current,
                          )
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`caption-es-${block.id}`}>
                        Legenda (ES)
                      </FieldLabel>
                      <Input
                        id={`caption-es-${block.id}`}
                        value={block.caption.es ?? ""}
                        onChange={(event) =>
                          updateBlock(block.id, (current) =>
                            current.type === "image"
                              ? {
                                  ...current,
                                  caption: {
                                    ...current.caption,
                                    es: event.target.value || null,
                                  },
                                }
                              : current,
                          )
                        }
                      />
                    </Field>
                  </div>
                </FieldGroup>
              ) : null}

              {block.type === "video" ? (
                <Field>
                  <FieldLabel htmlFor={`youtube-${block.id}`} required>
                    URL do YouTube
                  </FieldLabel>
                  <Input
                    id={`youtube-${block.id}`}
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={block.youtubeUrl}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "video"
                          ? { ...current, youtubeUrl: event.target.value }
                          : current,
                      )
                    }
                  />
                </Field>
              ) : null}
            </div>

            <InsertBlockBar
              onInsert={(nextBlock) => insertBlockAt(index + 1, nextBlock)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
