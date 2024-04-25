import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-autenticar',
  templateUrl: './autenticar.component.html',
  styleUrls: ['./autenticar.component.css']
})
export class AutenticarComponent {
  isLoading = false;
  mensagemErro: string = '';

  constructor(private httpClient: HttpClient, private LocalStorageService: LocalStorageService, private toastr: ToastrService) { 
    this.LocalStorageService.redirecionarUsuarioLogado();
  }

  formAutenticar = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required])
  });

  get form(): any {
    return this.formAutenticar.controls;
  };

  onSubmit(): void {
    if (this.formAutenticar.valid) {
      this.isLoading = true;
      this.httpClient.post(environment.api + "/api/Autenticar", this.formAutenticar.value).subscribe({
        next: (data) => {
          this.LocalStorageService.adicionarToken(data);
        },
        error: (e) => {
          // Exibe o toast de erro
          this.toastr.error('Erro ao autenticar. Verifique os dados e tente novamente.', 'Erro');
          this.isLoading = false;
        }
      });
    } else {
      // Exibe um toast informando que há erros de validação no formulário
      this.toastr.warning('Por favor, corrija os erros no formulário.', 'Erro de validação');
    }
  }
  
};
