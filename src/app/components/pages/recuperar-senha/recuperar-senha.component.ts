import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.component.html',
  styleUrls: ['./recuperar-senha.component.css']
})
export class RecuperarSenhaComponent {

  mensagemErro: string = '';
  mensagemSucesso: string = '';

  constructor(private httpClient: HttpClient, private LocalStorageService: LocalStorageService,private toastr: ToastrService) {
    this.LocalStorageService.redirecionarUsuarioLogado();
  };

  formRecuperarSenha = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  get form(): any {
    return this.formRecuperarSenha.controls;
  };

  onSubmit(): void {
    this.httpClient.post(environment.api + "/api/RecuperarSenha", this.formRecuperarSenha.value).subscribe({
      next: (data: any) => {
        this.formRecuperarSenha.reset();
        this.mensagemErro = '';
        this.toastr.success('Operação realizada com sucesso', 'Sucesso', { positionClass: 'toast-top-center' });

      },
      error: (e) => {
        this.mensagemErro = ''; 
        this.mensagemSucesso = '';
        
   
        this.toastr.error(e.error.error, 'Erro', { positionClass: 'toast-top-center' });
      }
    });
  }
};
