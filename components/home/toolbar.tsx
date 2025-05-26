import { useContext } from "react";
import { Button } from "../ui/button";
import { RectLayer, SlideContext } from "@/app/page";
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
    drawingStates,
    setIsPresenting,
    setCurrentLayerIndex,
    setDrawingStates,
    setInspectingLayerId
  } = useContext(SlideContext);

  const handleRect = () => {
    setDrawingStates(prev => ({
      ...prev,
      isDrawing: true,
      drawingMode: 0,
    }));
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
    setInspectingLayerId(null);
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