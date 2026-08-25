"use client"

import { GlobeBars } from "@/components/ui/cobe-globe-bars"

export function GlobeBarsDemo() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-black p-8 overflow-hidden">
      <div className="w-full max-w-lg">
        <GlobeBars />
      </div>
    </div>
  )
}

export default GlobeBarsDemo
