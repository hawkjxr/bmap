/// <reference types="vite/client" />

// JSON module declarations
declare module '*.json' {
  const value: unknown;
  export default value;
}
