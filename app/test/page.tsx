"use client"

import { useCallback, useState } from "react";

export default function Page() {
  const [a, setA] = useState<string>("hello");

  const gg = useCallback(() => {
    console.log(a);
    setA((prev) => {
      console.log("!", prev);
    })
  }, []);

  const bb = () => {
    setA("world");
  }

  const cc = () => {
    console.log(a);
  }

  return (
    <>
      {a}
      <button onClick={gg}>Click me</button>
      <button onClick={bb}>Change state</button>
      <button onClick={cc}>Check state</button>
    </>
  );
}