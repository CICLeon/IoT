export interface ISIATAPM25 {
    latitud: number,
    longitud: number,
    codigoSerial: number,
    datos: IData[]
    nombre: string,
    nombreCorto: string,
    marker? : any
}

export interface IData {
    variableConsulta: string,
    fecha: Date,
    calidad: number,
    valor: number
}

export interface IDataBD {
    id : string
    dateRegister : Date
    temperature : number
    humidity : number
    light : number
    proximity : number
}
