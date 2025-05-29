import { SlidesControlContext } from "@/app/page";
import { cn } from "@/lib/utils";
import { useContext } from "react";

export default function SlidesControl() {
  const { slides, currentSlideIndex, setCurrentSlideIndex } = useContext(SlidesControlContext);

  return (
    <div className="z-10 bg-slate-600 w-full max-w-64">
      <div className="flex flex-col items-center gap-4 p-6">
        {slides.map((slide, index) => (
          <button
            key={index}
            className={cn(
              "w-full overflow-hidden bg-slate-700 aspect-video rounded-lg flex items-center justify-center border-3 border-slate-500 cursor-pointer shadow-xl shadow-transparent hover:border-slate-300 hover:bg-slate-900 hover:shadow-slate-700",
              currentSlideIndex === index && "border-slate-300 bg-slate-900 shadow-slate-700"
            )}
            onClick={() => setCurrentSlideIndex(index)}
          >
            <img src="https://picsum.photos/seed/picsum/536/354" alt={`Slide ${index + 1}`} className="w-fit h-fit" />
          </button>
        ))}
        <button
          className="w-full bg-slate-700 aspect-video rounded-lg flex items-center justify-center border-3 border-slate-500 cursor-pointer shadow-xl shadow-transparent hover:border-slate-300 hover:bg-slate-900 hover:shadow-slate-700"
          onClick={() => {
            setCurrentSlideIndex((prevIndex) => (prevIndex + 1));
          }}
        >
          <p className="text-white text-xl">+ New Slide</p>
        </button>
      </div>
    </div>
  );
}