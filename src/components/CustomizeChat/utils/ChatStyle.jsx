/* eslint-disable no-unused-vars */
import { Button, MenuItem, TextField } from "@mui/material";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

const ChatStyle = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            headerColor: "",
            headerFont: "",
            bodyColor: "",
            bodyFont: "",
            textAreaColor: "",
            textAreaFont: "",
        },
    });
    function onValid(data) {
        console.log(data);
        let filterForm = {};
        Object.keys(data).forEach((key) => {
            if (data[key] !== "" && data[key] != undefined) {
                filterForm[key] = data[key];
            }
        });
        setSearchParams(filterForm);
    }
    function resetForm() {
        // 1️⃣ القيم الافتراضية للفورم
        const sanitized = {
            headerColor: "",
            headerFont: "",
            bodyColor: "",
            bodyFont: "",
            textAreaColor: "",
            textAreaFont: "",
        };

        // 2️⃣ إعادة تعيين الفورم نفسه
        reset(sanitized);

        // 3️⃣ تحويل searchParams الحالي لكائن عادي
        const currentParams = Object.fromEntries(searchParams.entries());

        // 4️⃣ المفاتيح اللي تخص الفورم فقط
        const keysToRemove = Object.keys(sanitized);

        // 5️⃣ امسح المفاتيح دي من currentParams
        keysToRemove.forEach((key) => {
            delete currentParams[key];
        });

        // 6️⃣ رجع الـ search params بعد الحذف
        setSearchParams(currentParams);
    }

    return (
        <form
            onSubmit={handleSubmit(onValid)}
            className="w-full h-full flex flex-col items-center justify-start space-y-2"
        >
            {/* header */}
            <div className="fr w-full border-b-2 border-b-blue-800 p-0 ">
                <p className="text-xl font-bold font-mono">Style</p>
            </div>
            {/* header style */}
            {/* <div className="fr w-full border-b-2 border-b-blue-700 p-1 my-2 mb-4 bg-gray-100">
                <p className="text-lg font-mono text-blue-800 ">Header Style</p>
            </div> */}
            {/* headerColor */}
            <div className="w-full">
                <Controller
                    key="headerColor"
                    name="headerColor"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            value={field.value || ""} // Ensure value is never null
                            {...field}
                            className=" w-full text-right"
                            id="standard-basic"
                            type="color"
                            label="Header Color"
                            variant="standard"
                        />
                    )}
                />
            </div>
            {/* header font-type */}
            <div className="min-w-full ">
                <Controller
                    key="headerFont"
                    name="headerFont"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            variant="standard"
                            {...field}
                            className="w-full text-right"
                            id="standard-basic"
                            select
                            label="header Font-Type"
                        >
                            <MenuItem key="sans" value="sans">
                                sans
                            </MenuItem>
                            <MenuItem key="mono" value="mono">
                                mono
                            </MenuItem>
                            <MenuItem key="serif" value="serif">
                                serif
                            </MenuItem>
                            <MenuItem key="bold" value="bold">
                                bold
                            </MenuItem>
                        </TextField>
                    )}
                />
            </div>
            {/* Body */}
            {/* <div className="fr w-full border-b-2 border-b-blue-700 p-1 my-2 mb-4 bg-gray-100">
                <p className="text-lg text-blue-800 font-mono">Body Style</p>
            </div> */}
            {/* Body Color */}
            {/* <div className="w-full">
                <Controller
                    key="bodyColor"
                    name="bodyColor"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            value={field.value || ""} // Ensure value is never null
                            {...field}
                            className=" w-full text-right"
                            id="standard-basic"
                            type="color"
                            label="Body Color"
                            variant="standard"
                        />
                    )}
                />
            </div> */}
            {/* Body font-type */}
            <div className="min-w-full ">
                <Controller
                    key="bodyFont"
                    name="bodyFont"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            variant="standard"
                            {...field}
                            className="w-full text-right"
                            id="standard-basic"
                            select
                            label="Body Font-Type"
                        >
                            <MenuItem key="sans" value="sans">
                                sans
                            </MenuItem>
                            <MenuItem key="mono" value="mono">
                                mono
                            </MenuItem>
                            <MenuItem key="serif" value="serif">
                                serif
                            </MenuItem>
                            <MenuItem key="bold" value="bold">
                                bold
                            </MenuItem>
                        </TextField>
                    )}
                />
            </div>
            {/* Text */}
            {/* <div className="fr w-full border-b-2 border-b-blue-700 p-1 my-2 mb-4 bg-gray-100">
                <p className="text-lg font-mono text-blue-800">
                    TextField Style
                </p>
            </div> */}
            {/* TextArea Color */}
            <div className="w-full">
                <Controller
                    key="textAreaColor"
                    name="textAreaColor"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            value={field.value || ""} // Ensure value is never null
                            {...field}
                            className=" w-full text-right"
                            id="standard-basic"
                            type="color"
                            label="TextArea Color"
                            variant="standard"
                        />
                    )}
                />
            </div>
            {/* TextArea font-type */}
            <div className="min-w-full ">
                <Controller
                    key="textAreaFont"
                    name="textAreaFont"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <TextField
                            variant="standard"
                            {...field}
                            className="w-full text-right"
                            id="standard-basic"
                            select
                            label="TextArea Font-Type"
                        >
                            <MenuItem key="sans" value="sans">
                                sans
                            </MenuItem>
                            <MenuItem key="mono" value="mono">
                                mono
                            </MenuItem>
                            <MenuItem key="serif" value="serif">
                                serif
                            </MenuItem>
                            <MenuItem key="bold" value="bold">
                                bold
                            </MenuItem>
                        </TextField>
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
                        <p className="text-lg">Update Chat</p>
                    </Button>
                </div>
                {/* update data */}
                <Button
                    type="reset"
                    className="w-full"
                    variant="contained"
                    color="error"
                    onClick={resetForm}
                >
                    <p className="text-lg">Reset Chat</p>
                </Button>
            </div>
        </form>
    );
};

export default ChatStyle;
