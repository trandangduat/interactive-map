import { ArrowLayer, CircleLayer, Layer, RectLayer, SlideContext } from "@/app/page";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pin, PinOff, Square, Trash2 } from "lucide-react";
import { JSX, useContext, useState } from "react";

// Layer info display component
function LayerInfoPanel({ layer }: { layer: Layer }) {
  return (
    <div className="p-3 bg-slate-800 text-sm rounded overflow-auto shadow m-0">
      <div className="flex items-center justify-between mb-3 border-b border-slate-500 pb-2">
        <h3 className="font-semibold text-base">Layer Details</h3>
        <div className="px-2 py-0.5 bg-slate-600 rounded text-xs">{layer.type}</div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <p><span className="font-medium">Layer #</span></p>
          <p>{layer.order}</p>
        </div>
        <div className="flex justify-between">
          <p><span className="font-medium">Pin Status</span></p>
          <p>{layer.isPinned ? '📌 Pinned' : '🔓 Unpinned'}</p>
        </div>
        <div className="flex justify-between">
          <p><span className="font-medium">Visibility</span></p>
          <p>{layer.isHidden ? '🙈 Hidden' : '👁️ Visible'}</p>
        </div>

        {layer.type === "rectangle" && (
          <div className="mt-2">
            <p className="font-medium">Bounds:</p>
            <p className="pl-2 text-xs">Area on map: {JSON.stringify((layer as RectLayer).bounds)}</p>
          </div>
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

        <div className="mt-3 border-t border-slate-400 pt-2">
          <p className="font-medium">Style:</p>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-3 h-3 border border-white"
              style={{backgroundColor: layer.pathOptions?.color || 'blue'}}
            ></div>
            <p>Stroke: {layer.pathOptions?.color || 'default'}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-3 h-3 border border-white"
              style={{backgroundColor: layer.pathOptions?.fillColor || 'blue'}}
            ></div>
            <p>Fill: {layer.pathOptions?.fillColor || 'default'}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p>Opacity: {layer.pathOptions?.fillOpacity || 'default'}</p>
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

        const isExpanded = expandedLayers[layer.uuid] || false;
        const isSelected = inspectingLayerId === layer.uuid;

        return (
          <div key={layer.uuid} className="border-b border-slate-500">
            <button
              className={cn(
                "flex flex-row justify-between items-center p-3 w-full bg-slate-700 hover:bg-slate-800 cursor-pointer",
                isSelected && "bg-slate-800",
              )}
              onClick={() => setInspectingLayerId(layer.uuid)}
            >
              <div className="flex flex-row items-center gap-2">
                {layerIcon!}
                {layer.order + " " + layer.type}
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
              <LayerInfoPanel layer={layer} />
            )}
          </div>
        );
      })}
    </div>
  );
}