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
          Estudante de Ciências da Computação
        </p>

        <p className="mt-6 text-gray-400">
        Olá! Meu nome é Renan e estou cursando Ciência da Computação. 

Com experiência em desenvolvimento de software, programação, sistema de informação e prestação de serviços.

Tenho habilidades em diversas linguagens de programação, como Python, Java e PHP, além de ter conhecimento em bancos de dados e ferramentas de gerenciamento de projetos. Sou apaixonado por tecnologia e estou sempre buscando aprender mais sobre as últimas tendências e inovações na área.
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
