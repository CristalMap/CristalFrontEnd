import { Component } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css','./page.css']
})
export class HomeComponent {
  constructor(private LocalStorageService: LocalStorageService) {
    this.LocalStorageService.redirecionarUsuarioLogado();
  };
}
