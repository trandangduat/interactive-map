import { useContext } from "react";
import { Button } from "../ui/button";
import { RectLayer, SlideContext } from "@/app/page";
import { v4 as uuidv4 } from "uuid";

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
    setIsPresenting,
    setCurrentLayerIndex,
  } = useContext(SlideContext);

  const handleRect = () => {
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
  };

  const handleArrow = () => {
  };

  const handlePresent = () => {
    setIsPresenting(true);
    setCurrentLayerIndex(-1);
    document.documentElement.requestFullscreen();
  };

  return (
    <div className="mx-auto p-4 z-10 h-fit bg-slate-600 border-1 flex flex-row items-center gap-2">
      <Button onClick={handleRect}>Rectangle</Button>
      <Button onClick={handleCircle}>Circle</Button>
      <Button onClick={handleArrow}>Arrow</Button>
      <Button onClick={handlePresent}>Present</Button>
      <ColorPicker />
    </div>
  )
}