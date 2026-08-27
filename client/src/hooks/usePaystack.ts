/**
 * usePaystack — thin wrapper around the Paystack Inline JS SDK.
 *
 * Usage:
 *   const pay = usePaystack();
 *   pay({ email, amount, ref, onSuccess, onClose });
 *
 * The Paystack script is injected once on first call.
 * Set VITE_PAYSTACK_PUBLIC_KEY in secrets to use your live/test key.
 * Until the key is set, the hook falls back to a demo mode that calls
 * onSuccess immediately so the rest of the flow can be tested.
 */

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PaystackPop?: any;
  }
}

let scriptLoaded = false;

function loadPaystackScript(): Promise<void> {
  if (scriptLoaded || window.PaystackPop) {
    scriptLoaded = true;
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export interface PaystackPaymentOptions {
  email: string;
  /** Amount in KOBO (multiply Naira by 100) */
  amount: number;
  ref: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

export function usePaystack() {
  const pay = async (opts: PaystackPaymentOptions) => {
    // Demo mode — no key configured yet
    if (!PAYSTACK_KEY) {
      console.warn("[Paystack] No public key set. Running in demo mode.");
      setTimeout(() => opts.onSuccess(`DEMO-${opts.ref}`), 800);
      return;
    }

    await loadPaystackScript();

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: opts.email,
      amount: opts.amount,
      ref: opts.ref,
      currency: "NGN",
      metadata: opts.metadata ?? {},
      callback: (response: { reference: string }) => {
        opts.onSuccess(response.reference);
      },
      onClose: () => {
        opts.onClose?.();
      },
    });

    handler.openIframe();
  };

  return pay;
}
