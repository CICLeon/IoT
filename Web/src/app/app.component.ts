import { Component, HostListener, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { IDataBD, IResource, ISIATAPM25, Product } from './interfaces/siata';
import { SiataService } from './services/siata.service';
import { Chart } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { environment } from '../environments/environment';
import { HubConnectionBuilder } from '@aspnet/signalr';
import { MessageService } from 'primeng/api';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { zip } from 'rxjs';

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
        this.heightChart = `${Number((window.innerHeight - 160 - (47.99*2) - (2.22*2))/2).toFixed(0)}px`
    }

    title = 'IoT';

    siataService = inject(SiataService)
    messageService = inject(MessageService)
    formBuilder = inject(FormBuilder)

    maximizeChart : WritableSignal<boolean> = signal(false)
    showImageModal : WritableSignal<boolean> = signal(false)
    addResourceModal : WritableSignal<boolean> = signal(false)
    dataAux : WritableSignal<any> = signal(false)
    file : WritableSignal<File> = signal({} as File)
    dataBD : WritableSignal<IDataBD[]> = signal([])
    label : WritableSignal<string> = signal('')
    dataNumber : WritableSignal<string> = signal('')
    selectResource : WritableSignal<IResource> = signal({} as IResource)

    data: any;
    data1: any;
    data2: any;
    data3: any;

    heightChart : string = ''
    options: any;
    baseResource : string = environment.baseResource

    responsiveOptions: any[] | undefined;

    resources : IResource[] =[]
    formResource : FormGroup = this.formBuilder.group({
        name : ['', Validators.required],
        // description : ['', Validators.required],
        dateRegister : [new Date(), Validators.required],
    })

    constructor(){
        let conenction = new HubConnectionBuilder().withUrl(environment.signalR).build();
        conenction.on("data", (data : IDataBD) => {
            this.show(data)
            this.updataData(data)
        });
        conenction.off("data", () => {
            conenction.start();
        });
        conenction.start();
        this.onResize()
    }

    ngOnInit() {
        Chart.register(zoomPlugin);

        zip<[IDataBD[], IResource[]]>(
            this.siataService.getData(),
            this.siataService.getResource()
        ).subscribe(resp => {
            this.resources = resp[1]
            this.dataBD.set(resp[0])
            let labels = resp[0].map(x => new Date(x.dateRegister))
            this.data = this.getData(labels, resp[0].map(x => x.temperature), 'white', 'temperature', 15, 25)
            this.data1 = this.getData(labels, resp[0].map(x => x.humidity), 'white', 'humidity', 50, 70)
            this.data2 = this.getData(labels, resp[0].map(x => x.light), 'white', 'light', 0, 0)
            this.data3 = this.getData(labels, resp[0].map(x => x.proximity), 'white', 'proximity', 0, 0)
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

    getData(labels : Date[], data : number[], color: string, label : string, min : number, max : number): any {
        let dataChart = {
            labels: labels,
            datasets: [
                {
                    label: label,
                    fill: false,
                    borderColor: color,
                    yAxisID: 'y',
                    tension: 0.4,
                    data: data,
                    borderWidth: 1,
                    pointBorderWidth: 1,
                    pointHoverBorderWidth: 1,
                    pointRadius: 1
                },
            ]
        };
        if(min <  max){
            dataChart.datasets.push({
                label: `Limit Min ${label}`,
                fill: false,
                borderColor: 'red',
                yAxisID: 'y',
                tension: 0.4,
                data: data.map(x => min),
                borderWidth: 1,
                pointBorderWidth: 0,
                pointHoverBorderWidth: 0,
                pointRadius: 0
            })
            dataChart.datasets.push({
                label: `Limit Max ${label}`,
                fill: false,
                borderColor: 'red',
                yAxisID: 'y',
                tension: 0.4,
                data: data.map(x => max),
                borderWidth: 1,
                pointBorderWidth: 0,
                pointHoverBorderWidth: 0,
                pointRadius: 0
            })
        }
        return dataChart
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
                this.label.set('Temperature')
                this.dataNumber.set(this.dataBD()[0].temperature.toFixed(2)+'°C')
                break
            case 1 :
                this.dataAux.set(this.data1)
                this.label.set('Humidity')
                this.dataNumber.set(this.dataBD()[0].humidity.toFixed(2)+'%')
                break
            case 2 :
                this.dataAux.set(this.data2)
                this.label.set('Lighting')
                this.dataNumber.set(this.dataBD()[0].light.toFixed(2))
                break
            case 3 :
                this.dataAux.set(this.data3)
                this.label.set('Proximity')
                this.dataNumber.set(this.dataBD()[0].proximity.toFixed(2))
                break
        }
        this.maximizeChart.set(true)
    }

    async onUploadFile(event: any) {
        this.file.set(event.currentFiles[0]);

    }

    async convertFiletoBase64(file : File) : Promise<string> {
        return new Promise((resp) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
            resp(event.target!.result!.toString().split(",")[1])
            }
        })
    }

    async saveResource(){
        if(this.formResource.invalid){
            this.formResource.markAllAsTouched()
            return
        }
        let resource : IResource = {
            name: this.formResource.controls['name'].value,
            description: '',
            contentType: this.file().type,
            fileName: this.file().name.split(".")[0],
            fileBase64: await this.convertFiletoBase64(this.file()),
            dateRegister: new Date(),
            url: this.baseResource
        }
        this.siataService.saveRecourse(resource).subscribe(resp => {
            if(resp === true){
                this.addResourceModal.set(false)
                this.ngOnInit()
            }else{
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: resp,
                 });
            }
        })
    }

    onShowImage(resource : IResource){
        this.selectResource.set(resource)
        this.showImageModal.set(true)
    }

    updataData(data : IDataBD){
        this.dataBD.update(x => {return [...x, data]})
        this.dataBD.set(this.dataBD().sort((a, b) => new Date(b.dateRegister).getTime() - new Date(a.dateRegister).getTime()))
        let labels = this.dataBD().map(x => new Date(x.dateRegister))
        this.data = this.getData(labels, this.dataBD().map(x => x.temperature), 'white', 'temperature', 15, 25)
        this.data1 = this.getData(labels, this.dataBD().map(x => x.humidity), 'white', 'humidity', 50, 70)
        this.data2 = this.getData(labels, this.dataBD().map(x => x.light), 'white', 'light', 0, 0)
        this.data3 = this.getData(labels, this.dataBD().map(x => x.proximity), 'white', 'proximity', 0, 0)
    }
}
