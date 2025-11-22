/* eslint-disable no-unused-vars */
import { Switch } from "@mui/material";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useCompassContext } from "../../../context/CompassContext";
import { AnimatePresence, motion } from "framer-motion";
import VMenu from "./VMenu";
const label = { inputProps: { "aria-label": "Switch demo" } };

const VLayer = () => {
    const [mode, setMode] = useState(true);
    const { state, dispatch } = useCompassContext();
    // menu

    const handleToggle = () => {
        const newMode = !mode;
        dispatch({ type: "VLayerMode", VLayerMode: newMode });
        setMode(newMode);
        if (newMode) {
            toast.success(
                "Virtual Layer Mode On",
                { duration: 4000 } // 5 ثواني
            );
        } else {
            toast.success("Virtual Layer Mode Off", { duration: 4000 });
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className={`
            flex items-center justify-center space-x-2 z-10 cursor-pointer  
            px-6 py-2 rounded-xl text-white font-medium
            shadow-[0_5px_15px_rgba(20,120,255,0.45)]
            hover:opacity-90 transition
            bg-gradient-to-r from-purple-500 to-blue-400
            ${mode ? "animate-gradient shadow-[8px_5px_30px_rgba(20,180,255,0.45)]" : ""}
        `}
            >
                <p className="font-mono">V-Layer</p>
                <Switch
                    checked={mode}
                    {...label}
                    color="warning"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggle();
                    }}
                />
            </button>
            {/* menu */}

            <AnimatePresence>
                {mode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <VMenu />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VLayer;
