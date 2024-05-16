import { Component, ViewChild, inject } from '@angular/core';
import { IDataBD, ISIATAPM25 } from './interfaces/siata';
import { SiataService } from './services/siata.service';
import { Chart } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { environment } from '../environments/environment';
import { HubConnectionBuilder } from '@aspnet/signalr';
import { MessageService } from 'primeng/api';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-moment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    providers: [MessageService]
})
export class AppComponent {

    title = 'IoT';

    siataService = inject(SiataService)
    messageService = inject(MessageService)
    data: any;
    data1: any;
    data2: any;

    @ViewChild('chart') chart : UIChart = {} as UIChart;
    @ViewChild('chart1') chart1 : UIChart = {} as UIChart;
    @ViewChild('chart2') chart2 : UIChart = {} as UIChart;

    options: any;

    constructor(){
        let conenction = new HubConnectionBuilder().withUrl(environment.signalR).build();
        conenction.on("data", (data : IDataBD) => {
            this.show(data)
        });
        conenction.off("data", () => {
            conenction.start();
        });
        conenction.start();
    }

    ngOnInit() {
        Chart.register(zoomPlugin);
        this.siataService.getSIATAPM25().then((resp: ISIATAPM25[]) => {
            resp.forEach(item => {
                item.datos = item.datos.filter(x => x.valor > -985 && x.valor < 985).reverse().slice(0, 100)
            })
            this.data = this.getData(resp[3], '#0b5ed7')
            this.data1 = this.getData(resp[5], '#198754')
            this.data2 = this.getData(resp[6], '#dc3545')
        })

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.options = {
            stacked: false,
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            scales: {
                x: {
                    type: 'time',
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    },
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'yyyy/MM/DD HH:mm',
                        }
                    },
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
            },
            plugins: {
                zoom: {
                  zoom: {
                    wheel: {
                      enabled: true,
                    },
                    pinch: {
                      enabled: true
                    },
                    drag: {
                      enabled: true,
                      backgroundColor: 'rgba(225,225,225,0.8)'
                    },
                    mode: 'xy',
                  }
                },
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                  usePointStyle: true,
                  callbacks: {
                    labelPointStyle: function(context : any) {
                      return {
                          pointStyle: 'triangle',
                          rotation: 0
                      };
                    }
                  }
                },
                datalabels: {
                  display : false
                }
              }
        };
    }

    getData(dataSiata: ISIATAPM25, color: string): any {
        let data = {
            labels: dataSiata.datos.map(x => new Date(x.fecha)),
            datasets: [
                {
                    label: dataSiata.nombreCorto,
                    fill: false,
                    borderColor: color,
                    yAxisID: 'y',
                    tension: 0.4,
                    data: dataSiata.datos.map(x => x.valor)
                },
            ]
        };
        return data
    }

    show(data : IDataBD) {
        this.messageService.add({
            severity: 'success',
            summary: 'Nuevo Mensaje',
            detail: `Temperatura : ${data.temperature}, Humedad : ${data.humidity}, Intensidad Luminica : ${data.light}, Proximidad : ${data.proximity}`,
         });
    }

    resetChart(){
        this.chart.chart.resetZoom();
    }
    resetChart1(){
        this.chart1.chart.resetZoom();
    }
    resetChart2(){
        this.chart2.chart.resetZoom();
    }
}
