import type { NextPage } from "next";

import {
  Header,
  About,
  Projects,
  Skills,
} from "../components";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <About />
        <Skills />
        <Projects />
        
        <footer className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 mt-32 mb-16 py-8 border-t border-gray-800">
          <div className="text-center text-gray-500 text-sm">
            <p>Desenvolvido por Renan Miqueloti</p>
            <p className="mt-2 text-gray-600">AI Engineer & Agent Developer</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
