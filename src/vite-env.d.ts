/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PDF_PARSER_API_KEY: string
  readonly VITE_PDF_PARSER_API_URL: string
  readonly VITE_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}