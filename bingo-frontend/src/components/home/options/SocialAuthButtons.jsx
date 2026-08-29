import { useEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import useAuthStore from "../../../../store/authStore";

const GOOGLE_SRC = "https://accounts.google.com/gsi/client";
const FB_SRC = "https://connect.facebook.net/es_ES/sdk.js";

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
  const { loginWithGoogle, loginWithFacebook, loading } = useAuthStore();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

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

  useEffect(() => {
    if (!facebookAppId) return;
    let cancelled = false;

    const setupFacebook = async () => {
      try {
        window.fbAsyncInit = () => {
          window.FB.init({
            appId: facebookAppId,
            cookie: true,
            xfbml: false,
            version: "v21.0",
          });
        };

        await loadScript(FB_SRC, "facebook-jssdk");
        if (cancelled) return;

        if (window.FB) {
          window.FB.init({
            appId: facebookAppId,
            cookie: true,
            xfbml: false,
            version: "v21.0",
          });
        }
      } catch (err) {
        console.warn(err);
      }
    };

    setupFacebook();
    return () => {
      cancelled = true;
    };
  }, [facebookAppId]);

  const handleFacebook = () => {
    if (!facebookAppId) {
      onError?.("No se pudo iniciar sesión con Facebook");
      return;
    }
    if (!window.FB) {
      onError?.("No se pudo iniciar sesión con Facebook");
      return;
    }

    setBusy("facebook");
    window.FB.login(
      async (response) => {
        try {
          if (!response?.authResponse?.accessToken) {
            onError?.("No se pudo iniciar sesión con Facebook");
            return;
          }
          await loginWithFacebook(response.authResponse.accessToken);
          route("/games");
        } catch (err) {
          onError?.("No se pudo iniciar sesión");
        } finally {
          setBusy(null);
        }
      },
      { scope: "public_profile,email" }
    );
  };

  if (!googleClientId && !facebookAppId) {
    return (
      <p className="rounded-lg bg-black/5 px-3 py-2 text-center text-xs text-bingo-ink/60">
        Configura <code className="font-semibold">VITE_GOOGLE_CLIENT_ID</code> y{" "}
        <code className="font-semibold">VITE_FACEBOOK_APP_ID</code> en{" "}
        <code className="font-semibold">.env</code> para activar el login social.
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

      {googleClientId && (
        <div
          ref={googleBtnRef}
          className={`flex min-h-[44px] w-full justify-center overflow-hidden rounded-xl ${
            busy === "google" || loading ? "pointer-events-none opacity-60" : ""
          }`}
        />
      )}

      {facebookAppId && (
        <button
          type="button"
          onClick={handleFacebook}
          disabled={busy === "facebook" || loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1877F2]/30 bg-[#1877F2] px-4 py-3 text-sm font-bold text-white shadow-[3px_3px_0_#0b4ea2] transition hover:brightness-110 disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.928-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          {busy === "facebook" ? "Conectando..." : "Continuar con Facebook"}
        </button>
      )}
    </div>
  );
}
