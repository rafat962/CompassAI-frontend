import { Copy, Smartphone, Globe, Code } from "lucide-react"; // أيقونات جميلة
import { Button, Tooltip } from "@mui/material";
import { useState } from "react";

import React from "react";
import { BASE_URL_Share } from "../../../environment/devolpmentApi";
import toast from "react-hot-toast";

const ShareButtons = () => {
    const [copiedWeb, setCopiedWeb] = useState(false);
    const [copied, setCopied] = useState(false);

    // احصل على URL كامل بالـ searchParams الحالي
    const fullUrl = `${BASE_URL_Share}/share?${window.location.search.substring(1)}`;

    // نسخ للنص إلى الحافظة
    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);

            if (type === "web") {
                setCopiedWeb(true);
                setTimeout(() => setCopiedWeb(false), 2000);
            } else {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }

            toast.success("Copied to clipboard!");
        } catch (err) {
            console.error("Clipboard copy failed:", err);
            toast.error("❌ Failed to copy. Please try again.");
        }
    };

    // كود iframe جاهز
    const iframeCode = `<iframe src="${fullUrl}" width="100%" height="100%" frameborder="0"></iframe>`;

    return (
        <div className="flex flex-col w-full space-y-3 border-t border-t-blue-900 pt-3">
            <p className="text-lg font-semibold">🔗 Share Chat</p>

            {/* 🌐 Web link */}
            <Tooltip title="Copy Web URL">
                <Button
                    onClick={() => copyToClipboard(fullUrl, "web")}
                    variant="outlined"
                    color="primary"
                    className="w-full flex justify-between"
                >
                    <div className="flex items-center space-x-2">
                        <Globe size={20} />
                        <span>Copy Web URL</span>
                    </div>
                    {copiedWeb && (
                        <span className="text-green-600 mx-4">Copied!</span>
                    )}
                </Button>
            </Tooltip>

            {/* 🧩 Embed (iframe) */}
            <Tooltip title="Copy Iframe Embed Code">
                <Button
                    onClick={() => copyToClipboard(iframeCode, "IFrame")}
                    variant="outlined"
                    color="secondary"
                    className="w-full flex justify-between"
                >
                    <div className="flex items-center space-x-2">
                        <Code size={20} />
                        <span>Copy Embed Iframe</span>
                    </div>
                    {copied && (
                        <span className="text-green-600 mx-4">Copied!</span>
                    )}
                </Button>
            </Tooltip>
        </div>
    );
};
export default ShareButtons;
