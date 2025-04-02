export function formatMessageTime(time) {
    let messageTime = new Date(time).toLocaleTimeString("en-US", {
        hour:"2-digit",
        minute: "2-digit",
        hour12: false,
    });
    
    return messageTime;
}

export function formatMessageDate(date) {
    let messageDate = new Date(date);
    let day = String(messageDate.getDate()).padStart(2, '0');
    let month = String(messageDate.getMonth() + 1).padStart(2, '0');
    let year = messageDate.getFullYear();
    
    return `${day}-${month}-${year}`;
}
