import type { NextComponentType } from "next";

import Image from "next/image";
import Link from "next/link";

import { HiOutlineArrowNarrowRight } from "../Misc/Icons.collection";

const About: NextComponentType = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-16 md:py-24 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
                <span className="text-purple-400 text-sm font-medium">AI Engineer</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
                Renan Miqueloti
                <span className="block mt-3 text-4xl md:text-5xl lg:text-6xl text-gray-400 font-normal">
                  AI Engineer
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Especializado no desenvolvimento de agents inteligentes e sistemas autônomos utilizando Large Language Models (LLMs).
              </p>
            </div>

            <div className="space-y-5 text-gray-400 leading-relaxed max-w-2xl text-lg">
              <p>
                Como <span className="text-white font-medium">AI Engineer</span>, desenvolvo agents inteligentes que combinam processamento de linguagem natural, raciocínio e tomada de decisão autônoma. Trabalho com frameworks modernos de agentic AI como LangChain e sistemas de RAG (Retrieval-Augmented Generation) para criar soluções que resolvem problemas complexos de forma autônoma.
              </p>

              <p>
                Minha expertise abrange desde <span className="text-purple-400 font-medium">desenvolvimento de agents</span> até <span className="text-purple-400 font-medium">MLOps e Data Science</span>, incluindo implementação e fine-tuning de modelos open source, integração com APIs de LLMs (OpenAI, Anthropic), uso de modelos open source e deployment de sistemas de AI em produção. Tenho experiência prática com Python, TensorFlow, PyTorch e arquiteturas de agentic AI.
              </p>

              <p>
                Focado em criar agents que podem <span className="text-white">raciocinar</span>, <span className="text-white">aprender</span> e <span className="text-white">executar tarefas complexas</span> de forma autônoma, transformando dados em ações inteligentes através de sistemas de AI moderna.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="https://www.linkedin.com/in/renanmiqueloti" passHref>
                <a
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 hover:scale-105 shadow-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>LinkedIn</span>
                  <HiOutlineArrowNarrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </Link>
              <Link href="mailto:renanmiqueloti@gmail.com">
                <a
                  className="group inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-white rounded-lg font-medium hover:border-gray-600 hover:bg-gray-900/50 transition-all duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Contato</span>
                  <HiOutlineArrowNarrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Circular purple background for round image */}
              <div className="w-[360px] h-[360px] rounded-full bg-gradient-to-br from-purple-500/30 via-purple-600/30 to-purple-500/30 flex items-center justify-center shadow-2xl shadow-purple-500/20">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl -z-10"></div>
                
                {/* Round image with transparent background */}
                <div className="relative w-[320px] h-[320px] rounded-full overflow-hidden">
                  <Image
                    src="/assests/avatar.png"
                    width="320"
                    height="320"
                    className="object-cover w-full h-full rounded-full"
                    alt="Renan Miqueloti - AI Engineer"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
