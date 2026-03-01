import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-3 py-6 sm:px-6">
      <div className="surface w-full max-w-xl p-5 sm:p-8">

        <div className="flex items-center gap-3">
          <LogoMark />
          <h1 className="page-heading text-text text-3xl sm:text-4xl">
            Apex Clean Admin
          </h1>
        </div>

        <p className="mt-2 text-sm text-mutetext">
          AI-powered drug detection dashboard
        </p>

        <div className="mt-6 grid gap-3">
          <Link
            href="/login"
           className="inline-flex items-center justify-center rounded-lg bg-[#6fc4e7] text-[#121212] border border-[#6fc4e7]/60 font-medium py-2 hover:bg-[#6fc4e7]/90 transition"

          >
            Enter Dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}
