import React from "react";
import { TfiMenuAlt } from "react-icons/tfi";
import { Menu, MenuItem } from "@mui/material";
import { LuLayers3, LuLogs, LuRedo2, LuUndo2 } from "react-icons/lu";
import { RiResetLeftFill } from "react-icons/ri";
import { useCompassContext } from "../../../context/CompassContext";
import { resetVLayer } from "../../../helpers/resetVLayer";
import toast from "react-hot-toast";
import UpdateDialog from "./UpdateDialog";
const VMenu = () => {
    const { dispatch, state } = useCompassContext();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    // reset
    async function handleResetVLayer() {
        const { view, FeatureLayer } = state;
        const newv = await resetVLayer(view, FeatureLayer);
        dispatch({ type: "VFeatureLayer", VFeatureLayer: newv });
        toast.success("VLayer Reset Successfully");
        handleClose();
    }
    // update Origin Layer

    return (
        <>
            <mdiv
                onClick={handleClick}
                className={` absolute -left-14 top-1
            flex items-center justify-center space-x-2 z-10 cursor-pointer  
            px-4 py-3 rounded-xl text-white font-medium
            hover:opacity-90 transition
            bg-gradient-to-r from-purple-500 to-blue-400
            animate-gradient shadow-[8px_5px_30px_rgba(20,180,255,0.45)]
            
        `}
            >
                <TfiMenuAlt className="text-xl font-bold" />
            </mdiv>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        "aria-labelledby": "basic-button",
                    },
                }}
            >
                <MenuItem onClick={handleResetVLayer}>
                    <p className="mr-2">Reset V-Layer</p>
                    <RiResetLeftFill />
                </MenuItem>
                <UpdateDialog
                    handleCloseMenu={handleClose}
                    content={
                        <MenuItem>
                            <p className="mr-2">Update Origin Layer</p>
                            <LuLayers3 />
                        </MenuItem>
                    }
                />

                {/* <MenuItem onClick={handleClose}>
                    <p className="mr-2">redo</p>
                    <LuRedo2 />
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <p className="mr-2">undo</p>
                    <LuUndo2 />
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <p className="mr-2">Edits Log</p>
                    <LuLogs />
                </MenuItem> */}
            </Menu>
        </>
    );
};

export default VMenu;
