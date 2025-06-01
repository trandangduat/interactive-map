import { cn } from "@/lib/utils";
import { ChevronUp, Eye, EyeOff, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import { useContext, useEffect, useRef } from "react";
import { HistoryContext } from "@/app/page";

export default function HistoryPane() {
  const {
    slideHistory,
    undo,
    redo
  } = useContext(HistoryContext);

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
