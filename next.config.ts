import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer", "imapflow"],
  outputFileTracingIncludes: {
    "**": ["./src/generated/prisma/**"],
  },
};

export default nextConfig;
