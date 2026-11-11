import "@lovable.dev/cloud-auth-js/styles.css";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";

async function oauth(provider: "google" | "lovable") {
  const result = await lovable.auth.signInWithOAuth(provider, {
    redirect_uri: `${window.location.origin}/auth`,
  });
  if (result.error) {
    toast.error("Não foi possível entrar agora", { description: "Tente novamente em instantes." });
    return false;
  }
  return true;
}

export function ProviderButtons({ onBeforeRedirect }: { onBeforeRedirect?: () => void }) {
  const [busy, setBusy] = useState<null | "google" | "lovable">(null);
  const go = async (p: "google" | "lovable") => {
    onBeforeRedirect?.();
    setBusy(p);
    await oauth(p);
    setBusy(null);
  };
  return (
    <div className="grid gap-2.5">
      <Button
        type="button"
        variant="outline"
        disabled={busy !== null}
        onClick={() => go("google")}
        className="h-11 border-google-border bg-google-surface font-medium text-google-text hover:bg-google-surface hover:brightness-95 hover:text-google-text"
      >
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
          <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
        </svg>
        Continuar com Google
      </Button>
      <button type="button" className="lovable-auth-button" disabled={busy !== null} onClick={() => go("lovable")}>
        Continue with Lovable
      </button>
    </div>
  );
}
