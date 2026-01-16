import type { NextComponentType } from "next";

const Gifsection: NextComponentType = () => (
    <section className="py-20 md:py-32 border-t border-gray-800" id="gif">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Sort to Chill
        </h2>
        <div className="rounded-lg overflow-hidden border border-gray-800">
            <video 
                autoPlay 
                loop 
                muted 
                className="w-full max-w-4xl"
                playsInline
            >
                <source src="./assests/sortvideo.mp4" type="video/mp4" />
            </video>
        </div>
    </section>
);

export default Gifsection;
