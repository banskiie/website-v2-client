"use client"

import Link, { LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { PropsWithChildren, MouseEvent, useEffect } from "react"

type ScrollLinkProps = LinkProps & {
  className?: string
}

export default function ScrollLink({
  href,
  className,
  children,
  ...props
}: PropsWithChildren<ScrollLinkProps>) {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [pathname])

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const [urlPath, hash] = (href as string).split("#")

    if (hash && pathname === urlPath) {
      e.preventDefault()
      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
        history.pushState(null, "", `#${hash}`)
      }
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
