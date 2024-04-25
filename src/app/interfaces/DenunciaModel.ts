export interface DenunciaModel {
    message: string;
    denuncias: Denuncia[];
}

export interface Denuncia {
    guid: string;
    titulo: string;
    descricao: string;
    endereco: EnderecoModel;
    fotoBase64: string;
    status: StatusDenuncia;
    dataHoraCriacao: Date;
    quantidadeMamiferos: number;
    quantidadeAves: number;
    quantidadeRepteis: number;
    quantidadePeixes: number;
    usuario: any;
}

export interface EnderecoModel {
    nome: string;
    latitude: number;
    longitude: number;
}

export enum StatusDenuncia {
    pendente = 0,
    aprovada = 1,
    reprovada = 2
}

export interface denunciaEstatistica {
    status: string;
    quantidade: number;
}