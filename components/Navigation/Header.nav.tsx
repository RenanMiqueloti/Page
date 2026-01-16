import type { NextComponentType, NextPageContext } from "next";

import Link from "next/link";
import { VscGithubAlt } from "../Misc/Icons.collection";

import type { linkProps } from "../../@types/prop.types";

const TextLink: NextComponentType<NextPageContext, {}, linkProps> = ({
  text,
  url,
}) => {
  return (
    <a
      href={url}
      className="text-gray-400 hover:text-white transition-colors duration-200 text-base"
    >
      {text}
    </a>
  );
};

const Header: NextComponentType = () => {
  return (
    <header className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 pt-12 pb-8">
      <div className="flex items-center justify-between">
        <nav className="hidden sm:flex items-center gap-8">
          <TextLink text="Home" url="#" />
          <TextLink text="Habilidades" url="#skills" />
          <TextLink text="Projetos" url="#projects" />
        </nav>

        <Link href="https://github.com/RenanMiqueloti" passHref>
          <a
            className="text-gray-400 hover:text-white transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="github-repo"
          >
            <VscGithubAlt size={24} />
          </a>
        </Link>
      </div>
    </header>
  );
};

export default Header;
