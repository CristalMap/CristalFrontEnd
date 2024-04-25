export interface FiltrarEpaginarUsuarios {
    message: string;
    usuarios: Usuario[];
}

export interface Usuario {
    guid: string;
    nome?: string;
    email?: string;
    telefone?: string;
    dataHoraCriacao: Date;
    pontos: number;
    foto?: string;
    administrador: boolean;
}

