/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { MdAutorenew } from "react-icons/md";
import { motion } from "framer-motion";

const LabelResponse = ({ labelData, onUpdate }) => {
    const [labelExpression, setLabelExpression] = useState(
        labelData?.labelExpressionInfo?.expression || ""
    );
    const [color, setColor] = useState(labelData?.symbol?.color || "#1d4ed8");
    const [size, setSize] = useState(labelData?.symbol?.font?.size || 12);
    const [placement, setPlacement] = useState(
        labelData?.labelPlacement || "center-center"
    );
    const [isUpdating, setIsUpdating] = useState(false);

    const handleApply = () => {
        setIsUpdating(true);
        if (onUpdate) {
            onUpdate({
                labelExpressionInfo: { expression: labelExpression },
                symbol: {
                    type: "text",
                    color,
                    font: { size: +size, weight: "bold" },
                },
                labelPlacement: placement,
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
                    Label Settings
                </h3>
                <p className="text-sm text-gray-500">
                    {labelData?.message || "Adjust layer label settings"}
                </p>
            </div>

            {/* Label Expression */}
            <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                    Label Expression
                </label>
                <input
                    type="text"
                    value={labelExpression}
                    onChange={(e) => setLabelExpression(e.target.value)}
                    placeholder="مثلاً: $feature.Name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                />
            </div>

            {/* Color + Size */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                        Text Color
                    </label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                        Font Size (px)
                    </label>
                    <input
                        type="number"
                        value={size}
                        min={6}
                        max={40}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    />
                </div>
            </div>

            {/* Label Placement */}
            {/* <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                    Label Placement
                </label>
                <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white"
                >
                    <option value="center-center">Center</option>
                    <option value="above-right">Above Right</option>
                    <option value="above-left">Above Left</option>
                    <option value="below-right">Below Right</option>
                    <option value="below-left">Below Left</option>
                </select>
            </div> */}

            {/* Apply Button */}
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleApply}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200
                bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer`}
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
                {isUpdating ? "Updating..." : "Apply Label"}
            </motion.button>
        </motion.div>
    );
};

export default LabelResponse;
