"use client";

import Image from "next/image";
import { useState } from "react";

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className = "" }: LogoMarkProps) {
  const [src, setSrc] = useState("/shield-logo.svg");

  return (
    <div
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-[#121212] ${className}`}
    >
      <Image
        src={src}
        alt="Apex Clean logo"
        fill
        sizes="40px"
        className="object-cover"
        onError={() => setSrc("/favicon.ico")}
        priority
      />
    </div>
  );
}
