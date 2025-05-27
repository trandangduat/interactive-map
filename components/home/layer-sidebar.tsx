import { ArrowLayer, CircleLayer, Layer, RectLayer } from "@/types/layer";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pin, PinOff, Square, Trash2 } from "lucide-react";
import { JSX, useContext, useState } from "react";
import { SlideContext } from "@/app/page";

// Layer info display component
function LayerInfoPanel({ layer, isSelected }: { layer: Layer, isSelected: boolean }) {
  return (
    <div className={cn("p-3 bg-slate-700 text-sm rounded overflow-auto shadow m-0", isSelected && "bg-slate-800")}>
      <div className="space-y-1">
        {layer.type === "rectangle" && (
          <>
            <div className="">
              <p className="font-medium">Bounds:</p>
              <p className="pl-2 text-xs">{JSON.stringify((layer as RectLayer).bounds)}</p>
            </div>
            <div className="mt-2">
              <p className="font-medium">Real life area:</p>
              <p className="pl-1 text-xs">{layer.realLifeArea?.toFixed(4)} m2</p>
            </div>
          </>
        )}

        {layer.type === "circle" && (
          <div className="mt-2">
            <p className="font-medium">Position:</p>
            <p className="pl-2 text-xs">Center: {JSON.stringify((layer as CircleLayer).center)}</p>
            <p className="pl-2">Radius: {(layer as CircleLayer).radius}m</p>
          </div>
        )}

        {layer.type === "arrow" && (
          <div className="mt-2">
            <p className="font-medium">Position:</p>
            <p className="pl-2 text-xs">Start: {JSON.stringify((layer as ArrowLayer).start)}</p>
            <p className="pl-2 text-xs">End: {JSON.stringify((layer as ArrowLayer).end)}</p>
          </div>
        )}

        <div className="mt-3 pt-2">
          <p className="font-medium">Style:</p>
          <div className="flex items-center justify-between mt-1">
            <p>Stroke:</p>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 border border-white"
                style={{backgroundColor: layer.pathOptions?.color || 'blue'}}
              ></div>
              <p>{layer.pathOptions?.color || 'default'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p>Fill:</p>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 border border-white"
                style={{backgroundColor: layer.pathOptions?.fillColor || 'blue'}}
              ></div>
              <p>{layer.pathOptions?.fillColor || 'default'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p>Opacity:</p>
            <p>{layer.pathOptions?.fillOpacity || 'default'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LayerSidebar() {
  const {
    layers,
    setLayers,
    inspectingLayerId,
    setInspectingLayerId,
  } = useContext(SlideContext);

  // State to track which layers have expanded info panels
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const toggleLayerInfo = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, layerId: string) => {
    e.stopPropagation();
    setExpandedLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDragStartIndex(index);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      [newLayers[dragStartIndex!], newLayers[index]] = [newLayers[index], newLayers[dragStartIndex!]]; // Swap the layers
      return newLayers;
    });
    setDragStartIndex(null);
    setDraggedOverIndex(null);
  };

  return (
    <div className="bg-slate-600 text-white border-1 w-90" onClick={() => setInspectingLayerId(null)}>
      <p className="text-white text-2xl m-2">Layers</p>
      {layers.map((layer, index) => {
        let layerIcon: JSX.Element;
        switch (layer.type) {
          case "rectangle":
            layerIcon = <Square size={16} />;
            break;
        }

        const isExpanded = expandedLayers[layer.uuid] || false;
        const isSelected = inspectingLayerId === layer.uuid;

        return (
          <div
            key={layer.uuid}
            className={cn("border-b border-slate-500", draggedOverIndex === index && "border-t-2 border-t-slate-300")}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <button
              className={cn(
                "flex flex-row justify-between items-center p-3 w-full bg-slate-700 cursor-pointer",
                isSelected && "bg-slate-800",
              )}
              onClick={(e) => {
                e.stopPropagation();
                setInspectingLayerId(layer.uuid);
              }}
            >
              <div className="flex flex-row items-center gap-2 text-sm">
                {layerIcon!}
                {index + " " + layer.type + "_" + layer.uuid.slice(0,5)}
              </div>
              <div className="flex flex-row items-center gap-2">
                <div
                  className="cursor-pointer hover:bg-slate-600 p-1 rounded"
                  onClick={(e) => toggleLayerInfo(e, layer.uuid)}
                  title="Toggle layer info"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                <div
                  className="cursor-pointer hover:bg-slate-600 p-1 rounded"
                  onClick={(e) => toggleLockLayer(e, index)}
                  title={layer.isPinned ? "Unpin layer" : "Pin layer"}
                >
                  {layer.isPinned ? (
                    <PinOff size={16} />
                  ) : (
                    <Pin size={16} />
                  )}
                </div>
                <div
                  className="cursor-pointer hover:bg-slate-600 p-1 rounded"
                  onClick={(e) => toggleHideLayer(e, index)}
                  title={layer.isHidden ? "Show layer" : "Hide layer"}
                >
                  {layer.isHidden ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </div>
                <div
                  className="cursor-pointer hover:bg-slate-600 p-1 rounded"
                  onClick={(e) => removeLayer(e, index)}
                  title="Remove layer"
                >
                  <Trash2 size={16} />
                </div>
              </div>
            </button>

            {/* Render layer info panel when expanded */}
            {isExpanded && (
              <LayerInfoPanel layer={layer} isSelected={isSelected} />
            )}
          </div>
        );
      })}
    </div>
  );
}