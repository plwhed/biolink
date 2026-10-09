import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/auth-card";

export const metadata: Metadata = {
  title: "egirls.lol — log in or sign up",
};

function modeFrom(value: string | string[] | undefined): "login" | "register" {
  return value === "register" ? "register" : "login";
}

export default async function RegisterPage(
  props: PageProps<"/register">
) {
  const { username, mode } = await props.searchParams;

  return (
    <div className="relative isolate min-h-screen flex overflow-hidden bg-[#080808]">
      {/* Same animated background as landing (needs isolate so z-index:-1 stays visible) */}
      <div className="bg" aria-hidden="true">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="bg-grid" />
        <div className="vignette" />
        <div className="grain" />
      </div>

      {/* Centered card only */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {/* Card with subtle gradient border */}
          <div className="relative rounded-3xl border border-[#1b1b1b] bg-[#0d0d0d]">
            <div className="relative rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-8">
              <AuthCard
                initialMode={username ? "register" : modeFrom(mode)}
                initialUsername={typeof username === "string" ? username : ""}
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-white/40">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">
              Terms of Service
            </Link>
            {" and "}
            <Link href="/privacy" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}