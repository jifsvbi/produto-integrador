import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Api } from '../api';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {

  dados: any[] = [];
  tempChart: any;
  umidChart: any;
  dataSelecionada: string = new Date().toISOString();
  collectionName: string = 'jão';

  intervalId: any;
  ultimaLeituraId: string | null = null;

  constructor(private apiService: Api) {}

  ngOnInit() {
    this.buscarDados();
    this.iniciarAtualizacaoAutomatica();
  }

  ngAfterViewInit() {
    this.inicializarGraficos([], [], []);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  iniciarAtualizacaoAutomatica() {
    this.intervalId = setInterval(() => {
      this.verificarNovosDados();
    }, 10000); // 10s
  }

  buscarDados() {
    const dataFormatada = this.dataSelecionada.split('T')[0];

    this.apiService.getHistoricoDia(this.collectionName, dataFormatada).subscribe({
      next: (data: any[]) => {
        this.dados = data;
        if (data.length > 0) {
          this.ultimaLeituraId = data[data.length - 1]._id || data[data.length - 1].timestamp;
        }
        this.atualizarGraficos(true); // 🔹 animação ao atualizar
      },
      error: (err) => console.error('Erro ao buscar dados:', err)
    });
  }

  filtrarPorData() {
    this.buscarDados();
  }

  verificarNovosDados() {
    const dataFormatada = this.dataSelecionada.split('T')[0];

    this.apiService.getHistoricoDia(this.collectionName, dataFormatada).subscribe({
      next: (data: any[]) => {
        if (data.length === 0) return;

        const ultimoRegistro = data[data.length - 1];
        const idAtual = ultimoRegistro._id || ultimoRegistro.timestamp;

        if (idAtual !== this.ultimaLeituraId) {
          console.log('🔄 Novo dado detectado! Atualizando gráficos...');
          this.dados = data;
          this.ultimaLeituraId = idAtual;
          this.atualizarGraficos(true); // animação
        }
      },
      error: (err) => console.error('Erro ao verificar novos dados:', err)
    });
  }

  // 🔹 Atualiza gráficos com animação opcional
  atualizarGraficos(animar: boolean = false) {
    const labels = this.dados.map(d => d.timestamp);
    const temperaturas = this.dados.map(d => d.temperatura);
    const umidades = this.dados.map(d => d.umidade);

    this.inicializarGraficos(labels, temperaturas, umidades, animar);
  }

  // 🔹 Inicializa os gráficos Chart.js
  inicializarGraficos(
    labels: string[],
    temperaturas: number[],
    umidades: number[],
    animar: boolean = false
  ) {
    if (this.tempChart) this.tempChart.destroy();
    if (this.umidChart) this.umidChart.destroy();

    // 🌡️ Gráfico de Temperatura com animação suave
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
          tension: 0.4,
          pointBackgroundColor: '#f44336'
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: animar ? 800 : 0 // animação apenas quando houver atualização
        },
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: false, title: { display: true, text: '°C' } },
          x: { ticks: { color: '#555' } }
        }
      }
    });

    // 💧 Gráfico de Umidade com animação
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
        animation: {
          duration: animar ? 800 : 0
        },
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: '%' } },
          x: { ticks: { color: '#555' } }
        }
      }
    });
  }
}
