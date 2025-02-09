import type React from "react"
import { CheckCircle2, Circle, Clock, Hourglass } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingCardsProps {
    cards: LoadingCard[];
    index?: number;
};

export interface LoadingCard {
    name: string;
    estimated: number;
};

interface LoadingCardProps extends LoadingCard {
    status: "pending" | "in-progress" | "completed";
}

export default function LoadingCards({
    cards,
    index = -1
}: LoadingCardsProps) {
    return (
        <AnimatePresence>
            {index >= 0 && (
                <motion.ul
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {cards.map((card, i) => (
                        <LoadingCard
                            key={i}
                            name={card.name}
                            estimated={card.estimated}
                            status={index > i ? "completed" : index === i ? "in-progress" : "pending"}
                        />
                    ))}
                </motion.ul>
            )}
        </AnimatePresence>
    )
}

function LoadingCard({
    name,
    estimated,
    status
}: LoadingCardProps) {
    const Icon = status === "completed" ? CheckCircle2 : Circle;

    return (
        <motion.li
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-4 p-4 rounded-lg bg-white shadow-sm"
        >
            <Icon
                className={`w-8 h-8 ${status === "completed"
                    ? "text-green-500"
                    : status === "in-progress"
                        ? "text-blue-500 animate-pulse"
                        : "text-gray-400"
                    }`}
            />
            <div className="flex-grow">
                <span className="font-medium">{name}</span>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Estimated {formatTime(estimated)}</span>
                </div>
            </div>
            {status === "in-progress" && <Hourglass className="w-5 h-5 text-blue-500 animate-pulse" />}
            <span
                className={`
        text-sm font-semibold
        ${status === "completed"
                        ? "text-green-500"
                        : status === "in-progress"
                            ? "text-blue-500"
                            : "text-gray-400"
                    }
      `}
            >
                {status === "completed" ? "Completed" : status === "in-progress" ? "In Progress" : "Pending"}
            </span>
        </motion.li>
    )
}

function formatTime(ms: number) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
}