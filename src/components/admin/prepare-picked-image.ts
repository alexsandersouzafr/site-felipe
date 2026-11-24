import {
  type ReductionProfile,
  reducedDimensions,
  reducedFileName,
  reductionQualities,
  SITE_PHOTO_REDUCTION,
  shouldReduceImage,
} from "@/lib/image-reduction";
import {
  formatMegabytes,
  type ImageValidationResult,
  MAX_IMAGE_BYTES,
  validatePickedImage,
} from "@/lib/media-limits";

/** Downscaled enough to read cheaply, large enough to keep a soft edge. */
const ALPHA_SAMPLE_SIDE = 256;

function hasTransparency(bitmap: ImageBitmap) {
  const { width, height } = reducedDimensions(
    bitmap.width,
    bitmap.height,
    ALPHA_SAMPLE_SIDE,
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return true;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 255) {
      return true;
    }
  }

  return false;
}

function encode(
  canvas: HTMLCanvasElement,
  type: ReductionProfile["type"],
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

/**
 * Re-encodes a photo by `profile`, no larger than `maxBytes`. Returns null
 * whenever the original should be kept: a transparent PNG, a browser that
 * cannot decode the file (a phone running out of memory on a huge photo), or a
 * result that would not be smaller.
 */
export async function reduceImage(
  file: File,
  profile: ReductionProfile,
  maxBytes: number,
) {
  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return null;
  }

  try {
    if (file.type === "image/png" && hasTransparency(bitmap)) {
      return null;
    }

    let { width, height } = reducedDimensions(
      bitmap.width,
      bitmap.height,
      profile.maxSide,
    );
    let type = profile.type;

    // Quality first; only when that is not enough, fewer pixels.
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        return null;
      }

      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, width, height);

      for (const quality of reductionQualities(profile)) {
        let blob = await encode(canvas, type, quality);

        // A browser that cannot write WebP hands back a PNG instead.
        if (blob && blob.type !== type) {
          type = "image/jpeg";
          blob = await encode(canvas, type, quality);
        }

        if (blob && blob.size <= maxBytes) {
          return blob.size < file.size
            ? new File([blob], reducedFileName(file.name, type), {
                type,
                lastModified: Date.now(),
              })
            : null;
        }
      }

      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
    }

    return null;
  } catch {
    return null;
  } finally {
    bitmap.close();
  }
}

function replaceFile(input: HTMLInputElement, file: File | null) {
  const transfer = new DataTransfer();

  if (file) {
    transfer.items.add(file);
  }

  input.files = transfer.files;
}

export type PreparedImage =
  | { ok: true; file: File | null; reducedFrom?: number }
  | { ok: false; error: string };

/**
 * What every image picker does with a chosen file: reduce it when it is large
 * (the input is emptied meanwhile, so a save in the middle sends nothing
 * half-done), put the result back in the input, then check it against the
 * field's limit and the size of the whole form.
 */
export async function preparePickedImage(
  input: HTMLInputElement,
  options: {
    maxBytes?: number;
    /** null sends the file exactly as chosen. */
    reduction?: ReductionProfile | null;
    onReducing?: (reducing: boolean) => void;
  } = {},
): Promise<PreparedImage> {
  const {
    maxBytes = MAX_IMAGE_BYTES,
    reduction = SITE_PHOTO_REDUCTION,
    onReducing,
  } = options;
  const original = input.files?.[0] ?? null;

  if (!original) {
    return { ok: true, file: null };
  }

  let file = original;
  let reducedFrom: number | undefined;

  if (reduction && shouldReduceImage(original, reduction)) {
    replaceFile(input, null);
    onReducing?.(true);
    const reduced = await reduceImage(original, reduction, maxBytes);
    onReducing?.(false);

    if (reduced) {
      file = reduced;
      reducedFrom = original.size;
    }

    replaceFile(input, file);
  }

  const validation: ImageValidationResult = validatePickedImage(
    file,
    new FormData(input.form ?? undefined),
    maxBytes,
  );

  if (!validation.ok) {
    replaceFile(input, null);
    return validation;
  }

  return { ok: true, file, reducedFrom };
}

export function reducedMessage(from: number, to: number) {
  return `A imagem tinha ${formatMegabytes(from)} MB e foi reduzida para ${formatMegabytes(to)} MB, com perda mínima de qualidade, para economizar espaço.`;
}
