import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-criar-conta',
  templateUrl: './criar-conta.component.html',
  styleUrls: ['./criar-conta.component.css']
})
export class CriarContaComponent {

  isLoadingCadastro = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(private httpClient: HttpClient, private LocalStorageService: LocalStorageService, private toastr: ToastrService) {
    this.LocalStorageService.redirecionarUsuarioLogado();
  };

  formCriarConta = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-zÀ-Üà-ü\s]{3,80}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]),
    senha: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-z]).{8,}$/)]),
    senhaConfirmacao: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-z]).{8,}$/)])
  });

  get form(): any {
    return this.formCriarConta.controls;
  };

  onSubmit(): void {
    if (this.formCriarConta.valid) {
      this.isLoadingCadastro = true;

      if (this.formCriarConta.value.senha != this.formCriarConta.value.senhaConfirmacao) {
        this.toastr.error("As senhas precisam ser iguais.", 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
        this.isLoadingCadastro = false;
        return;
      }

      this.httpClient.post(environment.api + "/api/CriarConta", this.formCriarConta.value).subscribe({
        next: (data: any) => {
          this.formCriarConta.reset();
          this.isLoadingCadastro = false;
          this.toastr.success('Conta criada com sucesso!', 'Notificação', {
            timeOut: 4000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
        },
        error: (e) => {
          this.isLoadingCadastro = false;
          this.toastr.error(e.error.error, 'Notificação', {
            timeOut: 4000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
        }
      });
    }
  }
};
