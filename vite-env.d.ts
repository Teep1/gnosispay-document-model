/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ETHERSCAN_API_KEY: string
  readonly VITE_TRACKED_ETH_ADDRESS: string
  readonly VITE_EXCLUDED_CONTRACT_ADDRESS: string
  // add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}