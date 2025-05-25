import { SlideContext } from "@/app/page";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Pin, PinOff, Square } from "lucide-react";
import { JSX, useContext } from "react";

export default function LayerSidebar() {
  const {
    layers,
    setLayers,
  } = useContext(SlideContext);

  const toggleLockLayer = (index: number) => {
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index] = {
        ...newLayers[index],
        isPinned: !newLayers[index].isPinned,
      };
      return newLayers;
    });
  };

  const toggleHideLayer = (index: number) => {
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index] = {
        ...newLayers[index],
        isHidden: !newLayers[index].isHidden,
      };
      return newLayers;
    });
  };

  return (
    <div className="bg-slate-600 text-white border-1 w-64">
      <p className="text-white text-2xl m-2">Layers</p>
      {layers.map((layer, index) => {
        let layerIcon: JSX.Element;
        switch (layer.type) {
          case "rectangle":
            layerIcon = <Square size={16} />;
            break;
        }
        return (
          <div
            key={layer.uuid}
            className={cn("flex flex-row justify-between items-center p-2 m-2 gap-2 bg-slate-700 rounded-md",
              layer.isPinned && "bg-slate-800"
            )}>
            <div className="flex flex-row items-center gap-2">
              {layerIcon!}
              {layer.order + " " + layer.type}
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="cursor-pointer" onClick={() => toggleLockLayer(index)}>
                {layer.isPinned ? (
                  <PinOff size={16} />
                ) : (
                  <Pin size={16} />
                )}
              </div>
              <div className="cursor-pointer" onClick={() => toggleHideLayer(index)}>
                {layer.isHidden ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}