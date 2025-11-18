import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FlipWords } from "../../../../../shared/ui/aceternityUI/FlipWords";
import { ToggleSelectField } from "../../redux/Compass-V3Slice";
import SystemMessage from "./SystemMessage";
import UserMessage from "./UserMessage";
import AIResponse from "./AIResponse";
import { HiOutlineCloudArrowDown } from "react-icons/hi2";

const ChatBody = () => {
    const { messages, aiLoader } = useSelector((state) => state.CompassV3);
    const dispatch = useDispatch();
    const selectField = (field) => dispatch(ToggleSelectField(field));

    const CopyResponse = (message) => {
        if (!message) return;
        navigator.clipboard
            .writeText(message)
            .then(() => toast.success("Message copied to clipboard ✅"))
            .catch(() => toast.error("❌ Failed to copy message"));
    };

    // ✅ ref للعنصر الأخير في الشات
    const chatEndRef = useRef(null);

    // ✅ كل ما تتغير الرسائل أو اللودر، انزل للأسفل
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, aiLoader]);

    return (
        <>
            {/* No Chat Case */}
            {messages.length === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20">
                        <img
                            className="w-full h-full object-cover"
                            src="/icons8-chat-bot-96.gif"
                            alt="ChatBot"
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-1">
                        <h1 className="text-xl font-thr font-semibold">
                            <FlipWords words={["CompassAI"]} />
                        </h1>
                        <p className="font-sec text-sm text-center">
                            Hi, I'm Compass your AI Agent, How Can I Help You?
                        </p>
                    </div>
                </div>
            )}

            {/* Chat messages */}
            {messages.length > 0 && (
                <div className="w-full h-full flex flex-col items-end justify-start p-4 space-y-3 font-sec overflow-y-auto">
                    {messages.map((item, index) => {
                        if (item.role === "user") {
                            return (
                                <React.Fragment key={index}>
                                    <UserMessage
                                        item={item}
                                        CopyResponse={CopyResponse}
                                    />
                                    {/* test */}
                                    <AIResponse
                                        item={item}
                                        CopyResponse={CopyResponse}
                                    />
                                </React.Fragment>
                            );
                        } else if (item.role === "ai") {
                            return (
                                <AIResponse
                                    key={index}
                                    data={item}
                                    CopyResponse={CopyResponse}
                                />
                            );
                        } else if (item.role === "system") {
                            return (
                                <SystemMessage
                                    key={index}
                                    selectField={selectField}
                                    item={item}
                                />
                            );
                        }
                    })}

                    {/* Loader */}
                    {aiLoader && (
                        <div className="pb-6 flex w-full items-start justify-start relative">
                            <div className="w-12 h-12">
                                <img
                                    src="/icons8-chat-bot-96.gif"
                                    alt="loading"
                                    className="object-fill "
                                />
                            </div>
                            {/* Thinking */}
                            {/* <div className=" space-x-1 absolute left-13 top-6 w-30 h-14 bg-blue-300 rounded-tl-md rounded-2xl flex items-center justify-center">
                                <HiOutlineCloudArrowDown className="text-xl" />
                                <p>Sympology</p>
                            </div> */}
                        </div>
                    )}

                    {/* ✅ العنصر المرجعي اللي بنسحب له */}
                    <div ref={chatEndRef}></div>
                </div>
            )}
        </>
    );
};

export default ChatBody;
