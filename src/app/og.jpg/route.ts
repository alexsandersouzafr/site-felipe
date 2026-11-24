import sharp from "sharp";

import { coverCrop } from "@/lib/og-crop";
import { getShareImage } from "@/lib/public/share-image";
import { OG_IMAGE_SIZE } from "@/lib/seo";

/**
 * The share image: the home opening photo cut to 1200x630 the way the hero
 * frames it, as a light JPEG (WhatsApp drops heavy previews). Pages point here
 * with a version in the query, so it can be cached for long.
 */
export async function GET() {
  const share = await getShareImage();

  if (!share) {
    return new Response("Sem foto de abertura.", { status: 404 });
  }

  const upstream = await fetch(share.src);

  if (!upstream.ok) {
    return new Response("Foto indisponível.", { status: 502 });
  }

  // Photos straight from a camera carry their rotation as a flag.
  const oriented = await sharp(Buffer.from(await upstream.arrayBuffer()))
    .rotate()
    .toBuffer({ resolveWithObject: true });
  const crop = coverCrop(
    oriented.info.width,
    oriented.info.height,
    OG_IMAGE_SIZE,
    share.objectPosition,
  );
  const jpeg = await sharp(oriented.data)
    .resize(crop.resized.width, crop.resized.height)
    .extract({ left: crop.left, top: crop.top, ...OG_IMAGE_SIZE })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control":
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
    },
  });
}
