import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {

  private apiUrl: string = "https://esp32-mongodb-idev3.onrender.com";

  constructor(private http: HttpClient) {}

  // 🔹 Buscar dados gerais
  getSensores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/leituras/jão`);
  }

  // 🔹 Buscar histórico de um dia específico
  getHistoricoDia(collection: string, date: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/historico-dia/${encodeURIComponent(collection)}?data=${encodeURIComponent(date)}`
    );
  }

  // 🔹 Buscar histórico completo (opcional)
  getHistoricoCompleto(collection: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/historico/${encodeURIComponent(collection)}`);
  }
}
