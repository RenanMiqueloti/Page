import { BsArrowRightShort } from "react-icons/bs";
import React from "react"; 

async function GetGit()
{
    var api = async () => {
        const response = await fetch('https://api.github.com/users/RenanMiqueloti/repos');
        const data = await response.json();
        return await data;
        
        
        }
              
    
    const api_data = await api();
    var dados = await api_data.map(function(data){
      const arraydados = [data.name,data.html_url]
      return arraydados
    
    })
    var all_api = Promise.all(dados).then(valores=>{
      return valores;
    })
    
    return all_api
 
      }



const GitSection = () => {
  const [git, setGit] = React.useState([]);
  const chamar = async () => {
    const data = await GetGit();
    setGit(data);
  };
  return (
    <div className="my-16 px-3 font-sen text-white" id="git">
      <p className="text-3xl font-bold text-white">Projetos GitHub</p>

      <div className="text-md my-8 flex flex-col font-medium md:text-xl custom:text-lg">
        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">{}</span>
          link&nbsp;
        </p>

        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Typescript </span>
          &nbsp;
        </p>

        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">Python </span>
          &nbsp;
        </p>

        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white"> Java</span>
          &nbsp;
        </p>

        <p className="flex flex-row items-center border-b-[0.1px] border-gray-500 py-1 text-slate-300">
          <BsArrowRightShort size="30" />
          <span className="text-white">aa </span>
          &nbsp;
        </p>
      </div>

      
    </div>
  );
};

export default GitSection;