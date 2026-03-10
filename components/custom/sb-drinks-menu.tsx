import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MenuItem from "./MenuItem"
import { drinks } from "./data/drink"

export default function ShuttleBrewMenu() {
    const [showMore, setShowMore] = useState(false)
    const fourthRef = useRef<HTMLDivElement>(null)
    const fifthRef = useRef<HTMLDivElement>(null)

    const handleShowMore = () => {
        setShowMore(true)
        setTimeout(() => {
            fifthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 100)
    }

    const handleShowLess = () => {
        setShowMore(false)
        setTimeout(() => {
            fourthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 100)
    }

    return (
        <div
            id="menu"
            className="relative w-full min-h-screen bg-gradient-to-r from-[#5c2d0c] via-[#7b3f0f] to-[#3a1b07] flex flex-col justify-start items-center overflow-hidden"
        >
            {/* First 4 items */}
            {drinks.slice(0, 4).map((drink, idx) => (
                <MenuItem
                    key={idx}
                    number={idx + 1}
                    title={drink.name}
                    description={drink.description}
                    img={drink.img}
                    forwardRef={idx === 3 ? fourthRef : undefined}
                    reverse={(idx + 5) % 2 === 0}
                    bigger={idx === 0 || idx === 2} // Example: make some items bigger
                />
            ))}

            {/* Additional items with animation */}
            <AnimatePresence mode="wait">
                {showMore && (
                    <motion.div
                        key="more-items"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full"
                    >
                        {drinks.slice(4).map((drink, idx) => (
                            <MenuItem
                                key={idx + 5}
                                number={idx + 5}
                                title={drink.name}
                                description={drink.description}
                                img={drink.img}
                                forwardRef={idx === 0 ? fifthRef : undefined}
                                reverse={(idx + 5) % 2 === 0}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Buttons - responsive spacing */}
            <div className="w-full flex justify-center py-12 sm:py-16 md:py-20">
                {!showMore ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShowMore}
                        className="cursor-pointer flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 
                            rounded-full bg-gradient-to-r from-[#ffbc52] to-[#b45309] 
                            text-white font-semibold text-sm sm:text-base shadow-lg
                            hover:shadow-xl transition-shadow"
                    >
                        More <span className="text-xl sm:text-2xl">↓</span>
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShowLess}
                        className="cursor-pointer flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 
                            rounded-full bg-gradient-to-r from-[#b45309] to-[#ffbc52] 
                            text-white font-semibold text-sm sm:text-base shadow-lg
                            hover:shadow-xl transition-shadow"
                    >
                        Show Less <span className="text-xl sm:text-2xl">↑</span>
                    </motion.button>
                )}
            </div>
        </div>
    )
}