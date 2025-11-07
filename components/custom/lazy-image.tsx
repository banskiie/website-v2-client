import { useState } from "react"
import Image from "next/image"

export default function LazyImage({ src, alt, width, height, className }: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}) {
  const [loading, setLoading] = useState(true)

  return (
    <div className="relative flex items-center justify-center bg-gray-200 rounded-md overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-[#FFBC52] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setLoading(false)}
      />
    </div>
  )
}
