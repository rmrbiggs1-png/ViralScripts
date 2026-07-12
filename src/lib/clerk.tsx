import { ClerkProvider } from "@clerk/clerk-react";
import { useState, useEffect, type ReactNode } from "react";

const PUBLISHABLE_KEY = import.meta.env
  .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string;

if (!PUBLISHABLE_KEY && typeof window !== "undefined") {
  throw new Error(
    "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable",
  );
}

export default function ClerkProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // On the server, render children without ClerkProvider
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
}