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
        }, 15)
    }

    const handleShowLess = () => {
        setShowMore(false)
        requestAnimationFrame(() => {
            setTimeout(() => {
                fourthRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                })
            }, 400)
        })
    }

    return (
        <div
            id="menu"
            className="relative w-full min-h-screen bg-gradient-to-r from-[#5c2d0c] via-[#7b3f0f] to-[#3a1b07] flex flex-col justify-start items-center overflow-hidden"
        >
            {drinks.slice(0, 4).map((drink, idx) => (
                <MenuItem
                    key={idx}
                    number={idx + 1}
                    title={drink.name}
                    description={drink.description}
                    img={drink.img}
                    forwardRef={idx === 3 ? fourthRef : undefined}
                    reverse={(idx + 5) % 2 === 0}
                />
            ))}

            <AnimatePresence>
                {showMore && (
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 80 }}
                        transition={{ duration: 0.2, ease: "easeIn" }}
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

            {!showMore ? (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShowMore}
                    className="cursor-pointer mt-22 mb-18 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ffbc52] to-[#b45309] text-white font-semibold shadow-lg"
                >
                    More <span className="text-xl">↓</span>
                </motion.button>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShowLess}
                    className="cursor-pointer mt-22 mb-18 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#b45309] to-[#ffbc52] text-white font-semibold shadow-lg"
                >
                    Show Less <span className="text-xl">↑</span>
                </motion.button>
            )}
        </div>
    )
}
