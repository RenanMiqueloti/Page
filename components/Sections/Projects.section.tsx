import type { NextComponentType } from "next";
import Link from "next/link";

const Projects: NextComponentType = () => {
  const projects = [
    {
      title: "Agents & AI",
      description: "Projetos de agents inteligentes e sistemas autônomos",
      url: "https://github.com/renanmiqueloti",
      gradient: "from-purple-600 to-pink-600",
      icon: "🤖"
    },
    {
      title: "Data Science",
      description: "Projetos de machine learning e análise de dados",
      url: "https://github.com/renanmiqueloti",
      gradient: "from-blue-600 to-purple-600",
      icon: "📊"
    },
    {
      title: "Acadêmico",
      description: "Projetos desenvolvidos durante a graduação",
      url: "https://drive.google.com/drive/folders/1gPf1YRwNeCzkFKCDk8U031rR2I_ecWcy?usp=sharing",
      gradient: "from-indigo-600 to-purple-600",
      icon: "🎓"
    }
  ];

  return (
    <section className="relative py-32 border-t border-gray-800" id="projects">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-900/5 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Projetos
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore meus projetos de agents, AI e Data Science
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Link key={index} href={project.url} passHref>
              <a
                className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative p-8 h-full flex flex-col">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {project.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 flex-grow">
                    {project.description}
                  </p>
                  <div className="mt-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <span className="text-sm font-medium">Ver projetos</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
