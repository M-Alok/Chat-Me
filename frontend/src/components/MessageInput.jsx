import { useRef, useState } from "react"
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore"
import { Image, Send, X } from 'lucide-react';
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { selectedUser, sendMessage } = useChatStore();
    const { selectedGroup, sendGroupMessage } = useGroupStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file?.type?.startsWith("image/")) {
            toast.error('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result);
        }
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;
        
        try {
            if (selectedGroup) {
                await sendGroupMessage({
                    groupId: selectedGroup._id,
                    senderId: useAuthStore.getState().authUser?._id,
                    text: text.trim(),
                    image: imagePreview,
                });
            } else if (selectedUser) {
                await sendMessage({
                    text: text.trim(),
                    image: imagePreview,
                });
            }

            // Clear form
            setText("");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.log("Failed to send message: ", error);
            toast.error("Failed to send message");
        }
    };

    // Don't render if no chat is selected
    // if (!selectedUser && !selectedGroup) return null;

    return (
        <div className="p-4 w-full">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            type="button"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full input input-bordered rounded-lg input-md"
                    />

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`btn btn-ghost ${imagePreview && "text-green-600"} rounded`}
                    >
                        <Image size={20} />
                    </button>
                </div>
                <button
                    type="submit"
                    disabled={!text.trim() && !imagePreview}
                    className="btn btn-primary rounded"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    )
}

export default MessageInput;