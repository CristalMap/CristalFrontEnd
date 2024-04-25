import { Component, TemplateRef, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../../../../environments/environment";
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { denunciaEstatistica } from 'src/app/interfaces/DenunciaModel';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  fotoUsuario: any;
  modalRef?: BsModalRef | null;
  usuario: any;
  token: string = '';
  denunciaEstatistica: denunciaEstatistica[] = [{
    status: '',
    quantidade: 0
  }];

  constructor(private LocalStorageService: LocalStorageService, private httpClient: HttpClient,
    private modalService: BsModalService, private toastr: ToastrService) {
    if (this.LocalStorageService.verificarUsuarioLogado()) {
      this.token = JSON.parse(LocalStorageService.pegarToken() as string).token
      this.usuario = JSON.parse(LocalStorageService.pegarToken() as string).usuario;
      if (this.usuario.foto == null) {
        this.usuario.foto = "https://cristalfotos.blob.core.windows.net/usuario/Usuariopadrao.jpg";
      }
    }
    else {
      LocalStorageService.redirecionarUsuarioDeslogado();
    }
  }

  @ViewChild("meucanvas", { static: true }) elemento!: ElementRef;
  ngOnInit() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };
    this.httpClient.get(environment.api + `/api/ListarDenunciaEstatistica/${this.usuario.guid}`, httpOptions).subscribe({
      next: (data: any) => {
        this.denunciaEstatistica = data.estatisticaDenuncas;
        const labels = this.denunciaEstatistica.map((item: any) => {
          switch (item.status) {
            case 0:
              return "pendente";
            case 1:
              return "aprovada";
            case 2:
              return "reprovada";
            default:
              return "";
          }
        });

        const quantities = this.denunciaEstatistica.map((item: any) => item.quantidade);
        this.elemento.nativeElement.style.width = '300px';
        this.elemento.nativeElement.style.height = '300px';
        new Chart(this.elemento.nativeElement, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: quantities,
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Denúncias',
                font: {
                  size: 20
                }
              }
            }
          }
        });
      },
      error: (e) => {
        if (e.error.error !== 'Nenhuma denúncia encontrada.') {
          this.toastr.error(e.error.error, 'Notificação', {
            timeOut: 4000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
        }
      }
    });
  }

  selecionarFoto(event: any) {
    const foto = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(foto);
    reader.onload = () => {
      this.fotoUsuario = {
        fotoBase64: reader.result
      }
    };
  }

  enviarFotoUsuario() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    this.httpClient.put(environment.api + `/api/AtualizarFotoUsuario/${this.usuario.guid}`, this.fotoUsuario, httpOptions).subscribe({
      next: (data: any) => {
        this.fotoUsuario = null;
        this.toastr.success(data.message, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      },
      error: (e) => {
        this.toastr.error(e.error.error, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });
  }

  abrirModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { id: 1, class: 'modal-lg' });
    this.formEditarConta.patchValue({
      nome: this.usuario.nome,
      email: this.usuario.email,
      telefone: this.usuario.telefone
    });
  }

  fecharModal(modalId?: number) {
    this.modalService.hide(modalId);
  }

  formEditarConta = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-zÀ-Üà-ü\s]+$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefone: new FormControl('', [Validators.required, Validators.pattern(/^\s*[0-9]{11}\s*$/)]),
    TelaPerfil: new FormControl(false)
  });

  get form(): any {
    return this.formEditarConta.controls;
  };

  onSubmit(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    this.formEditarConta.patchValue({
      TelaPerfil: true
    });

    this.httpClient.put(environment.api + `/api/AtualizarUsuario/${this.usuario.guid}`, this.formEditarConta.value, httpOptions).subscribe({
      next: (data: any) => {
        this.formEditarConta.reset();
        this.LocalStorageService.atualizarInformacoesUsuario(data);
        this.usuario = data.usuario;
        this.fecharModal(1);
      },
      error: (e) => {
        this.toastr.error(e.error.error, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });
  };

  formEditarSenha = new FormGroup({
    senhaAtual: new FormControl('', [Validators.required]),
    senha: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-z]).{8,}$/)]),
    confirmarSenha: new FormControl('', [Validators.required])
  });

  get formSenha(): any {
    return this.formEditarSenha.controls;
  };

  onSubmitAtualizarSenha(): void {
    const senha = this.formEditarSenha.value.senha;
    const confirmarSenha = this.formEditarSenha.value.confirmarSenha;

    if (senha !== confirmarSenha) {
      this.toastr.error('As senhas devem ser iguais.', 'Notificação', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
        closeButton: true
      });
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    this.httpClient.put(environment.api + `/api/AtualizarSenha/${this.usuario.guid}`, this.formEditarSenha.value, httpOptions).subscribe({
      next: (data: any) => {
        this.formEditarSenha.reset();
        this.toastr.success(data.message, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      },
      error: (e) => {
        this.toastr.error(e.error.error, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });
  }

  excluirConta(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    this.httpClient.delete(environment.api + `/api/ExcluirUsuario/${this.usuario.guid}`, httpOptions).subscribe({
      next: (data: any) => {
        this.LocalStorageService.logout();
      },
      error: (e) => {
        this.toastr.error(e.error.error, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });
  }
}
