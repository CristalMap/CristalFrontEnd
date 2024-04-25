import { Component, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Enderecos } from 'src/app/interfaces/enderecos';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { environment } from "../../../../environments/environment";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  private debounceTimer?: NodeJS.Timeout;

  isLogged: boolean = false;
  modalRef?: BsModalRef | null;
  usuario: any;
  token: string = '';
  enderecos: any[] = [];
  fotoBase64: any;

  constructor(private LocalStorageService: LocalStorageService, private httpClient: HttpClient,
    private modalService: BsModalService, private toastr: ToastrService) {
    if (this.LocalStorageService.verificarUsuarioLogado()) {
      this.isLogged = true;
      this.token = JSON.parse(LocalStorageService.pegarToken() as string).token
      this.usuario = JSON.parse(LocalStorageService.pegarToken() as string).usuario;
      if (this.usuario.foto == null) {
        this.usuario.foto = "https://cristalfotos.blob.core.windows.net/usuario/Usuariopadrao.jpg";
      }
    }
  };

  removerAnimais(tipoAnimal: string): void {
    switch (tipoAnimal) {
      case 'mamiferos':
        this.formCriarDenuncia.patchValue({
          QuantidadeMamiferos: 0
        });
        break;
      case 'aves':
        this.formCriarDenuncia.patchValue({
          QuantidadeAves: 0
        });
        break;
      case 'repteis':
        this.formCriarDenuncia.patchValue({
          QuantidadeRepteis: 0
        });
        break;
      case 'peixes':
        this.formCriarDenuncia.patchValue({
          QuantidadePeixes: 0
        });
        break;
      default:
        break;
    }
  }

  abrirModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { id: 1, class: 'modal-lg' });
  }

  fecharModal(modalId?: number) {
    this.modalService.hide(modalId);
    this.formCriarDenuncia.reset();
    this.enderecos = [];
    this.formCriarDenuncia.patchValue({
      QuantidadeMamiferos: 0,
      QuantidadeAves: 0,
      QuantidadeRepteis: 0,
      QuantidadePeixes: 0
    });
  }

  buscarEnderecos(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.httpClient.get<Enderecos>(`https://api.mapbox.com/geocoding/v5/mapbox.places/${this.formCriarDenuncia.get('cadastrarDenunciaEnderecoDigitado')?.value}.json?access_token=`).subscribe({
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
    this.formCriarDenuncia.patchValue({
      cadastrarDenunciaEnderecoDigitado: endereco.place_name,
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
      this.formCriarDenuncia.patchValue({
        FotoBase64: this.fotoBase64
      });
    };
  }

  logout(): void {
    this.isLogged = false;
    this.usuario = null;
    this.LocalStorageService.logout();
  }

  formCriarDenuncia = new FormGroup({
    Titulo: new FormControl('', [Validators.required]),
    cadastrarDenunciaEnderecoDigitado: new FormControl('', [Validators.required]), // Somente front-end
    Endereco: new FormControl({}, [Validators.required]),
    Descricao: new FormControl('', [Validators.required]),
    QuantidadeMamiferos: new FormControl(0, [Validators.required]),
    QuantidadeAves: new FormControl(0, [Validators.required]),
    QuantidadeRepteis: new FormControl(0, [Validators.required]),
    QuantidadePeixes: new FormControl(0, [Validators.required]),
    FotoBase64: new FormControl('', [Validators.required]),
    GuidUsuario: new FormControl('')
  });

  get form(): any {
    return this.formCriarDenuncia.controls;
  };

  onSubmit(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    const httpOptions = {
      headers: headers
    };

    this.formCriarDenuncia.patchValue({
      GuidUsuario: this.usuario.guid
    });

    const { QuantidadeMamiferos, QuantidadeAves, QuantidadeRepteis, QuantidadePeixes } = this.formCriarDenuncia.value;

    if (QuantidadeMamiferos === 0 && QuantidadeAves === 0 && QuantidadeRepteis === 0 && QuantidadePeixes === 0) {
      this.toastr.error("Pelo menos uma quantidade deve ser maior que zero.", 'Notificação', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
        closeButton: true
      });
      return;
    }

    this.httpClient.post(environment.api + "/api/CriarDenuncia/", this.formCriarDenuncia.value, httpOptions).subscribe({
      next: (data: any) => {
        this.fecharModal(1);
        this.formCriarDenuncia.reset();
        this.formCriarDenuncia.patchValue({
          QuantidadeMamiferos: 0,
          QuantidadeAves: 0,
          QuantidadeRepteis: 0,
          QuantidadePeixes: 0
        });
        this.toastr.success("Denúncia cadastrada com sucesso!", 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      },
      error: (e) => {
        this.toastr.error(e.error.errors.Descricao, 'Notificação', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          closeButton: true
        });
      }
    });
  };
};
