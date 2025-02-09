import type React from "react"
import { CheckCircle2, Circle, Clock, Hourglass } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Stage = {
    name: string
    estimated: number
    icon: React.ElementType
}

const initialStages: Stage[] = [
    { name: "Deploying zkApp to Mina", estimated: 180000, icon: Circle },
    { name: "Creating contract on Flare", estimated: 5000, icon: Circle },
];

export default function ModernMultiStageLoader({
    stages = initialStages,
    stageIndex = -1
}: { stages?: Stage[], stageIndex?: number }) {
    return (
        <AnimatePresence>
            {stageIndex >= 0 && (
                <motion.ul
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {stages.map((stage, i) => (
                        <StageItem
                            key={i}
                            stage={stage}
                            status={stageIndex > i ? "completed" : stageIndex === i ? "in-progress" : "pending"}
                        />
                    ))}
                </motion.ul>
            )}
        </AnimatePresence>
    )
}

function StageItem({ stage, status }: { stage: Stage, status: "pending" | "in-progress" | "completed" }) {
    const Icon = status === "completed" ? CheckCircle2 : stage.icon

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
                <span className="font-medium">{stage.name}</span>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Estimated {formatTime(stage.estimated)}</span>
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