import React from "react"

export default function ShimmerSkeleton({
  className = "",
}: {
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-300/60 to-transparent" />
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}