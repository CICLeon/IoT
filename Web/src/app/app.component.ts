import { Component, HostListener, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { IDataBD, ISIATAPM25, Product } from './interfaces/siata';
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

    @ViewChild('chart') chart : UIChart = {} as UIChart;
    @ViewChild('chart1') chart1 : UIChart = {} as UIChart;
    @ViewChild('chart2') chart2 : UIChart = {} as UIChart;
    @ViewChild('chart3') chart3 : UIChart = {} as UIChart;
    @ViewChild('chartAux') chartAux : UIChart = {} as UIChart;

    @HostListener('window:resize', ['$event'])
    onResize(){
        // this.screenHeight = window.innerHeight;
        // this.screenWidth = window.innerWidth;
        this.heightChart = `${Number((window.innerHeight - 160 - (47.99*2) - (2.22*2))/2).toFixed(0)}px`
    }

    title = 'IoT';

    siataService = inject(SiataService)
    messageService = inject(MessageService)

    maximizeChart : WritableSignal<boolean> = signal(false)
    dataAux : WritableSignal<any> = signal(false)

    data: any;
    data1: any;
    data2: any;
    data3: any;

    heightChart : string = ''
    options: any;

    products: Product[] = [];
    responsiveOptions: any[] | undefined;

    constructor(){
        let conenction = new HubConnectionBuilder().withUrl(environment.signalR).build();
        conenction.on("data", (data : IDataBD) => {
            this.show(data)
        });
        conenction.off("data", () => {
            conenction.start();
        });
        conenction.start();
        this.onResize()
    }

    ngOnInit() {
        Chart.register(zoomPlugin);
        this.siataService.getSIATAPM25().then((resp: ISIATAPM25[]) => {
            resp.forEach(item => {
                item.datos = item.datos.filter(x => x.valor > -985 && x.valor < 985).reverse().slice(0, 50)
            })
            this.data = this.getData(resp[3], 'white', 'temperature', 15, 25)
            this.data1 = this.getData(resp[9], 'white', 'humidity', 50, 70)
            this.data2 = this.getData(resp[5], 'white', 'light', 0, 0)
            this.data3 = this.getData(resp[6], 'white', 'proximity', 0, 0)
        })

        this.siataService.getProductsSmall().then((products) => {
            this.products = products;
        });

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
                        color: 'white'
                    },
                    grid: {
                        color: surfaceBorder,
                        lineWidth: 0.1
                    },
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'MM/DD HH:mm',
                        }
                    },
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: surfaceBorder,
                        lineWidth: 0.1,
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: surfaceBorder
                    }
                }
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
                    display: false,
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

        this.responsiveOptions = [
            {
                breakpoint: '1199px',
                numVisible: 1,
                numScroll: 1
            },
            {
                breakpoint: '991px',
                numVisible: 2,
                numScroll: 1
            },
            {
                breakpoint: '767px',
                numVisible: 1,
                numScroll: 1
            }
        ];
    }

    getData(dataSiata: ISIATAPM25, color: string, label : string, min : number, max : number): any {
        let data = {
            labels: dataSiata.datos.map(x => new Date(x.fecha)),
            datasets: [
                {
                    label: label,
                    fill: false,
                    borderColor: color,
                    yAxisID: 'y',
                    tension: 0.4,
                    data: dataSiata.datos.map(x => x.valor),
                    borderWidth: 1,
                    pointBorderWidth: 0,
                    pointHoverBorderWidth: 1,
                    pointRadius: 3
                },
            ]
        };
        if(min <  max){
            data.datasets.push({
                label: `Limit Min ${label}`,
                fill: false,
                borderColor: 'red',
                yAxisID: 'y',
                tension: 0.4,
                data: dataSiata.datos.map(x => min),
                borderWidth: 1,
                pointBorderWidth: 0,
                pointHoverBorderWidth: 0,
                pointRadius: 0
            })
            data.datasets.push({
                label: `Limit Max ${label}`,
                fill: false,
                borderColor: 'red',
                yAxisID: 'y',
                tension: 0.4,
                data: dataSiata.datos.map(x => max),
                borderWidth: 1,
                pointBorderWidth: 0,
                pointHoverBorderWidth: 0,
                pointRadius: 0
            })
        }
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
    resetChart3(){
        this.chart3.chart.resetZoom();
    }
    resetChartAux(){
        this.chartAux.chart.resetZoom();
    }

    onShowModal(chart : number){
        switch(chart){
            case 0 :
                this.dataAux.set(this.data)
                break
            case 1 :
                this.dataAux.set(this.data1)
                break
            case 2 :
                this.dataAux.set(this.data2)
                break
            case 3 :
                this.dataAux.set(this.data3)
                break
        }
        this.maximizeChart.set(true)
    }
}
