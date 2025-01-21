import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsernamePageComponent } from './username-page/username-page.component';
import { ChatPageComponent } from './chat-page/chat-page.component';

export const routes: Routes = [
  { path: '', component: UsernamePageComponent },
  { path: 'chat', component: ChatPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
