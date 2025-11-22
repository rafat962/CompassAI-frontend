/* eslint-disable no-unused-vars */
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCompassContext } from "../../../context/CompassContext";
import { updateOriginLayer } from "../../../helpers/updateOriginLayer";
import { LuLoader } from "react-icons/lu";
export default function UpdateDialog({ content, handleCloseMenu }) {
    const navigate = useNavigate();
    const { dispatch, state } = useCompassContext();
    const [loading, setLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        handleCloseMenu();
    };
    const handleUpdate = async () => {
        setLoading(true);
        const { VFeatureLayer, FeatureLayer } = state;
        await updateOriginLayer(VFeatureLayer, FeatureLayer);
        toast.success("main layer Updated Successfully");
        handleCloseMenu();
        setLoading(false);
    };

    return (
        <React.Fragment>
            <div className="w-full" onClick={handleClickOpen}>
                {content}
            </div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="reflect-dialog-title"
                aria-describedby="reflect-dialog-description"
            >
                <DialogTitle id="reflect-dialog-title">
                    Confirm Reflection
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="reflect-dialog-description">
                        Are you sure you want to apply all changes from the
                        V-Layer to your main layer? This action will update the
                        main layer data and cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        disabled={loading}
                        onClick={handleUpdate}
                        autoFocus
                        color="primary"
                        variant="contained"
                    >
                        Apply Changes
                        {loading && (
                            <LuLoader className="mx-2 text-xl animate-spin" />
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
