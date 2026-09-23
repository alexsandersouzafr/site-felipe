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
  // Cover + several block images (5 MB each) can exceed the 1 MB default.
  experimental: {
    serverActions: {
      bodySizeLimit: "40mb",
    },
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
