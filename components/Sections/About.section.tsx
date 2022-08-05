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

        <p className="mt-4 text-gray-400">
          Desenvolvedor e Cientista de dados
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
          width="200"
          height="200"
          className="rounded-full"
          alt="avatar"
        />
      </div>
    </div>
  );
};

export default About;
