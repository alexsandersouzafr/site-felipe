import createNextIntlPlugin from "next-intl/plugin";

/**
 * Plain JavaScript on purpose: Next compiles a TypeScript config with SWC
 * before reading it, and the Hostinger build host cannot load the native SWC
 * binary (see docs/deploy-hostinger.md), which leaves the compiled config
 * pointing at a file that was never written.
 *
 * @type {import("next").NextConfig}
 */
const nextConfig = {
  // One 40 MB image, plus the multipart framing and text fields around it. See
  // MAX_REQUEST_BYTES in src/lib/media-limits.ts.
  experimental: {
    serverActions: {
      bodySizeLimit: "45mb",
    },
    // src/proxy.ts runs on /admin, and Next buffers what passes through a proxy
    // only up to this size (10 MB by default). Lower than the limit above, the
    // action receives a form cut in half and fails with "Unexpected end of form".
    proxyClientMaxBodySize: "45mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
