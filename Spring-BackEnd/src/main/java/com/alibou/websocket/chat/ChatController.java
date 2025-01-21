package com.alibou.websocket.chat;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage( @Payload ChatMessage chatMessage) {
        if (chatMessage == null) {
            throw new IllegalArgumentException("ChatMessage cannot be null");
        }
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        if (chatMessage == null) {
            throw new IllegalArgumentException("ChatMessage cannot be null");
        }

        // Add username to the WebSocket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());

        // Notify all clients that a new user has joined
        ChatMessage joinMessage = new ChatMessage();
        joinMessage.setType(MessageType.JOIN);
        joinMessage.setSender(chatMessage.getSender());
        joinMessage.setContent(chatMessage.getSender() + " joined!");

        return joinMessage;
    }
}
