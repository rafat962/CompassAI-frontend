/* eslint-disable no-unused-vars */
import { Button, TextField } from "@mui/material";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import ShareButtons from "./ShareButtons";

const ChatLayer = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            layerUrl: "",
            portalId: "",
            Token: "",
        },
    });
    function onValid(data) {
        console.log(data);

        // خُد القيم القديمة أولاً
        const currentParams = Object.fromEntries([...searchParams]);

        // صفّي الداتا الجديدة
        let filterForm = {};
        Object.keys(data).forEach((key) => {
            if (data[key] !== "" && data[key] != undefined) {
                filterForm[key] = data[key];
            } else {
                // لو الحقل فاضي، احذف المفتاح من params
                delete currentParams[key];
            }
        });

        // دمج القديم مع الجديد
        const mergedParams = { ...currentParams, ...filterForm };

        // تحديث الـ params
        setSearchParams(mergedParams);
    }
    function resetForm() {
        const sanitized = {
            layerUrl: "",
            portalId: "",
            Token: "",
        };
        reset(sanitized);

        setSearchParams({});
    }
    return (
        <>
            <form
                onSubmit={handleSubmit(onValid)}
                className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col items-center justify-start border-r-2 border-r-blue-950 space-y-2 px-2"
            >
                {/* header */}
                <div className="fr w-full border-b-2 border-b-blue-900 p-0 mr-3">
                    <p className="text-xl font-bold font-mono">
                        Layer Data And Share
                    </p>
                </div>
                {/* form */}
                {/* layer Url */}
                <div className="w-full">
                    <Controller
                        key="layerUrl"
                        name="layerUrl"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                value={field.value || ""} // Ensure value is never null
                                {...field}
                                className=" w-full text-right"
                                id="standard-basic"
                                type="text"
                                label="layer Url"
                                variant="standard"
                                required
                            />
                        )}
                    />
                </div>
                {/* Portal ID */}
                <div className="w-full">
                    <Controller
                        key="portalId"
                        name="portalId"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                value={field.value || ""} // Ensure value is never null
                                {...field}
                                className=" w-full text-right"
                                id="standard-basic"
                                type="text"
                                label="Portal ID"
                                variant="standard"
                                required
                            />
                        )}
                    />
                </div>
                {/* Token */}
                <div className="w-full">
                    <Controller
                        disabled
                        key="Token"
                        name="Token"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                value={field.value || ""} // Ensure value is never null
                                {...field}
                                className=" w-full text-right"
                                id="standard-basic"
                                type="text"
                                label="Token"
                                variant="standard"
                            />
                        )}
                    />
                </div>
                <div className="fc w-full space-y-4">
                    {/* update data */}
                    <div className=" w-full">
                        <Button
                            type="submit"
                            className="w-full"
                            variant="contained"
                        >
                            <p className="text-lg">Update Layer</p>
                        </Button>
                    </div>
                    {/* update data */}
                    {/* <Button
                        type="reset"
                        className="w-full"
                        variant="contained"
                        color="error"
                        onClick={resetForm}
                    >
                        <p className="text-lg">Reset Chat</p>
                    </Button> */}
                </div>
                {/* Share */}
                <ShareButtons />
            </form>
        </>
    );
};

export default ChatLayer;
