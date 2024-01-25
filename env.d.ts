/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
