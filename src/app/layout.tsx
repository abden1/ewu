import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "EWU - Email Warm-Up",
  description: "Automatically warm up your email addresses to improve deliverability and avoid spam folders.",
  icons: { icon: "/EWU.png" },
  openGraph: {
    title: "EWU - Email Warm-Up",
    description: "Boost your email deliverability with automated warm-up campaigns.",
    images: ["/EWU.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}
