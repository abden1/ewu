import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-brand flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/EWU.png" alt="EWU" width={48} height={48} className="rounded-xl" />
            <span className="text-2xl font-black">EWU</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
