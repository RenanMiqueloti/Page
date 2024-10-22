import { BsArrowRightShort } from "../Misc/Icons.collection";

const Skills = () => {
  return (
    <div className="my-16 px-3 font-sen text-white" id="skills">
      <p className="text-3xl font-bold text-white">Habilidades & Conhecimentos</p>

      <div className="text-md my-8 flex flex-col font-medium md:text-xl custom:text-lg">
        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Python (pandas, NumPy, Scikit-learn, TensorFlow), SQL</span>
          &nbsp;
        </p>

        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Modelos supervisionados e não supervisionados, Regressão, Classificação, Árvores de Decisão, Redes Neurais Convolucionais (CNN) </span>
          &nbsp;
        </p>
        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white"> Modelagem com TensorFlow, Redes Neurais Artificiais (ANN), Redes Convolucionais (CNN) </span>
          &nbsp;
        </p>
        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Manipulação e análise de grandes volumes de dados, Limpeza e preparação de dados, Extração e transformação de dados (ETL) </span>
          &nbsp;
        </p>

        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Estatísticas descritivas, Análise exploratória de dados (EDA), Probabilidade, Testes de hipóteses </span>
          &nbsp;
        </p>

        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Matplotlib, Seaborn, Power BI </span>
          &nbsp;
        </p>
    
        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Desenvolviment e deploy de modelos de machine learning em produção, Integração com APIs </span>
          &nbsp;
        </p>
        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Cloud e Ferramentas de Deploy: AWS, GCP e Docker </span>
          &nbsp;
        </p>
        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Ferramentas de Controle de Versão: Git, GitHub </span>
          &nbsp;
        </p>
        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Metodologias de Trabalho: Agile, Scrum </span>
          &nbsp;
        </p>
        
      </div>

      
    </div>
  );
};

export default Skills;
