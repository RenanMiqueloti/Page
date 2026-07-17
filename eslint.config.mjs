import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  { ignores: ["**/.next/**", "out/**", ".claude/**", "next-env.d.ts"] },
  {
    extends: [...nextCoreWebVitals],
    rules: {
      // react-hooks v6 novas no eslint-config-next 16; código atual acusa
      // falsos positivos no AgentTerminal — endereçar em PR próprio
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
]);
