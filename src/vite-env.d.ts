/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PDF_PARSER_API_URL: string
  readonly VITE_BSC_AUTH_TOKEN: string
  readonly VITE_PDF_PARSER_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}