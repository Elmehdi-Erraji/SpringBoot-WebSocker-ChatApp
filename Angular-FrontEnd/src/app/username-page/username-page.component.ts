import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService } from '../services/web-socket.service';

@Component({
  selector: 'app-username-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './username-page.component.html',
  styleUrls: ['./username-page.component.css'],
})
export class UsernamePageComponent {
  @Output() usernameSubmitted = new EventEmitter<string>();
  username: string = '';

  constructor(
    private webSocketService: WebSocketService,
    private router: Router
  ) {}

  connect(event: Event) {
    event.preventDefault();
    if (!this.username.trim()) {
      return;
    }

    console.log('Username entered:', this.username);

    // 1) Connect to WebSocket
    this.webSocketService.connect(() => {
      // 2) Once onConnect fires, send JOIN
      this.webSocketService.sendJoinMessage(this.username);

      // 3) Navigate to Chat component
      this.router.navigate(['chat'])
    });
  }
}
