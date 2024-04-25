import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from "../../../../environments/environment";
import { FiltrarEpaginarUsuarios } from 'src/app/interfaces/FiltrarEpaginarUsuarios';
import { FiltrarEpaginarQuantidade } from 'src/app/interfaces/FiltrarEpaginarQuantidade';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FiltrarEpaginarDenuncia } from 'src/app/interfaces/FiltrarEpaginarDenuncia';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css']
})

export class AdministradorComponent implements OnInit {

  usuario: any;
  token: string = '';
  ListarUsuarioGetModel: any;
  ListarDenunciaGetModel: any;
  listaUsuarios: FiltrarEpaginarUsuarios = { message: '', usuarios: [] };
  listaDenuncias: FiltrarEpaginarDenuncia = { message: '', denuncias: [] };
  totalItemsPaginacao: number = 0;
  modalRef?: BsModalRef | null;
  denunciaModal: any;
  denunciaEstatistica: any;

  constructor(private LocalStorageService: LocalStorageService, private httpClient: HttpClient, private toastr: ToastrService,
    private modalService: BsModalService) {
    if (this.LocalStorageService.verificarUsuarioLogado()) {
      if (JSON.parse(LocalStorageService.pegarToken() as string).usuario.administrador === false) {
        window.location.href = '/home';
      }
      this.token = JSON.parse(LocalStorageService.pegarToken() as string).token
      this.usuario = JSON.parse(LocalStorageService.pegarToken() as string).usuario;
    }
    else {
      LocalStorageService.redirecionarUsuarioDeslogado();
    }
  }

  ngOnInit(): void {
    this.FiltrarEpaginarUsuarios();
  }

  mudarPaginaAtual(event: any): void {
    const paginaAtual = event.page;
    const itensPorPagina = event.itemsPerPage;
    const primeiroItem = (paginaAtual - 1) * itensPorPagina;
    const ultimoItem = paginaAtual * itensPorPagina;
    this.formFiltrarEpaginarUsuarios.patchValue({
      primeiroItem: primeiroItem,
      ultimoItem: ultimoItem
    });
    this.FiltrarEpaginarUsuarios();
  }

  mudarPaginaAtualDenuncia(event: any): void {
    const paginaAtual = event.page;
    const itensPorPagina = event.itemsPerPage;
    const primeiroItem = (paginaAtual - 1) * itensPorPagina;
    const ultimoItem = paginaAtual * itensPorPagina;
    this.formFiltrarEpaginarDenuncias.patchValue({
      PrimeiroItem: primeiroItem,
      UltimoItem: ultimoItem
    });
    this.FiltrarEpaginarDenuncias();
  }

  formFiltrarEpaginarUsuarios = new FormGroup({
    Nome: new FormControl(''),
    Email: new FormControl('', [Validators.email]),
    primeiroItem: new FormControl(0, [Validators.required]),
    ultimoItem: new FormControl(12, [Validators.required])
  });

  get form(): any {
    return this.formFiltrarEpaginarUsuarios.controls;
  }

