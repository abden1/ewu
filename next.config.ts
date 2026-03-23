import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer", "imapflow", "@prisma/client", ".prisma/client"],
};

export default nextConfig;
