import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ISIATAPM25 } from '../interfaces/siata';

@Injectable({
  providedIn: 'root'
})
export class SiataService {

  http = inject(HttpClient)
  headers = new HttpHeaders().set('Access-Control-Allow-Origin', '*');

  // getSIATAPM25(){
  //   const url = 'https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_pm25.json';
  //   return this.http.get<ISIATAPM25[]>(url, {
  //     headers: this.headers,
  //     observe: 'response',
  //   })
  //   .pipe(
  //     map((resp) => resp.body),
  //     catchError((err) => of(err.error))
  //   );
  // }
  getSIATAPM25(){
    return this.http.get<any>('assets/data.json')
    .toPromise()
      .then(res => <ISIATAPM25[]>res.data)
      .then(data => { return data; });
  }
}
