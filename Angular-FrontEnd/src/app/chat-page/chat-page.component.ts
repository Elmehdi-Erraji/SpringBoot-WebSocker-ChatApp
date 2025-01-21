import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../services/web-socket.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
})
export class ChatPageComponent implements OnInit {
  messageContent: string = '';
  messages: any[] = [];
  // We'll rely on the service to track if it's connected
  // and to track the current user’s name

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    console.log('Initializing ChatPageComponent');

    // If user came directly to /chat, we might not be connected or have a username
    if (!this.webSocketService.isConnected || !this.webSocketService.currentUser) {
      console.warn('No active WebSocket connection or user. Redirect if needed.');
      // e.g. we might do something like:
      // this.router.navigate(['/']);
      // but for simplicity, we’ll just warn.
    }

    // Subscribe to incoming messages
    this.webSocketService.onMessage().subscribe((msg: any) => {
      if (msg && msg.type) {
        // If the server didn't set the content, do it here:
        if (msg.type === 'JOIN') {
          msg.content = msg.sender + ' joined!';
        } else if (msg.type === 'LEAVE') {
          msg.content = msg.sender + ' left!';
        }
        // Now push the updated message into your local array
        this.messages.push(msg);
      } else {
        console.error('Invalid message received:', msg);
      }
    });
  }

  sendMessage(event: Event) {
    event.preventDefault();
    const trimmed = this.messageContent.trim();
    if (trimmed) {
      console.log('Sending message:', trimmed);
      this.webSocketService.sendMessage(trimmed);
      this.messageContent = '';
    }
  }

  getAvatarColor(sender: string): string {
    const colors = [
      '#2196F3',
      '#32c787',
      '#00BCD4',
      '#ff5652',
      '#ffc107',
      '#ff85af',
      '#FF9800',
      '#39bbb0',
    ];
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
      hash = 31 * hash + sender.charCodeAt(i);
    }
    return colors[Math.abs(hash % colors.length)];
  }

  trackByFn(index: number, item: any): any {
    return index; // or return a unique id if available
  }
}
