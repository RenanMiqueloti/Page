import type { NextPage } from "next";

import {
  Header,
  About,
  Projects,
  Skills,
} from "../components";
import Gifsection from "../components/Sections/Gif.section";

const Home: NextPage = () => {
  return (
    <div className="px-2 sm:px-8 md:px-24 lg:px-48 xl:px-72">
      <Header />
      <About />
      <Skills />
      <Gifsection/>
      <Projects />
      

      <div className="flex justify-center">
      
      </div>
    </div>
  );
};

export default Home;
