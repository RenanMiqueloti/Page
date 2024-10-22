import type { NextComponentType } from "next";

import Image from "next/image";
import Link from "next/link";

import { HiOutlineArrowNarrowRight } from "../Misc/Icons.collection";

const About: NextComponentType = () => {
  return (
    <div className="my-8 flex flex-row items-center justify-between px-3 font-sen">
      <div>
        <p className="text-3xl font-bold text-white">Renan Miqueloti</p>
        <p className="mt-1 text-lg text-gray-300">
          Data Scientist e MLOps
        </p>

        <p className="mt-6 text-gray-400">
        Sou um Cientista de Dados especializado em machine learning, deep learning e análises preditivas. Ao longo da minha carreira, desenvolvi soluções como modelos de CNN para detecção de imagem, previsões de consumo de energia com árvores de decisão e algoritmos de detecção de falsificação. Com um foco em transformar dados em insights acionáveis, utilizo ferramentas como Python, TensorFlow e Scikit-learn para resolver problemas complexos e colocar modelos em produção, sempre buscando inovação e eficiência.

        </p>

        <Link href="https://www.linkedin.com/in/renanmiqueloti" passHref>
          <a
            className="mt-4 flex cursor-pointer flex-row items-center gap-1 font-jost text-xl text-gray-400 duration-100 hover:ml-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Linkedin
            <HiOutlineArrowNarrowRight />
          </a>
        </Link>
        <Link href="mailto:renanmiqueloti@gmail.com">
          <a
            className="mt-4 flex cursor-pointer flex-row items-center gap-1 font-jost text-xl text-gray-400 duration-100 hover:ml-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contato via E-mail
            <HiOutlineArrowNarrowRight />
          </a>
        </Link>

  
      </div>

      <div className="hidden custom:block">
        <Image
          src="/assests/avatar.png"
          width="950"
          height="950"
          className="rounded-full"
          alt="avatar"
        />
      </div>
    </div>
  );
};

export default About;
