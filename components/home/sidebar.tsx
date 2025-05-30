import { ArrowLayer, CircleLayer, Layer, RectLayer } from "@/types/layer";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, ChevronUp, Circle, Eye, EyeOff, Pin, PinOff, Plus, Square, SquarePlus, Trash2 } from "lucide-react";
import { JSX, useContext, useEffect, useRef, useState } from "react";
import { SlideContext } from "@/app/page";
import { DeleteLayerAction, HideLayerAction, PinLayerAction, ReorderLayerAction, UnHideLayerAction, UnPinLayerAction } from "@/types/history-stack";

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
          <>
            <div className="">
              <p className="font-medium">Position:</p>
              <p className="pl-2 text-xs">Center: {JSON.stringify((layer as CircleLayer).center)}</p>
              <p className="pl-2 text-xs">Radius: {(layer as CircleLayer).radius.toFixed(1)}m</p>
            </div>
            <div className="mt-2">
              <p className="font-medium">Real life area:</p>
              <p className="pl-1 text-xs">{layer.realLifeArea?.toFixed(4)} m²</p>
            </div>
          </>
        )}

        {layer.type === "arrow" && (
          <div className="mt-2">
            <p className="font-medium">Position:</p>
            <p className="pl-2 text-xs">Start: {JSON.stringify((layer as ArrowLayer).start)}</p>
            <p className="pl-2 text-xs">End: {JSON.stringify((layer as ArrowLayer).end)}</p>
            <div className="mt-2">
              <p className="font-medium">Distance:</p>
              <p className="pl-1 text-xs">
                {layer.realLifeDistance!.toFixed(1)} m
              </p>
            </div>
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

function LayersPane() {
  const {
    layers,
    setLayers,
    inspectingLayerId,
    setInspectingLayerId,
    setSlideHistory,
  } = useContext(SlideContext);
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
    const isPinned = layers[index].isPinned;

    setSlideHistory(prev => {
      const newSlideHistory = prev.copy();
      newSlideHistory.push({
        type: isPinned ? "UNPIN_LAYER" : "PIN_LAYER",
        layer: {...layers[index]}
      });
      return newSlideHistory;
    });

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
    const isHidden = layers[index].isHidden;

    setSlideHistory(prev => {
      const newSlideHistory = prev.copy();
      newSlideHistory.push({
        type: isHidden ? "UNHIDE_LAYER" : "HIDE_LAYER",
        layer: {...layers[index]}
      });
      return newSlideHistory;
    });

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
    setSlideHistory(prev => {
        const newSlideHistory = prev.copy();
        newSlideHistory.push({
          type: "DELETE_LAYER",
          layer: {...layers[index]},
          oldIndex: index,
        } as DeleteLayerAction);
        return newSlideHistory;
    });
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

    setSlideHistory(prev => {
      const newSlideHistory = prev.copy();
      newSlideHistory.push({
        type: "REORDER_LAYER",
        oldIndex: dragStartIndex!,
        newIndex: index
      });
      return newSlideHistory;
    });

    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      const reorderedLayer = newLayers.splice(dragStartIndex!, 1)[0];
      newLayers.splice(index, 0, reorderedLayer);
      return newLayers;
    });
    setDragStartIndex(null);
    setDraggedOverIndex(null);
  };

  return (
    <>
    <p className="text-white text-2xl m-2">Layers</p>
    <div className="overflow-y-auto h-full"> {/* Add h-full here and keep overflow-y-auto */}
    {layers.map((layer, index) => {
      let layerIcon: JSX.Element;
      switch (layer.type) {
        case "rectangle":
          layerIcon = <Square size={16} />;
          break;
        case "circle":
          layerIcon = <Circle size={16} />;
          break;
        case "arrow":
          layerIcon = <ArrowRight size={16} />;
          break;
        default:
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
    </>
  )
}

function HistoryPane() {
  const {
    slideHistory,
    undo,
    redo
  } = useContext(SlideContext);

  const historyBoardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    historyBoardRef.current?.scrollTo({
      top: historyBoardRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [slideHistory]);

  return (
  <>
    <p className="text-white text-2xl m-2 mb-4">History</p>
    <div className="h-full overflow-y-auto" ref={historyBoardRef}> {/* Add h-full here */}
    {slideHistory.actions.map((action, index) => (
      <div key={index} className="border-b border-slate-500">
        <button
          className={cn(
            "bg-slate-700 p-2 w-full flex flex-row items-center gap-2 cursor-pointer text-sm",
            slideHistory.currentIndex === index && "bg-slate-800",
            slideHistory.currentIndex < index && "opacity-40",
            slideHistory.currentIndex > index && "opacity-100"
          )}
          onClick={() => {
            let diff:number = index - slideHistory.currentIndex;
            while (diff > 0) {
              redo();
              diff--;
            }
            while (diff < 0) {
              undo();
              diff++;
            }
          }}
        >
          {action.type === "NEW_LAYER" ? (
            <>
              <Plus size={16} />
              <p>{action.type} - {action.layer!.uuid.slice(0, 5)}</p>
            </>
          ) : action.type === "DELETE_LAYER" ? (
            <>
              <Trash2 size={16} />
              <p>{action.type} - {action.layer!.uuid.slice(0, 5)}</p>
            </>
          ) : action.type === "PIN_LAYER" ? (
            <>
              <Pin size={16} />
              <p>{action.type} - {action.layer!.uuid.slice(0, 5)}</p>
            </>
          ) : action.type === "UNPIN_LAYER" ? (
            <>
              <PinOff size={16} />
              <p>{action.type} - {action.layer!.uuid.slice(0, 5)}</p>
            </>
          ) : action.type === "HIDE_LAYER" ? (
            <>
              <EyeOff size={16} />
              <p>{action.type} - {action.layer!.uuid.slice(0, 5)}</p>
            </>
          ) : action.type === "UNHIDE_LAYER" ? (
            <>
              <Eye size={16} />
              <p>{action.type} - {action.layer!.uuid.slice(0, 5)}</p>
            </>
          ) : action.type === "REORDER_LAYER" ? (
            <>
              <ChevronUp size={16} />
              <p>{action.type} - {action.oldIndex} to {action.newIndex}</p>
            </>
          ) : (
            <>
              <p>{action.type}</p>
            </>
          )}
        </button>
      </div>
    ))}
    </div>
  </>
  )
}

export default function Sidebar() {
  const { setInspectingLayerId } = useContext(SlideContext);

  return (
    <div className="bg-slate-600 text-white w-90 flex flex-col justify-between h-screen" onClick={() => setInspectingLayerId(null)}>
      <div className="basis-2/3 flex flex-col overflow-hidden">
        <LayersPane />
      </div>
      <div className="basis-1/3 flex flex-col overflow-hidden border-t border-slate-400">
        <HistoryPane />
      </div>
    </div>
  );
}