import { useContext } from "react";
import { Button } from "../ui/button";
import { RectLayer, SlideContext } from "@/app/page";
import { v4 as uuidv4 } from "uuid";
import { Check } from "lucide-react";

const basicColors = [
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#00FFFF", // Cyan
  "#FF00FF", // Magenta
  "#FFA500", // Orange
  "#800080", // Purple
  "#A52A2A", // Brown
  "#808080"  // Gray
];

function ColorPicker() {
  const { drawingStates, setDrawingStates } = useContext(SlideContext);

  return (
    <div className="flex flex-wrap gap-2">
      {basicColors.map(color => (
        <button
          key={color}
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: color }}
          onClick={() => {
            setDrawingStates(prev => ({
              ...prev,
              strokeColor: color,
              fillColor: color,
            }));
          }}
        >
          {drawingStates.strokeColor === color ? (
            <span className="text-white">✔</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export default function Toolbar() {
  const {
    layers,
    setLayers,
    latLng,
    drawingStates,
    setIsPresenting,
    setCurrentLayerIndex,
    setDrawingStates,
  } = useContext(SlideContext);

  const handleRect = () => {
    setDrawingStates(prev => ({
      ...prev,
      isDrawing: true,
      drawingMode: 0,
    }));
    const newLayer: RectLayer = {
      type: "rectangle",
      order: layers.length,
      uuid: uuidv4(),
      isPinned: false,
      isHidden: false,
      bounds: [[latLng[0] - Math.random() * 0.001, latLng[1] - Math.random() * 0.001], [latLng[0] + Math.random() * 0.001, latLng[1] + Math.random() * 0.001]],
      pathOptions: {
        color: "red",
        fillColor: "red",
        fillOpacity: 0.5,
      },
    };
    setLayers([...layers, newLayer]);
  };

  const handleCircle = () => {
    setDrawingStates(prev => ({
      ...prev,
      isDrawing: true,
      drawingMode: 1,
    }));
  };

  const handleArrow = () => {
    setDrawingStates(prev => ({
      ...prev,
      isDrawing: true,
      drawingMode: 2,
    }));
  };

  const handleHand = () => {
    setDrawingStates(prev => ({
      ...prev,
      isDrawing: false,
      drawingMode: -1, // Toggle drawing mode
    }));
  };

  const handlePresent = () => {
    setIsPresenting(true);
    setCurrentLayerIndex(-1);
    setDrawingStates(prev => ({
      ...prev,
      isDrawing: false,
      drawingMode: -1,
    }));
    document.documentElement.requestFullscreen();
  };

  return (
    <div className="mx-auto p-4 z-10 w-full h-fit bg-slate-600 border-1 flex flex-row items-center gap-2">
      <Button onClick={handleHand}>
        {!drawingStates.isDrawing ? <Check /> : ""}
        Hand
      </Button>
      <Button onClick={handleRect}>
        {drawingStates.isDrawing && drawingStates.drawingMode === 0 ? <Check /> : ""}
        Rectangle
      </Button>
      <Button onClick={handleCircle}>
        {drawingStates.isDrawing && drawingStates.drawingMode === 1 ? <Check /> : ""}
        Circle
      </Button>
      <Button onClick={handleArrow}>
        {drawingStates.isDrawing && drawingStates.drawingMode === 2 ? <Check /> : ""}
        Arrow
      </Button>
      <Button onClick={handlePresent}>Present</Button>
      <ColorPicker />
    </div>
  )
}