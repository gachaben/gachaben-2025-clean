/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_EMU: string;
  readonly VITE_FIRESTORE_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
