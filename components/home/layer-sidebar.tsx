import { SlideContext } from "@/app/page";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Pin, PinOff, Square, Trash, Trash2 } from "lucide-react";
import { JSX, useContext } from "react";

export default function LayerSidebar() {
  const {
    layers,
    setLayers,
    inspectingLayerId,
    setInspectingLayerId,
  } = useContext(SlideContext);

  const toggleLockLayer = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    e.stopPropagation(); // Prevent the click from propagating to the button's onClick
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index] = {
        ...newLayers[index],
        isPinned: !newLayers[index].isPinned,
      };
      return newLayers;
    });
  };

  const toggleHideLayer = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    e.stopPropagation();
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index] = {
        ...newLayers[index],
        isHidden: !newLayers[index].isHidden,
      };
      return newLayers;
    });
  };

  const removeLayer = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    e.stopPropagation();
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers.splice(index, 1);
      return newLayers.map((layer, i) => ({
        ...layer,
        order: i,
      }));
    });
  };

  return (
    <div className="bg-slate-600 text-white border-1 w-80">
      <p className="text-white text-2xl m-2">Layers</p>
      {layers.map((layer, index) => {
        let layerIcon: JSX.Element;
        switch (layer.type) {
          case "rectangle":
            layerIcon = <Square size={16} />;
            break;
        }
        return (
          <button
            key={layer.uuid}
            className={cn(
              "flex flex-row justify-between items-center p-3 border-b-1 border-slate-500 w-full bg-slate-700 hover:bg-slate-800 cursor-pointer",
              inspectingLayerId === layer.uuid && "bg-slate-800",
            )}
            onClick={() => setInspectingLayerId(layer.uuid)}
          >
            <div className="flex flex-row items-center gap-2">
              {layerIcon!}
              {layer.order + " " + layer.type}
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="cursor-pointer" onClick={(e) => toggleLockLayer(e, index)}>
                {layer.isPinned ? (
                  <PinOff size={16} />
                ) : (
                  <Pin size={16} />
                )}
              </div>
              <div className="cursor-pointer" onClick={(e) => toggleHideLayer(e, index)}>
                {layer.isHidden ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </div>
              <div className="cursor-pointer" onClick={(e) => removeLayer(e, index)}>
                <Trash2 size={16} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}