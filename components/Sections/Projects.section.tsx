import type { NextComponentType } from "next";

import Link from "next/link";
import { promises } from "stream";

async function GetGit()
{
    var api = async () => {
        const response = await fetch('https://api.github.com/users/RenanMiqueloti/repos');
        const data = await response.json();
        return data
        
        
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

var arrayesse = GetGit();
console.log (arrayesse)



const Projects: NextComponentType = () => {
  return (
    <div className="my-16 px-3 font-sen" id="projects">
      <p className="text-3xl font-bold text-white">Projetos</p>
      <div className="my-8 flex flex-col items-center justify-center gap-10 sm:flex-row">
        <Link href="https://drive.google.com/drive/folders/1gPf1YRwNeCzkFKCDk8U031rR2I_ecWcy?usp=sharing" passHref>
          <a
            className="h-[7rem] w-[14rem] cursor-pointer rounded-lg bg-gradient-to-r from-[#D8B4FE] to-[#818CF8] p-1 text-white duration-100 hover:scale-105"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-primary px-2 text-center font-medium">
              <p className="text-xl font-semibold"></p>
              <p>Projetos desenvolvidos na universidade</p>
            </div>
          </a>
        </Link>
        <Link href="https://drive.google.com/drive/folders/1gPf1YRwNeCzkFKCDk8U031rR2I_ecWcy?usp=sharing" passHref>
          <a
            className="h-[7rem] w-[14rem] cursor-pointer rounded-lg bg-gradient-to-r from-[#D8B4FE] to-[#818CF8] p-1 text-white duration-100 hover:scale-105"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-primary px-2 text-center font-medium">
              <p className="text-xl font-semibold"></p>
              <p></p>
            </div>
          </a>
        </Link>

        
      </div>
    </div>
  );
};

export default Projects;