  onSubmit(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    this.ListarUsuarioGetModel = this.formFiltrarEpaginarUsuarios.value;
    const httpOptions = {
      headers: headers,
      params: this.ListarUsuarioGetModel
    };

    this.httpClient.get(environment.api + "/api/FiltrarEpaginarUsuariosQuantidade", httpOptions).subscribe({
      next: (data: any) => {
        const resposta = data as FiltrarEpaginarQuantidade;
        this.totalItemsPaginacao = resposta.quantidade;
      },
      error: (e) => {
        this.toastr.error(e.error.error, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });

    this.httpClient.get(environment.api + "/api/FiltrarEpaginarUsuarios", httpOptions).subscribe({
      next: (data: any) => {
        this.listaUsuarios = data as FiltrarEpaginarUsuarios;
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

  formFiltrarEpaginarDenuncias = new FormGroup({
    Titulo: new FormControl(''),
    Status: new FormControl(''),
    PrimeiroItem: new FormControl(0, [Validators.required]),
    UltimoItem: new FormControl(12, [Validators.required])
  });

  get formDenuncias(): any {
    return this.formFiltrarEpaginarDenuncias.controls;
  }

  onSubmitDenuncias(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    this.ListarDenunciaGetModel = this.formFiltrarEpaginarDenuncias.value;
    const httpOptions = {
      headers: headers,
      params: this.ListarDenunciaGetModel
    };

    this.httpClient.get(environment.api + "/api/FiltrarEPaginarDenunciasQuantidade", httpOptions).subscribe({
      next: (data: any) => {
        const resposta = data as FiltrarEpaginarQuantidade;
        this.totalItemsPaginacao = resposta.denunciasQuantidade;
      },
      error: (e) => {
      }
    });

    this.httpClient.get(environment.api + "/api/FiltrarEPaginarDenuncias", httpOptions).subscribe({
      next: (data: any) => {
        this.listaDenuncias = data as FiltrarEpaginarDenuncia;
        this.listaDenuncias.denuncias.forEach((denuncia: any) => {
          denuncia.status = denuncia.status === 0 ? "Pendente" : denuncia.status === 1 ? "Aprovada" : denuncia.status === 2 ? "Reprovada" : "";
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

  FiltrarEpaginarUsuarios(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    this.ListarUsuarioGetModel = this.formFiltrarEpaginarUsuarios.value;
    const httpOptions = {
      headers: headers,
      params: this.ListarUsuarioGetModel
    };

    this.httpClient.get(environment.api + "/api/FiltrarEpaginarUsuariosQuantidade", httpOptions).subscribe({
      next: (data: any) => {
        const resposta = data as FiltrarEpaginarQuantidade;
        this.totalItemsPaginacao = resposta.quantidade;
      },
      error: (e) => {
        this.toastr.error(e.error.error, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });

    this.httpClient.get(environment.api + "/api/FiltrarEpaginarUsuarios", httpOptions).subscribe({
      next: (data: any) => {
        this.listaUsuarios = data as FiltrarEpaginarUsuarios;
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

  FiltrarEpaginarDenuncias(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    this.ListarDenunciaGetModel = this.formFiltrarEpaginarDenuncias.value;
    const httpOptions = {
      headers: headers,
      params: this.ListarDenunciaGetModel
    };

    this.httpClient.get(environment.api + "/api/FiltrarEPaginarDenunciasQuantidade", httpOptions).subscribe({
      next: (data: any) => {
        const resposta = data as FiltrarEpaginarQuantidade;
        this.totalItemsPaginacao = resposta.denunciasQuantidade;
      },
      error: (e) => {
        this.toastr.error(e.error.error, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });

    this.httpClient.get(environment.api + "/api/FiltrarEPaginarDenuncias", httpOptions).subscribe({
      next: (data: any) => {
        this.listaDenuncias = data as FiltrarEpaginarDenuncia;
        this.listaDenuncias.denuncias.forEach((denuncia: any) => {
          denuncia.status = denuncia.status === 0 ? "Pendente" : denuncia.status === 1 ? "Aprovada" : denuncia.status === 2 ? "Reprovada" : "";
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

  formEditarConta = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-zÀ-Üà-ü\s]{3,80}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefone: new FormControl('', [Validators.required, Validators.pattern(/^\s*[0-9]{11}\s*$/)]),
    guid: new FormControl(''),
    Administrador: new FormControl(false)
  });

  get formEditar(): any {
    return this.formEditarConta.controls;
  }

  editarConta(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    const httpOptions = {
      headers: headers
    };

    this.httpClient.put(environment.api + `/api/AtualizarUsuario/${this.formEditarConta.value.guid}`,
      this.formEditarConta.value,
      httpOptions).subscribe({
        next: (data: any) => {
          this.toastr.success(data.message, 'Notificação', {
            timeOut: 4000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
          this.fecharModal(1);
          this.FiltrarEpaginarUsuarios();
        },
        error: (e) => {
          this.toastr.error(e.error.errors, 'Notificação', {
            timeOut: 4000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
        }
      });
  }

  abrirModal(template: TemplateRef<any>, usuario: any) {
    this.modalRef = this.modalService.show(template, { id: 1, class: 'modal-lg' });
    this.formEditarConta.patchValue({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      guid: usuario.guid,
      Administrador: usuario.administrador
    });
  }

  fecharModal(modalId?: number) {
    this.modalService.hide(modalId);
  }

  excluirConta(guid: string): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    this.httpClient.delete(environment.api + `/api/ExcluirUsuario/${guid}`, httpOptions).subscribe({
      next: (data: any) => {
        this.toastr.success("Usuário excluido com sucesso.", 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
        this.FiltrarEpaginarUsuarios();
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

  limparFiltros() {
    this.formFiltrarEpaginarDenuncias.patchValue({
      Titulo: "",
      Status: ""
    });
    this.formFiltrarEpaginarUsuarios.patchValue({
      Nome: "",
      Email: ""
    })
  }

  abrirSegundaModal(template: TemplateRef<any>, denuncia: any) {
    this.modalRef = this.modalService.show(template, { id: 2, class: 'modal-lg' });
    this.denunciaModal = denuncia;
  }

  mudarStatusDenuncia(status: number, denunciaGuid: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    const httpOptions = {
      headers: headers
    };

    this.httpClient.put(environment.api + `/api/MudarStatusDenuncia/${denunciaGuid}`, status,
      httpOptions).subscribe({
        next: (data: any) => {
          this.toastr.success(data.message, 'Notificação', {
            timeOut: 4000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
          this.fecharModal(2);
          this.FiltrarEpaginarDenuncias();
        },
        error: (e) => {
          this.toastr.error(e.error.errors, 'Notificação', {
            timeOut: 4000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
        }
      });
  }

  excluirDenuncia(guid: string): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    this.httpClient.delete(environment.api + `/api/ExcluirDenuncia/${guid}`, httpOptions).subscribe({
      next: (data: any) => {
        this.toastr.success("Denúncia excluida com sucesso.", 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
        this.fecharModal(2);
        this.FiltrarEpaginarDenuncias();
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
