import { ArrowLayer, CircleLayer, Layer, RectLayer } from "@/types/layer";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, ChevronUp, Circle, Eye, EyeOff, Pin, PinOff, Square, Trash2 } from "lucide-react";
import { JSX, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { HistoryContext, LayersContext, PresentationContext } from "@/app/page";
import { DeleteLayerAction } from "@/types/history-stack";

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

const LayerItemRow = memo(function({
  layer,
  index,
  isSelected,
  isDraggedOver,
  isExpanded,
  onClick,
  onToggleLock,
  onToggleHide,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onExpand,
} : {
  layer: Layer,
  index: number,
  isSelected: boolean,
  isDraggedOver: boolean,
  isExpanded: boolean,
  onClick: any,
  onToggleLock: any,
  onToggleHide: any,
  onRemove: any,
  onDragStart: any,
  onDragOver: any,
  onDrop: any,
  onExpand: any,
}) {
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

  return (
    <div
      className={cn("border-b border-slate-500", isDraggedOver && "border-t-2 border-t-slate-300")}
      draggable={true}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      <button
        className={cn(
          "flex flex-row justify-between items-center p-3 w-full bg-slate-700 cursor-pointer",
          isSelected && "bg-slate-800",
        )}
        onClick={(e) => onClick(e, layer.uuid)}
      >
        <div className="flex flex-row items-center gap-2 text-sm">
          {layerIcon!}
          {index + " " + layer.type + "_" + layer.uuid.slice(0,5)}
        </div>
        <div className="flex flex-row items-center gap-2">
          <div
            className="cursor-pointer hover:bg-slate-600 p-1 rounded"
            onClick={(e) => onExpand(e, layer.uuid)}
            title="Toggle layer info"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          <div
            className="cursor-pointer hover:bg-slate-600 p-1 rounded"
            onClick={(e) => onToggleLock(e, index)}
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
            onClick={(e) => onToggleHide(e, index)}
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
            onClick={(e) => onRemove(e, index)}
            title="Remove layer"
          >
            <Trash2 size={16} />
          </div>
        </div>
      </button>

      {isExpanded && (
        <LayerInfoPanel layer={layer} isSelected={isSelected} />
      )}
    </div>
  );
});

export default function LayersPane() {
  const { layers, setLayers } = useContext(LayersContext);
  const { inspectingLayerId, setInspectingLayerId } = useContext(PresentationContext);
  const { setSlideHistory } = useContext(HistoryContext);
  const layersPaneRef = useRef<HTMLDivElement | null>(null);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Scroll to the bottom of the layers pane when new layers are added
    if (layersPaneRef.current) {
      layersPaneRef.current.scrollTop = layersPaneRef.current.scrollHeight;
    }
  }, [layers]);

  const handleSelectRow = useCallback((e: any, layerId: string) => {
    e.stopPropagation();
    setInspectingLayerId(layerId);
  }, []);

  const toggleLockLayer = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
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
  }, [layers]);

  const toggleHideLayer = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
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
  }, [layers]);

  const removeLayer = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
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
  }, [layers]);

  const toggleLayerInfo = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, layerId: string) => {
    e.stopPropagation();
    setExpandedLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDragStartIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
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
  }, [dragStartIndex, setLayers, setSlideHistory]);

  return (
    <>
      <p className="text-white text-2xl m-2">Layers</p>
      <div className="overflow-y-auto h-full" ref={layersPaneRef}>
        {layers.map((layer, index) =>
          <LayerItemRow
            key={layer.uuid}
            layer={layer}
            index={index}
            onClick={handleSelectRow}
            onToggleLock={toggleLockLayer}
            onToggleHide={toggleHideLayer}
            onRemove={removeLayer}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onExpand={toggleLayerInfo}
            isSelected={inspectingLayerId === layer.uuid}
            isDraggedOver={draggedOverIndex === index}
            isExpanded={expandedLayers[layer.uuid] || false}
          />
          // <Test
          //   key={layer.uuid}
          //   layer={layer}
          //   index={index}
          //   onClick={handleSelectRow}
          //   isSelected={inspectingLayerId === layer.uuid}
          // />
        )}
      </div>
    </>
  )
}

const Test = memo(function ({layer, index, onClick, isSelected}: {layer: Layer, index: number, onClick: any, isSelected: boolean}) {
  console.log("Test component rendered for layer", layer.uuid, "index", index, "isSelected", isSelected);
  return (
    <div
      className={cn(isSelected ? "bg-slate-800" : "bg-slate-700", "p-3 cursor-pointer hover:bg-slate-600")}
      onClick={(e) => onClick(e, layer.uuid)}
    >
      <Square size={16} className="inline-block mr-2" />
      {layer.type} {index} {layer.uuid.slice(0,5)}
    </div>
  );
});