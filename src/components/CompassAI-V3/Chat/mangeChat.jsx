import { useEffect } from "react";
import { useGetLayerFields } from "./hooks/useChat";
import ChatBody from "./utils/ChatBody/ChatBody";
import Header from "./utils/Header/Header";
import MessageBox from "./utils/MessageBox/MessageBox";
import { useDispatch, useSelector } from "react-redux";
import { AddFields } from "./redux/Compass-V3Slice";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
const MangeChat = () => {
    const [searchParams] = useSearchParams();
    const { getFields } = useGetLayerFields();
    const { messages } = useSelector((state) => state.CompassV3);
    const dispatch = useDispatch();
    const { layerUrl } = useSelector((state) => state.CompassV3);
    const token = searchParams.get("token");
    // get layer fields
    useEffect(() => {
        if (messages.length > 0) return;
        if (!layerUrl) return;
        getFields(
            { featureUrl: layerUrl, token },
            {
                onSuccess: (data) => {
                    dispatch(
                        AddFields({ fields: data.fields, name: data.name })
                    );
                },
            },
            {
                onError: (error) => {
                    toast.error(error?.message || "");
                },
            }
        );
    }, [layerUrl]);
    return (
        <div className="w-full h-full bg-white flex flex-col items-between justify-between  rounded-2xl overflow-hidden  border-2 border-blue-500">
            {/* header */}
            <div
                style={{
                    backgroundColor:
                        searchParams.get("headerColor") || "transparent",
                }}
                className={`w-full ${searchParams.get("headerColor") ? `` : "bg-gradient-to-r from-[#0e7490] via-[#3b82f6] to-[#4f46e5]"}  flex flex-col space-y-3 p-2 border-b-2 border-b-blue-800`}
            >
                <Header />
            </div>
            {/* Body */}
            <div className="w-full bg-white h-full  md:h-[78%] overflow-auto">
                <ChatBody />
            </div>
            {/* Message Box */}
            <div className="w-full bg-white flex flex-col items-center justify-start ">
                <MessageBox />
            </div>
        </div>
    );
};

export default MangeChat;
