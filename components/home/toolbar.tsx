import { useContext } from "react";
import { Button } from "../ui/button";
import { RectLayer, SlideContext } from "@/app/page";
import { v4 as uuidv4 } from "uuid";

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
    <div className="mx-auto p-4 z-10 h-fit bg-slate-600 border-1 w-xl flex flex-row gap-2">
      <Button onClick={handleRect}>Rectangle</Button>
      <Button onClick={handleCircle}>Circle</Button>
      <Button onClick={handleArrow}>Arrow</Button>
      <Button onClick={handlePresent}>Present</Button>
    </div>
  )
}