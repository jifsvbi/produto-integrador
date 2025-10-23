import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Api } from '../api';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit, AfterViewInit {

  dados: any[] = [];
  tempChart: any;
  umidChart: any;
  dataSelecionada: string = ''; 

  constructor(private apiService: Api) {}

  ngOnInit() {
    this.carregarDados();
  }

  ngAfterViewInit() {

    this.inicializarGraficos([], [], []);
  }

  carregarDados(): void {
    this.apiService.getSensores().subscribe({
      next: (data: any[]) => {
        console.log('📊 Dados recebidos da API:', data);
        this.dados = data;
        this.atualizarGraficos();
      },
      error: (err) => {
        console.error('❌ Erro ao buscar dados:', err);
      }
    });
  }

  filtrarPorData(): void {
    if (!this.dataSelecionada) return;

    const dataFormatada = this.dataSelecionada.split('T')[0];
    console.log('📅 Data selecionada:', dataFormatada);

    this.apiService.getSensoresPorData(dataFormatada).subscribe({
      next: (data: any[]) => {
        console.log(`📊 Dados filtrados (${dataFormatada}):`, data);

        if (data.length === 0) {
          console.warn('⚠️ Nenhum dado retornado da API. Filtrando localmente...');
          this.dados = this.dados.filter(d => d.timestamp.startsWith(dataFormatada));
        } else {
          this.dados = data;
        }

        this.atualizarGraficos();
      },
      error: (err) => {
        console.error('❌ Erro ao buscar dados filtrados:', err);

        // Filtro local (backup caso o backend não suporte ?data=)
        this.dados = this.dados.filter(d => d.timestamp.startsWith(dataFormatada));
        this.atualizarGraficos();
      }
    });
  }

  atualizarGraficos(): void {
    const labels = this.dados.map(d => d.timestamp);
    const temperaturas = this.dados.map(d => d.temperatura);
    const umidades = this.dados.map(d => d.umidade);

    this.inicializarGraficos(labels, temperaturas, umidades);
  }

  inicializarGraficos(labels: string[], temperaturas: number[], umidades: number[]): void {
    if (this.tempChart) this.tempChart.destroy();
    if (this.umidChart) this.umidChart.destroy();

    this.tempChart = new Chart('tempChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Temperatura (°C)',
          data: temperaturas,
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#f44336'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: false, title: { display: true, text: '°C' } },
          x: { ticks: { color: '#555' } }
        }
      }
    });

    this.umidChart = new Chart('umidChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Umidade (%)',
          data: umidades,
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
          borderColor: '#2196f3',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: '%' } },
          x: { ticks: { color: '#555' } }
        }
      }
    });
  }
}
