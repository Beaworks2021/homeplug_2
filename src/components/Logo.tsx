import React from 'react'

export function Logo({ className = "", size = "default" }: { className?: string, size?: "default" | "large" }) {
  const height = size === "large" ? "h-10" : "h-8"
  const fontSize = size === "large" ? "text-4xl" : "text-2xl"
  const iconSize = size === "large" ? 40 : 28

  return (
    <div className={`flex items-center font-bold tracking-tight select-none ${className}`}>
      {/* H */}
      <span className={`${fontSize} text-[#0F172A]`}>H</span>
      
      {/* Plug Icon */}
      <div className="mx-0.5 relative flex items-center justify-center">
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Prongs */}
          <path d="M8 2V7" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M16 2V7" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"/>
          
          {/* Body */}
          <path d="M4 8H20V15C20 19.4183 16.4183 23 12 23C7.58172 23 4 19.4183 4 15V8Z" fill="#0F172A"/>
          
          {/* V-Notch (White) - simulating the cut at the top */}
          <path d="M4 8L12 14L20 8H4Z" fill="white"/>
          
          {/* Eyes */}
          <circle cx="9" cy="18" r="1.5" fill="white"/>
          <circle cx="15" cy="18" r="1.5" fill="white"/>
        </svg>
      </div>

      {/* me */}
      <div className="relative">
        <span className={`${fontSize} text-[#0F172A]`}>me</span>
        {/* Leaf/Roof Accent above 'm' */}
        <div className="absolute -top-3 left-0 w-full flex justify-center">
             <svg width="20" height="10" viewBox="0 0 24 12" fill="none">
                <path d="M12 10C12 10 8 4 2 6" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M12 10C12 10 16 4 22 6" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/>
             </svg>
        </div>
      </div>

      {/* P */}
      <span className={`${fontSize} text-[#06b6d4]`}>P</span>

      {/* lug */}
      <span className={`${fontSize} text-[#94a3b8]`}>lug</span>
    </div>
  )
}
