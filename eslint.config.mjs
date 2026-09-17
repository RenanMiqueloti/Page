import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // public/ é asset estático servido como está — não passa por build nem lint
  { ignores: ["**/.next/**", "out/**", ".claude/**", "public/**", "next-env.d.ts"] },
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
