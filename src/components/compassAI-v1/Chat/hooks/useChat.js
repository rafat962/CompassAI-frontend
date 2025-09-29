/* eslint-disable no-unused-vars */
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendMessageApi } from "../helpers/chat.api";

// -------------------- Send Message --------------------
export function useSendMessage() {
    const { mutate: SendMessageMutate, isPending } = useMutation({
        mutationFn: sendMessageApi,
        onError: (error, variables, context) => {
            console.log("error", error);
            // An error happened!
            toast.error(error?.message || "");
        },
        onSuccess: (data, variables, context) => {
            if (data.status === "error") {
                return;
            }
            // reset();
        },
    });
    return { isPending, SendMessageMutate };
}
