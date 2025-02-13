import { useRef, useState } from "react"
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from 'lucide-react';
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, settext] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { sendMessage } = useChatStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
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
            await sendMessage({
                text: text.trim(),
                image: imagePreview,
            })

            // Clear form
            settext("");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.log("Failed to send message: ", error);
            toast.error("Failed to send message");
        }
    };

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
                        onChange={(e) => settext(e.target.value)}
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
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
                        className={`hidden sm:flex btn btn-circle rounded-lg bg-transparent hover:bg-gray-600 hover:text-zinc-100 ${imagePreview ? 'text-emerald-500 bg-gray-800' : 'text-zinc-400'}`}
                    >
                        <Image size={20} />
                    </button>
                </div>
                <button
                    type="submit"
                    disabled={!text.trim() && !imagePreview}
                    className="btn btn-sm rounded-lg p-1 size-10 bg-orange-400 text-black hover:bg-orange-300"
                >
                    <Send size={22} />
                </button>
            </form>
        </div>
    )
}

export default MessageInput