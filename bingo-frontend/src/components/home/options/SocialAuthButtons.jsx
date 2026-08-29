import { useEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import useAuthStore from "../../../../store/authStore";

const GOOGLE_SRC = "https://accounts.google.com/gsi/client";

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
}

export default function SocialAuthButtons({ onError }) {
  const googleBtnRef = useRef(null);
  const [busy, setBusy] = useState(null);
  const { loginWithGoogle, loading } = useAuthStore();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleBtnRef.current) return;
    let cancelled = false;

    const setupGoogle = async () => {
      try {
        await loadScript(GOOGLE_SRC, "google-gsi");
        if (cancelled || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            setBusy("google");
            try {
              await loginWithGoogle(response.credential);
              route("/games");
            } catch (err) {
              onError?.("No se pudo iniciar sesión");
            } finally {
              setBusy(null);
            }
          },
          auto_select: false,
          ux_mode: "popup",
        });

        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width: googleBtnRef.current.offsetWidth || 320,
          logo_alignment: "left",
        });
      } catch (err) {
        console.warn(err);
      }
    };

    setupGoogle();
    return () => {
      cancelled = true;
    };
  }, [googleClientId, loginWithGoogle, onError]);

  if (!googleClientId) {
    return (
      <p className="rounded-lg bg-black/5 px-3 py-2 text-center text-xs text-bingo-ink/60">
        Configura <code className="font-semibold">VITE_GOOGLE_CLIENT_ID</code> en{" "}
        <code className="font-semibold">.env</code> para activar el login con Google.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-bingo-felt/15" />
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-bingo-felt/50">
          O continúa con
        </span>
        <span className="h-px flex-1 bg-bingo-felt/15" />
      </div>

      <div
        ref={googleBtnRef}
        className={`flex min-h-[44px] w-full justify-center overflow-hidden rounded-xl ${
          busy === "google" || loading ? "pointer-events-none opacity-60" : ""
        }`}
      />
    </div>
  );
}
