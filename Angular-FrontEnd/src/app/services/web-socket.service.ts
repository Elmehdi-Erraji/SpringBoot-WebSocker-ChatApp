import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<any>(null);
  // Make this public or provide a getter if the chat page wants to check
  public isConnected = false;

  // Store the current user’s name so the chat component can retrieve it
  public currentUser: string | null = null;

  constructor() {
    console.log('WebSocketService initialized');
  }

  connect(onConnectCallback?: () => void) {
    console.log('Connecting to WebSocket...');

    // If already connected, skip re-connecting
    if (this.isConnected) {
      console.warn('Already connected, skipping re-connect.');
      if (onConnectCallback) {
        onConnectCallback();
      }
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnected = true;

        // Execute the callback after connection is established
        if (onConnectCallback) {
          onConnectCallback();
        }

        // Subscribe to the public topic
        this.stompClient?.subscribe('/topic/public', (message) => {
          console.log('Raw message received:', message.body);

          if (!message.body) {
            console.error('Received null or empty message body');
            return;
          }

          try {
            const parsedMessage = JSON.parse(message.body);
            if (parsedMessage && parsedMessage.type) {
              console.log('Valid message received:', parsedMessage);
              this.messageSubject.next(parsedMessage); // Emit the message
            } else {
              console.error('Invalid message format:', parsedMessage);
            }
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        });
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
      },
    });

    this.stompClient.activate();
  }

  sendMessage(message: string) {
    if (this.stompClient && this.isConnected && this.currentUser) {
      console.log('Sending CHAT message:', message);

      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          sender: this.currentUser,
          content: message,
          type: 'CHAT',
        }),
      });
    } else {
      console.error('Cannot send CHAT message: not connected or user not set');
    }
  }

  sendJoinMessage(username: string) {
    if (this.stompClient && this.isConnected) {
      console.log('Sending JOIN message for:', username);
      this.currentUser = username; // store locally
      this.stompClient.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify({ sender: username, type: 'JOIN' }),
      });
    } else {
      console.error('STOMP client is not connected or not yet ready');
    }
  }

  onMessage() {
    return this.messageSubject.asObservable();
  }
}
