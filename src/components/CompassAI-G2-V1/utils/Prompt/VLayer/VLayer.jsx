/* eslint-disable no-unused-vars */
import { Switch } from "@mui/material";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useCompassContext } from "../../../context/CompassContext";
import { AnimatePresence, motion } from "framer-motion";
import VMenu from "./VMenu";
import { useSearchParams } from "react-router-dom";
const label = { inputProps: { "aria-label": "Switch demo" } };

const VLayer = () => {
    const [mode, setMode] = useState(true);
    const [searchParams] = useSearchParams();
    const { state, dispatch } = useCompassContext();
    const ApiKey = searchParams.get("ApiKey");

    // Check if the current environment is sandbox
    const isSandbox = ApiKey === "sandbox";

    const handleToggle = () => {
        // Prevent toggling if in sandbox mode
        if (isSandbox) return;

        const newMode = !mode;
        dispatch({ type: "VLayerMode", VLayerMode: newMode });
        setMode(newMode);

        if (newMode) {
            toast.success("Virtual Layer Mode On", { duration: 4000 });
        } else {
            toast.success("Virtual Layer Mode Off", { duration: 4000 });
        }
    };

    return (
        <div className="relative">
            <button
                disabled={isSandbox} // Disable the button interaction
                onClick={handleToggle}
                className={`
                    flex items-center justify-center space-x-2 z-10 
                    px-6 py-2 rounded-xl text-white font-medium
                    transition duration-300
                    ${
                        isSandbox
                            ? "bg-gray-600/50 cursor-not-allowed opacity-60 grayscale"
                            : "cursor-pointer bg-gradient-to-r from-purple-500 to-blue-400 shadow-[0_5px_15px_rgba(20,120,255,0.45)] hover:opacity-90"
                    }
                    ${mode && !isSandbox ? "animate-gradient shadow-[8px_5px_30px_rgba(20,180,255,0.45)]" : ""}
                `}
            >
                <p className="font-mono">V-Layer</p>
                <Switch
                    checked={mode}
                    disabled={isSandbox} // Disable the switch visual/interaction
                    {...label}
                    color="warning"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggle();
                    }}
                />
            </button>

            {/* Menu - Hidden if Sandbox is true as per your code */}
            {!isSandbox && (
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
            )}
        </div>
    );
};

export default VLayer;
