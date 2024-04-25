import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private tokenKey = 'auth_usuario';

  constructor() { }

  pegarToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  adicionarToken(data: object): void {
    sessionStorage.setItem(this.tokenKey, JSON.stringify(data));
    window.location.href = '/mapa';
  }

  verificarUsuarioLogado(): boolean {
    if (this.pegarToken() !== null) {
      return true;
    }
    else {
      return false;
    }
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    window.location.href = '/home';
  }

  redirecionarUsuarioLogado(): void {
    if (this.verificarUsuarioLogado() === true) {
      window.location.href = '/mapa';
    }
  }

  redirecionarUsuarioDeslogado(): void {
    if (this.verificarUsuarioLogado() === false) {
      window.location.href = '/home';
    }
  }

  atualizarInformacoesUsuario(data: object): void {
    const informacaoAtual = JSON.parse(sessionStorage.getItem(this.tokenKey) || '{}');
    const novaInformacao = { ...informacaoAtual, ...data };
    sessionStorage.setItem(this.tokenKey, JSON.stringify(novaInformacao));
  }
}
