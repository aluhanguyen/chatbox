import React, { useState } from 'react';
import './App.css';

const App = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [processedResponses, setProcessedResponses] = useState(new Set()); // Dùng Set để theo dõi các phần phản hồi đã xử lý

    const sendMessage = () => {
        if (input.trim()) {
            // Thêm tin nhắn người dùng vào UI
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: input, sender: 'User' }
            ]);

            const eventSource = new EventSource(`http://localhost:8080/ai/generateStream?message=${input}`);

            // Lắng nghe phản hồi từng phần từ backend
            eventSource.onmessage = (event) => {
                const chatResponse = event.data; // Lấy dữ liệu phản hồi từ backend

                // Chỉ xử lý nếu phản hồi chưa được xử lý
                if (!processedResponses.has(chatResponse)) {
                    // Tìm tin nhắn bot hiện tại, nếu không có, tạo tin nhắn bot mới
                    setMessages((prevMessages) => {
                        // Lấy tin nhắn bot hiện tại (nếu có)
                        const updatedMessages = [...prevMessages];
                        let lastMessage = updatedMessages.find((msg) => msg.sender === 'Bot');

                        if (!lastMessage) {
                            lastMessage = { text: '', sender: 'Bot' }; // Nếu không có tin nhắn bot, tạo mới
                            updatedMessages.push(lastMessage); // Thêm tin nhắn bot mới vào mảng
                        }

                        // Nối phần phản hồi mới vào tin nhắn bot
                        lastMessage.text = lastMessage.text + ` ${chatResponse.trim()}`;

                        return updatedMessages;
                    });

                    // Cập nhật Set để lưu phản hồi đã nhận
                    setProcessedResponses((prevSet) => new Set(prevSet.add(chatResponse)));
                }
            };

            eventSource.onerror = (error) => {
                console.error('Error fetching response:', error);
                eventSource.close();
            };
        }
    };

    return (
        <div className="App">
            <div className="chat-container">
                <div id="chat-box" className="chat-box">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`}>
                            <strong>{msg.sender === 'User' ? 'You' : 'Bot'}: </strong>
                            {/* Hiển thị tin nhắn bot */}
                            <span style={{ marginLeft: '5px' }}>{msg.text}</span>
                        </div>
                    ))}
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default App;
