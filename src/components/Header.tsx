import { Link } from "@tanstack/react-router";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

function AuthButtons() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "h-8 w-8",
            userButtonTrigger:
              "focus:shadow-none rounded-full ring-2 ring-violet-600/30 hover:ring-violet-500/50 transition-all",
          },
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <button
          type="button"
          className="rounded-lg border border-gray-700 bg-gray-800/40 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:border-gray-600 hover:bg-gray-800/60"
        >
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button
          type="button"
          className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition-all hover:from-violet-500 hover:to-fuchsia-500"
        >
          Sign Up
        </button>
      </SignUpButton>
    </div>
  );
}

export default function Header() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="mb-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="flex flex-col items-start">
          <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            ViralScripts
          </h1>
          <p className="text-sm text-gray-500 sm:text-base">
            Stop guessing. Start going viral.
          </p>
        </Link>

        {/* Auth section - only render on client to avoid SSR issues */}
        <div className="flex items-center gap-3">
          {isClient ? (
            <AuthButtons />
          ) : (
            /* SSR placeholder */
            <div className="h-9 w-36" />
          )}
        </div>
      </div>
    </header>
  );
}