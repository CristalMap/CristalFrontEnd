import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Enderecos } from 'src/app/interfaces/enderecos';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { environment } from "../../../../environments/environment";

@Component({
  selector: 'app-minhas-denuncias',
  templateUrl: './minhas-denuncias.component.html',
  styleUrls: ['./minhas-denuncias.component.css']
})
export class MinhasDenunciasComponent implements OnInit {
  private debounceTimer?: NodeJS.Timeout;

  modalRef?: BsModalRef | null;
  usuario: any;
  token: string = '';
  enderecos: any[] = [];
  fotoBase64: any;
  listaDenuncias: any[] = [];
  modoEdicao = false;

  constructor(private LocalStorageService: LocalStorageService, private httpClient: HttpClient,
    private modalService: BsModalService, private toastr: ToastrService) {
    if (this.LocalStorageService.verificarUsuarioLogado()) {
      this.token = JSON.parse(LocalStorageService.pegarToken() as string).token;
      this.usuario = JSON.parse(LocalStorageService.pegarToken() as string).usuario;
    }
  }

  ngOnInit(): void {
    this.buscarDenuncias();
  }

  buscarDenuncias(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers,
    };

    this.httpClient.get(environment.api + `/api/ListarDenunciasUsuario/${this.usuario.guid}`, httpOptions).subscribe({
      next: (data: any) => {
        this.listaDenuncias = data.denuncias;
        this.listaDenuncias.forEach((denuncia: any) => {
          denuncia.status = denuncia.status === 0 ? 'Pendente' : denuncia.status === 1 ? 'Aprovada' : denuncia.status === 2 ? 'Reprovada' : '';
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

  buscarEnderecos(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.httpClient.get<Enderecos>(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${this.formEditarDenuncia.get('editarDenunciaEnderecoDigitado')?.value}
        .json?access_token=`).subscribe({
        next: (data) => {
          this.enderecos = data.features;
        },
        error: (e) => {
          this.toastr.error(e.error.error, 'Notificação', {
            timeOut: 4000,
            positionClass: 'toast-top-right',
            closeButton: true
          });
        }
      });
    }, 500);
  }

  selecionarEndereco(endereco: any): void {
    const enderecoTratado = {
      nome: endereco.place_name,
      latitude: endereco.center[1],
      longitude: endereco.center[0]
    }
    this.formEditarDenuncia.patchValue({
      editarDenunciaEnderecoDigitado: endereco.place_name,
      Endereco: enderecoTratado
    });
    this.enderecos = [];
  }

  selecionarFoto(event: any) {
    const foto = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(foto);
    reader.onload = () => {
      this.fotoBase64 = reader.result;
      this.formEditarDenuncia.patchValue({
        FotoBase64: this.fotoBase64
      });
    };
  }

  abrirModal(template: TemplateRef<any>, item: any) {
    this.modalRef = this.modalService.show(template, { id: 1, class: 'modal-lg' });
    this.formEditarDenuncia.patchValue({
      Guid: item.guid,
      Titulo: item.titulo,
      Descricao: item.descricao,
      editarDenunciaEnderecoDigitado: item.endereco.nome,
      QuantidadeMamiferos: item.quantidadeMamiferos,
      QuantidadeAves: item.quantidadeAves,
      QuantidadeRepteis: item.quantidadeRepteis,
      QuantidadePeixes: item.quantidadePeixes,
      Status: item.status,
      FotoBaixar: item.fotoBase64
    });

    this.formEditarDenuncia.disable();

    this.modoEdicao = false;
  }

  habilitarEdicao() {
    this.formEditarDenuncia.enable();
    this.modoEdicao = true;
  }

  fecharModal(modalId?: number) {
    this.modalService.hide(modalId);
    this.formEditarDenuncia.reset();
    this.enderecos = [];
    this.formEditarDenuncia.patchValue({
      QuantidadeMamiferos: 0,
      QuantidadeAves: 0,
      QuantidadeRepteis: 0,
      QuantidadePeixes: 0
    });
  }

  removerAnimais(tipoAnimal: string): void {
    switch (tipoAnimal) {
      case 'mamiferos':
        this.formEditarDenuncia.patchValue({
          QuantidadeMamiferos: 0
        });
        break;
      case 'aves':
        this.formEditarDenuncia.patchValue({
          QuantidadeAves: 0
        });
        break;
      case 'repteis':
        this.formEditarDenuncia.patchValue({
          QuantidadeRepteis: 0
        });
        break;
      case 'peixes':
        this.formEditarDenuncia.patchValue({
          QuantidadePeixes: 0
        });
        break;
      default:
        break;
    }
  }

  formEditarDenuncia = new FormGroup({
    Guid: new FormControl('', [Validators.required]),
    Titulo: new FormControl('', [Validators.required]),
    editarDenunciaEnderecoDigitado: new FormControl(''), // Somente front-end
    Endereco: new FormControl({}),
    Descricao: new FormControl('', [Validators.required]),
    QuantidadeMamiferos: new FormControl(0, [Validators.required]),
    QuantidadeAves: new FormControl(0, [Validators.required]),
    QuantidadeRepteis: new FormControl(0, [Validators.required]),
    QuantidadePeixes: new FormControl(0, [Validators.required]),
    FotoBase64: new FormControl(''),
    FotoBaixar: new FormControl(''), // Somente front-end
    GuidUsuario: new FormControl(''),
    Status: new FormControl(''),
  });

  get form(): any {
    return this.formEditarDenuncia.controls;
  };

  onSubmit(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    const { QuantidadeMamiferos, QuantidadeAves, QuantidadeRepteis, QuantidadePeixes } = this.formEditarDenuncia.value;

    if (QuantidadeMamiferos === 0 && QuantidadeAves === 0 && QuantidadeRepteis === 0 && QuantidadePeixes === 0) {
      this.toastr.error("A quantidade de animais deve ser maior que zero.", 'Notificação', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
        closeButton: true
      });
      return;
    }

    this.httpClient.put(environment.api + `/api/AtualizarDenuncia/${this.formEditarDenuncia.value.Guid}`, this.formEditarDenuncia.value, httpOptions).subscribe({
      next: (data: any) => {
        this.fecharModal(1);
        this.formEditarDenuncia.reset();
        this.formEditarDenuncia.patchValue({
          QuantidadeMamiferos: 0,
          QuantidadeAves: 0,
          QuantidadeRepteis: 0,
          QuantidadePeixes: 0
        });
        this.toastr.success("Denúncia editada com sucesso!", 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
        this.buscarDenuncias();
      },
      error: (e) => {
        this.toastr.error("Erro editar denúncia", 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });
  };

  excluirDenuncia(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    this.httpClient.delete(environment.api + `/api/ExcluirDenuncia/${this.formEditarDenuncia.value.Guid}`, httpOptions).subscribe({
      next: (data: any) => {
        this.fecharModal(1);
        this.toastr.success("Denúncia excluída com sucesso!", 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
        this.buscarDenuncias();
      },
      error: (e) => {
        this.toastr.error("Erro ao excluir denúncia!", 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });
  }
}
