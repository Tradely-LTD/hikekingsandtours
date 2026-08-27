import { createTRPCReact } from "@trpc/react-query";

// The backend is deployed separately. The frontend bundle only needs the
// runtime tRPC client; the API URL is configured in main.tsx.
// The `any` cast keeps this standalone frontend package independent of the
// backend repository's generated AppRouter type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc = createTRPCReact<any>() as any;
