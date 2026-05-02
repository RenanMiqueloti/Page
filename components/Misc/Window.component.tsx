import { ReactNode } from "react";

type Props = {
  title: string;
  accent?: string;       // tailwind color util (ex: "text-emerald-400")
  className?: string;
  hint?: string;         // texto pequeno à direita do título (ex.: "interactive")
  children: ReactNode;
};

export const Window = ({ title, accent = "text-emerald-400", className = "", hint, children }: Props) => {
  return (
    <div
      className={`relative bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 rounded-lg overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-zinc-800/80 bg-white/[0.025]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2.5 font-mono text-[11px] text-zinc-500 tracking-wide">
          {title}
        </span>
        {hint && (
          <span className={`ml-auto font-mono text-[10px] ${accent}/80 hidden sm:inline`}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

export default Window;
