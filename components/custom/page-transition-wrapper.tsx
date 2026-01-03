"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionWrapperProps {
    children: ReactNode
}

export default function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{
                    opacity: 0,
                    x: pathname.includes('/ppglProducts') ? 100 : -100,
                    scale: 0.95
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1
                }}
                exit={{
                    opacity: 0,
                    x: pathname.includes('/steelProducts') ? -100 : 100,
                    scale: 0.95
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}