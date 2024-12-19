import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { MessageCircle, Send } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "agent" | "user";
}

type ChatSectionProps = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

const ChatSection: React.FC<ChatSectionProps> = ({ messages, setMessages }) => {
  // const [messages, setMessages] = useState([
  //   { id: 1, text: "Hello! How can I help you today?", sender: "agent" },
  //   { id: 2, text: "I have a question about my order", sender: "user" },
  //   {
  //     id: 3,
  //     text: "Sure, I'd be happy to help. What's your order number?",
  //     sender: "agent",
  //   },
  // ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: newMessage,
          sender: "user",
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center">
          <MessageCircle className="h-6 w-6" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg w-[90vw] max-w-md">
          <Dialog.Title className="font-bold p-4 border-b">
            Chat here !!
          </Dialog.Title>

          <div className="flex flex-col h-[500px]">
            <ScrollArea.Root className="flex-1 p-4">
              <ScrollArea.Viewport className="h-full w-full">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-150 ease-out hover:bg-gray-200 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
                orientation="vertical"
              >
                <ScrollArea.Thumb className="flex-1 bg-gray-300 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          <Dialog.Close className="absolute top-4 right-4 opacity-70 hover:opacity-100">
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ChatSection;
