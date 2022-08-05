import type { NextComponentType } from "next";
const Gifsection: NextComponentType = () => (
    <div className="my-16 px-3 font-sen text-white" id="gif">
        <h1 className="text-3xl font-bold text-white">Sort to Chill</h1>
        <video autoPlay loop muted className="justify-content align-center">
            <source src="./assests/sortvideo.mp4" type="video/mp4" />
        </video>

    </div>)
export default Gifsection
