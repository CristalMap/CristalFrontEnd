import { Component } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cristal-frontend';
  isLogged: boolean = false;

  constructor(private LocalStorageService: LocalStorageService) {
    if (this.LocalStorageService.verificarUsuarioLogado() === true) {
      this.isLogged = true;
    }
  }
}
