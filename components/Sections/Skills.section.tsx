const Skills = () => {
  const skillCategories = [
    {
      title: "Agents & AI",
      items: ["LangChain", "Agentic AI", "LLM Agents", "RAG", "Prompt Engineering"]
    },
    {
      title: "LLMs & NLP",
      items: ["OpenAI GPT", "Anthropic Claude", "Hugging Face", "Vector Databases", "Embeddings", "Open Source Models"]
    },
    {
      title: "Model Training",
      items: ["Fine-tuning", "Model Optimization", "Transfer Learning", "LoRA", "Model Training"]
    },
    {
      title: "Development",
      items: ["Python", "TensorFlow", "PyTorch", "TypeScript", "JavaScript", "SQL"]
    },
    {
      title: "Machine Learning",
      items: ["CNN", "Deep Learning", "Classification", "Regression", "Decision Trees", "Neural Networks"]
    },
    {
      title: "MLOps & Cloud",
      items: ["AWS", "GCP", "Docker", "Kubernetes", "CI/CD", "API Integration"]
    },
    {
      title: "Data Engineering",
      items: ["ETL", "Data Pipelines", "pandas", "NumPy", "Scikit-learn", "Data Analysis"]
    }
  ];

  return (
    <section className="relative py-32 border-t border-gray-800" id="skills">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Habilidades & Conhecimentos
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tecnologias e ferramentas que utilizo no desenvolvimento de agents e soluções de AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {skillCategories.map((category, index) => (
            <div 
              key={index} 
              className="group p-8 bg-gradient-to-br from-gray-900/50 to-gray-900/30 border border-gray-800 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-white mb-6 group-hover:text-purple-400 transition-colors">
                {category.title}
              </h3>
              <ul className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <li 
                    key={itemIndex} 
                    className="text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
