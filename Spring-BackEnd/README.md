```md
# Spring Boot WebSocket + Angular Chat Application

This documentation describes a **real-time chat application** built using a **Spring Boot** backend (with WebSocket/STOMP) and an **Angular** frontend. Users can enter a username, join a public chat (or multiple channels), and send messages that appear instantly in all connected clients.

---

## Table of Contents

1. [Overview](#overview)  
2. [Backend: Spring Boot](#backend-spring-boot)  
   - [WebSocket Endpoints](#websocket-endpoints)  
   - [Controller Responsibility](#controller-responsibility)  
   - [Session Attributes and Disconnect Handling](#session-attributes-and-disconnect-handling)  
   - [Data Transfer Objects](#data-transfer-objects)  
3. [Frontend: Angular](#frontend-angular)  
   - [WebSocket Service](#websocket-service)  
   - [Components](#components)  
   - [Routing (Optional)](#routing-optional)  
4. [Build and Run](#build-and-run)  
   - [Running the Backend](#running-the-backend)  
   - [Running the Frontend](#running-the-frontend)  
5. [Workflow](#workflow)  
6. [Extensions](#extensions)  
7. [Using RabbitMQ STOMP Relay (Optional)](#using-rabbitmq-stomp-relay-optional)  
   - [1. Run RabbitMQ with the STOMP Plugin](#1-run-rabbitmq-with-the-stomp-plugin)  
   - [2. Expose STOMP Port (61613)](#2-expose-stomp-port-61613)  
   - [3. Add Reactor Netty Dependency](#3-add-reactor-netty-dependency)  
   - [4. Configure the STOMP Relay](#4-configure-the-stomp-relay)  
   - [5. Verify Connectivity](#5-verify-connectivity)  
8. [License](#license)

---

## Overview

- **Purpose**: To allow users to connect with a chosen username and exchange messages in one or more chat channels.
- **Technologies**:
  - **Spring Boot** for the server-side, enabling **WebSocket** communication using **STOMP**.
  - **Angular** for the client-side, providing a dynamic UI that connects to the WebSocket endpoint and sends/receives messages in real time.
- **Main Features**:
  - **Join** notifications: Announce when a user joins the chat.
  - **Leave** notifications: Broadcast when a user disconnects.
  - **Multi-channel support**: Users can send messages to specific channels instead of a single global channel.

---

## Backend: Spring Boot

### WebSocket Endpoints

1. An endpoint (commonly named `"/ws"`) is set up to accept **SockJS** and **WebSocket** connections.
2. The application prefix (often `"/app"`) is used for sending messages from client to server.
3. A topic prefix (often `"/topic"`) is used for broadcasting messages from server to all subscribers.

### Controller Responsibility

- A **ChatController** handles:
  1. **Receiving** a “send message” request and broadcasting it to a channel (e.g., `"/topic/{channelName}"`).
  2. **Receiving** a “user joined” request, storing the username in WebSocket session attributes, and broadcasting a join message to the chosen channel.

### Session Attributes and Disconnect Handling

- A **WebSocketEventListener** (or equivalent) observes when users disconnect.  
- During a disconnect event, it retrieves the username from the **session attributes** and broadcasts a “left” message so all connected clients know that user left.

### Data Transfer Objects

- A **ChatMessage** (DTO) carries the fields necessary to display messages:  
  - The message **type** (e.g. `CHAT`, `JOIN`, `LEAVE`).  
  - The actual **content** (text).  
  - The **sender** (username).  
  - The **channel** (to support multi-channel chat).
- An **enum** (e.g. `MessageType`) can distinguish between the different message types.

---

## Frontend: Angular

### WebSocket Service

- A service (e.g. `WebSocketService`) is created to:
  1. **Connect** via **SockJS** to the backend endpoint (e.g., `"/ws"`).  
  2. **Subscribe** to the chosen channel (e.g., `"/topic/{channelName}"`) to receive updates.  
  3. **Publish** messages to `"/app/chat.sendMessage"` or `"/app/chat.addUser"`, including the channel name.  
  4. Manage **connection state** (e.g., a boolean indicating whether the connection is active).  
  5. Store the current **username**, so subsequent chat messages include it.

### Components

1. **Username/Channel Page Component**  
   - Presents inputs for the user to type their username and desired channel.  
   - On submit, it **connects** to the WebSocket (if not already connected) and sends a **JOIN** message.  
   - Optionally, it **navigates** to a chat component (or conditionally displays it).

2. **Chat Page Component**  
   - Displays messages in a list, updated live whenever the service emits a new message.  
   - Allows sending **CHAT** messages, which are published to the server, then broadcast to all clients in the same channel.  
   - Shows “user joined” or “user left” messages based on the **JOIN** / **LEAVE** message types.

### Routing (Optional)

- You can choose to use Angular’s router so that `"/"` displays the username/channel page and `"/chat"` displays the Chat page. This requires:
  1. **Defining** routes (e.g. `[{ path: '', component: UsernamePageComponent }, { path: 'chat', component: ChatPageComponent }]`).  
  2. Including a **`<router-outlet>`** in your root component to place whichever page is active.  
- Alternatively, you can present both the username/channel form and the chat interface in the same screen by toggling their visibility with a simple boolean flag.

---

## Build and Run

### Running the Backend

1. Ensure you have **Java** and **Maven** (or Gradle) installed.  
2. Navigate to the backend’s root folder (where the `pom.xml` file is located).  
3. Execute the command to start the Spring Boot app (for Maven):
   ```bash
   mvn spring-boot:run
   ```
By default, the server starts on [http://localhost:8080](http://localhost:8080).

### Running the Frontend

1. Navigate to the Angular project folder (where `package.json` is located).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run start
   ```
   By default, the frontend is served at [http://localhost:4200](http://localhost:4200).
4. Open a web browser and go to [http://localhost:4200](http://localhost:4200) to see the chat UI.
5. Ensure the backend is also running so the WebSocket connection can succeed.

---

## Workflow

1. **User enters** a username and channel on the frontend.
2. The frontend **connects** to the WebSocket endpoint (e.g., `"/ws"`) and sends a JOIN message to `"/app/chat.addUser"`.
3. The **server** adds the username to session attributes and broadcasts a **JOIN**-type message to `"/topic/{channel}"`.
4. **All connected clients** in that channel receive the JOIN message and update their UI accordingly (e.g., “Alice joined!”).
5. **User sends** a chat message to `"/app/chat.sendMessage"`.
6. The server **rebroadcasts** that message to everyone subscribed to `"/topic/{channel}"`.
7. If a user **disconnects**, the server fires a disconnect event and sends a **LEAVE**-type message to everyone in that channel.

---

## Extensions

- **Private Chats**: Add unique destinations (e.g. `"/topic/private.{username}"`) for one-to-one messaging.
- **Multiple Rooms**: Already supported via `channel` field; simply let users pick/create channel names.
- **Persistence**: Store messages in a database for retrieval of chat history.
- **Authentication**: Integrate with Spring Security or JWT to authenticate users and enforce roles.
- **UI Enhancements**: Show a list of active channels, timestamps, or read receipts.

---

## Using RabbitMQ STOMP Relay (Optional)

If you want to replace the **in-memory** STOMP broker (i.e. `enableSimpleBroker("/topic")`) with **RabbitMQ**, follow these steps:

### 1. Run RabbitMQ with the STOMP Plugin

- **Via Docker** (example `docker-compose.yml`):

  ```yaml
  version: "3.8"
  services:
    rabbitmq:
      image: rabbitmq:3-management
      container_name: rabbitmq
      ports:
        - "5672:5672"      # AMQP
        - "15672:15672"    # Management UI
        - "61613:61613"    # STOMP port
      environment:
        RABBITMQ_DEFAULT_USER: guest
        RABBITMQ_DEFAULT_PASS: guest
  ```

    1. Run `docker-compose up -d`.
    2. Confirm RabbitMQ is running by going to [http://localhost:15672](http://localhost:15672) (default credentials: `guest/guest`).
    3. **Check** that the **STOMP plugin** is **enabled**:
       ```bash
       docker exec -it rabbitmq rabbitmq-plugins list
       ```
       You should see `rabbitmq_stomp` with `[E*]` (enabled). If not:
       ```bash
       docker exec -it rabbitmq rabbitmq-plugins enable rabbitmq_stomp
       ```

### 2. Expose STOMP Port (61613)

Ensure **61613** is mapped in Docker so your Spring Boot app can connect. When you run:
```bash
docker port rabbitmq
```
You should see:
```
61613/tcp -> 0.0.0.0:61613
```
That means RabbitMQ is listening on **localhost:61613**.

### 3. Add Reactor Netty Dependency

In your `pom.xml`, ensure you have:
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-reactor-netty</artifactId>
</dependency>
```
This resolves potential errors like **“No compatible version of Reactor Netty”** when Spring tries to relay STOMP messages to RabbitMQ.

### 4. Configure the STOMP Relay

Replace your **in-memory** broker configuration with a **STOMP broker relay**:

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:4200")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Client -> Server prefixes
        registry.setApplicationDestinationPrefixes("/app");
        
        // Relay messages to RabbitMQ instead of using the simple in-memory broker
        registry.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost("localhost")
                .setRelayPort(61613)
                .setClientLogin("guest")
                .setClientPasscode("guest");
                // If needed, also .setSystemLogin() and .setSystemPasscode()
    }
}
```

### 5. Verify Connectivity

1. **Check** your Spring Boot logs:
    - You should see a line similar to:
      ```
      StompBrokerRelayMessageHandler : Started.
      stompBrokerRelay[1 sessions, ReactorNettyTcpClient[...] (available),
         processed CONNECT(1)-CONNECTED(1)-DISCONNECT(0)]
      ```
    - “`CONNECTED(1)`” means Spring successfully connected to RabbitMQ STOMP.

2. **Test** the front-end app:
    - When you open the chat UI, it should connect and send/receive messages **via RabbitMQ**.
    - In the RabbitMQ Management UI (`http://localhost:15672`), you might see temporary queues automatically created for STOMP subscriptions (e.g., `amq.gen-xxxx`).

**That's it!** By following these steps, your chat messages are no longer handled by the simple in-memory broker, but rather **relayed** to RabbitMQ. This approach provides **more scalability**, **persistence options**, and **enterprise features** (e.g., clustering, monitoring, and better fault tolerance).

---

## License

This project is provided as a reference for educational purposes. You may use and modify it freely. Refer to any included license file or headers for more information.
```