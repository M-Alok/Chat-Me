export function formatMessageTime(date) {
    let messageTiming = new Date(date).toLocaleTimeString("en-US", {
        hour:"2-digit",
        minute: "2-digit",
        hour12: false,
    })
    return messageTiming;
}