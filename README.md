# Spring Boot WebSocket + Angular Chat Application

This documentation describes a **real-time chat application** built using a **Spring Boot** backend (with WebSocket/STOMP) and an **Angular** frontend. Users can enter a username, join a public chat, and send messages that appear instantly in all connected clients.

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
7. [License](#license)

---

## Overview

- **Purpose**: To allow users to connect with a chosen username and exchange messages in a shared chat room.
- **Technologies**:
  - **Spring Boot** for the server-side, enabling **WebSocket** communication using **STOMP** and a simple broker.
  - **Angular** for the client-side, providing a dynamic UI that connects to the WebSocket endpoint and sends/receives messages in real time.
- **Main Features**:
  - **Join** notifications: Announce when a user joins the chat.
  - **Leave** notifications: Broadcast when a user disconnects.
  - **Public channel**: A single chat room that all users can see.

---

## Backend: Spring Boot

### WebSocket Endpoints

1. An endpoint (commonly named `"/ws"`) is set up to accept **SockJS** and **WebSocket** connections.
2. The application prefix (often `"/app"`) is used for sending messages from client to server.
3. A topic prefix (often `"/topic"`) is used for broadcasting messages from server to all subscribers.

### Controller Responsibility

- A **ChatController** handles:
  1. **Receiving** a “send message” request and broadcasting it to the public topic.
  2. **Receiving** a “user joined” request, storing the username in WebSocket session attributes, and broadcasting a join message.

### Session Attributes and Disconnect Handling

- A **WebSocketEventListener** (or equivalent) observes when users disconnect.  
- During a disconnect event, it retrieves the username from the **session attributes** and broadcasts a “left” message so all connected clients know that user left.

### Data Transfer Objects

- A **ChatMessage** (DTO) carries the fields necessary to display messages:  
  - The message **type** (e.g. CHAT, JOIN, LEAVE).  
  - The actual **content** (text).  
  - The **sender** (username).  
- An **enum** (e.g. `MessageType`) distinguishes between the different message types.

---

## Frontend: Angular

### WebSocket Service

- A service (e.g. `WebSocketService`) is created to:
  1. **Connect** via **SockJS** to the backend endpoint (e.g., `"/ws"`).  
  2. **Subscribe** to the public topic (e.g., `"/topic/public"`) to receive updates.  
  3. **Publish** messages to `"/app/chat.sendMessage"` or `"/app/chat.addUser"`.  
  4. Manage **connection state** (e.g., a boolean indicating whether the connection is active).  
  5. Store the current **username**, so subsequent chat messages include it without having to pass it around.

### Components

1. **Username Page Component**  
   - Presents an input for the user to type their username.  
   - On submit, it **connects** to the WebSocket (if not already connected) and sends a **JOIN** message.  
   - Optionally, it **navigates** to a chat component (or conditionally displays it).

2. **Chat Page Component**  
   - Displays messages in a list, updated live whenever the service emits a new message.  
   - Allows sending **CHAT** messages, which are published to the server, then broadcast to all clients.  
   - Shows “user joined” or “user left” messages based on the **JOIN** / **LEAVE** message types.

### Routing (Optional)

- You can choose to use Angular’s router so that `"/"` displays the Username page and `"/chat"` displays the Chat page. This requires:
  1. **Defining** routes (e.g. `[{ path: '', component: UsernamePageComponent }, { path: 'chat', component: ChatPageComponent }]`).  
  2. Including a **`<router-outlet>`** in your root component to place whichever page is active.  
- Alternatively, you can present both the username form and the chat interface in the same screen by toggling their visibility with a simple boolean flag, bypassing the router entirely.

---

## Build and Run

### Running the Backend

1. Ensure you have **Java** and **Maven** (or Gradle) installed.  
2. Navigate to the backend’s root folder (where the `pom.xml` or `build.gradle` file is located).  
3. Execute the command to start the Spring Boot app. For example (Maven):  
   - `mvn spring-boot:run`  
   - By default, the server starts on `http://localhost:8080`.

### Running the Frontend

1. Navigate to the Angular project folder (where `package.json` is located).  
2. Install dependencies:  
   - `npm install`  
3. Run the dev server:  
   - `npm run start`  
   - By default, the frontend is served at `http://localhost:4200`.  
4. Open a web browser and go to `http://localhost:4200` to see the chat UI.  
5. Ensure the backend is also running so the WebSocket connection can succeed.

---

## Workflow

1. **User enters** a username on the frontend.  
2. The frontend **connects** to the WebSocket endpoint (e.g., `"/ws"`) and sends a JOIN message to `"/app/chat.addUser"`.  
3. The **server** adds the username to session attributes and broadcasts a **JOIN**-type message to `"/topic/public"`.  
4. **All connected clients** receive the JOIN message and update their UI accordingly (e.g., “Alice joined!”).  
5. **User sends** a chat message to `"/app/chat.sendMessage"`.  
6. The server **rebroadcasts** that message to everyone subscribed to `"/topic/public"`.  
7. If a user **disconnects**, the server fires a disconnect event and sends a **LEAVE**-type message to everyone.

---

## Extensions

- **Private Chats**: Add unique destinations (e.g. `"/topic/private.{username}"`) for private messaging.  
- **Multiple Rooms**: Create different endpoints for different rooms (`"/topic/room/{roomId}"`).  
- **Persistence**: Store messages in a database (SQL or NoSQL) for retrieval of chat history.  
- **Authentication**: Integrate with Spring Security or JWT to authenticate users and enforce roles.  
- **UI Enhancements**: Show a list of active users, timestamps, or read receipts.

---

## License

This project is provided as a reference for educational purposes. You may use and modify it freely. Refer to any included license file or headers for more information.

---

Enjoy building and extending this **Spring Boot WebSocket + Angular** chat application! 
