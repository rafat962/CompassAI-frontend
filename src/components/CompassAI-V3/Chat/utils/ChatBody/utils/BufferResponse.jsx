/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { MdAutorenew } from "react-icons/md";
import { motion } from "framer-motion";

const BufferResponse = ({ bufferData, onUpdate }) => {
    const [color, setColor] = useState(bufferData?.color || "#8b5cf6");
    const [distance, setDistance] = useState(bufferData?.distanceMeters || 10);
    const [unit, setUnit] = useState("meters");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = () => {
        setIsUpdating(true);
        // ✅ استدعاء التحديث فقط بدون تغيير الزوم أو الفيو
        console.log("distanceMeters", +distance);
        if (onUpdate) {
            onUpdate({
                color,
                distance,
                unit,
                zoomToBuffer: false, // نمنع الزوم أو التحريك
            });
        }

        setTimeout(() => setIsUpdating(false), 800);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-gray-800 font-semibold text-lg">
                    Buffer Settings
                </h3>
                <p className="text-sm text-gray-500">
                    {bufferData?.message || "Adjust your buffer parameters"}
                </p>
            </div>

            {/* Color Picker */}
            <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                    Buffer Color
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <span className="text-gray-700 text-sm">
                        {color.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Distance Input */}
            <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                    Distance
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={distance}
                        min={0}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                    />
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                    >
                        <option value="meters">Meters</option>
                        <option value="kilometers">Kilometers</option>
                    </select>
                </div>
            </div>

            {/* Apply Button */}
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdate}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200
                bg-violet-100 text-violet-700 hover:bg-violet-200 cursor-pointer`}
            >
                <motion.span
                    animate={isUpdating ? { rotate: 360 } : { rotate: 0 }}
                    transition={{
                        repeat: isUpdating ? Infinity : 0,
                        duration: 0.8,
                        ease: "linear",
                    }}
                >
                    <MdAutorenew className="text-lg" />
                </motion.span>
                {isUpdating ? "Updating..." : "Apply Buffer"}
            </motion.button>
        </motion.div>
    );
};

export default BufferResponse;
