"use client"

import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const LazyMap = dynamic(() => import("@/components/home/map"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <div className="relative">
        <div className="fixed inset-0 mx-auto p-4 z-10 h-fit bg-slate-700 border-1 w-xl flex flex-row gap-2">
          <Button>Control 1</Button>
          <Button>Control 2</Button>
        </div>
        <div className="mx-auto my-5 w-[98%] h-dvh z-1 relative">
          <LazyMap posix={[21.03, 105.804]} />
        </div>
      </div>
    </>
  );
}

