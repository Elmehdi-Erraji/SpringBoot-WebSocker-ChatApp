package com.alibou.websocket.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // If no channel is provided, fallback to 'public' or any default
        String channel = (chatMessage.getChannel() != null && !chatMessage.getChannel().isEmpty())
                ? chatMessage.getChannel()
                : "public";
        chatMessage.setChannel(channel);

        // Broadcast to /topic/<channelName>
        messagingTemplate.convertAndSend("/topic/" + channel, chatMessage);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String username = chatMessage.getSender();
        String channel = (chatMessage.getChannel() != null && !chatMessage.getChannel().isEmpty())
                ? chatMessage.getChannel()
                : "public";

        // Store username in WebSocket session
        headerAccessor.getSessionAttributes().put("username", username);

        // Create a "join" message
        ChatMessage joinMessage = ChatMessage.builder()
                .type(MessageType.JOIN)
                .sender(username)
                .content(username + " joined the channel!")
                .channel(channel)
                .build();

        // Broadcast to /topic/<channelName>
        messagingTemplate.convertAndSend("/topic/" + channel, joinMessage);
    }
}
