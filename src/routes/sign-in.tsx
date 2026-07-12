import { createFileRoute, Link } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-950 px-4">
      <Link
        to="/"
        className="mb-8 text-2xl font-bold tracking-tight text-transparent"
      >
        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text">
          ViralScripts
        </span>
      </Link>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "bg-gray-900 border border-gray-800 shadow-xl shadow-violet-900/10",
            headerTitle: "text-gray-100",
            headerSubtitle: "text-gray-400",
            formFieldLabel: "text-gray-300",
            formFieldInput:
              "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500",
            formButtonPrimary:
              "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white",
            footerActionText: "text-gray-400",
            footerActionLink: "text-violet-400 hover:text-violet-300",
            socialButtonsBlockButton:
              "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700",
            dividerLine: "bg-gray-700",
            dividerText: "text-gray-500",
          },
        }}
      />
    </div>
  );
}