import {Component, OnDestroy, OnInit, ViewEncapsulation, ɵEMPTY_ARRAY} from '@angular/core';
import {
  FeatureGroup,
  latLng,
  latLngBounds,
  Map,
  marker,
  Marker,
  Polygon,
  tileLayer,
  Draw,
  icon
} from 'leaflet';
import {FormControl} from '@angular/forms';
import {PositionService} from '../../position.service';
import {Position} from '../../position';
import {MatDatepickerInputEvent, MatSnackBar, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material';
import {ClientHttpService} from '../../client-http.service';
import {User} from '../../user';
import {forEach} from '@angular/router/src/utils/collection';
import {AmazingTimePickerService} from 'amazing-time-picker';
declare var google: any;

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 100,
  touchendHideDelay: 100,
};

@Component({
  selector: 'app-customer',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.css'],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults }
  ],
  encapsulation: ViewEncapsulation.None,
})
export class BuyComponent implements OnInit {
  title = 'Manage';
  users: User[] = [];
  colorLetters = '0123456789ABCDEF';

  ICON_URL_EMPTY = '../assets/images/marker-icon-empty.png';
  ICON_URL_BLUE = '../assets/images/marker-icon-blue.png';
  SHADOW_URL = '../assets/images/marker-shadow.png';

  positionCount: number;
  markerUserEmpty;
  markerIconBlue;
  positionsTimestamp: Position[];
  markers: Marker[] = []; // Marker messi nella mappa

  // map
  LAYER_OSM = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
  options;
  drawOptions;
  shapeOptions;
  editableLayers;
  map: Map;
  polygon: Polygon = undefined;
  dateMin: number;
  dateMax: number;
  dateInitMin = new FormControl(new Date(2018, 4, 25));
  dateInitMax = new FormControl(new Date());
  timeInitMin: string;
  timeInitMax: string;
  timeInitMinValue: number;
  timeInitMaxValue: number;

  // rappr temporale
  timeChart;
  timeRapprHeaders: String[];
  optionsTime;
  noPos;
  textNoPos;

  constructor(private positionService: PositionService,
              public snackBar: MatSnackBar,
              private atp: AmazingTimePickerService,
              private client: ClientHttpService) {}

  ngOnInit() {
    google.charts.load('current', {'packages': ['corechart']});

    // Marker per le posizioni degli utenti che sono sulla mappa
    this.markerUserEmpty = icon({
      iconSize: [15, 15],
      iconUrl: this.ICON_URL_EMPTY
    });

    // Marker per i punti che vado ad aggiungere io cliccando sulla mappa
    this.markerIconBlue = icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      popupAnchor: [0, -38],
      iconUrl: this.ICON_URL_BLUE,
      shadowUrl: this.SHADOW_URL
    });

    this.dateMin = new Date(2018, 4, 25).valueOf() / 1000;
    this.dateMax = new Date(2039, 12, 31).valueOf() / 1000;
    this.positionService.dateMin = this.dateMin;
    this.positionService.dateMax = this.dateMax;
    this.timeInitMin = '00:00';
    this.timeInitMax = '00:00';
    this.timeInitMinValue = 0;
    this.timeInitMaxValue = 0;

    this.options = {
      layers: [this.LAYER_OSM],
      zoom: 10,
      maxZoom: 19,
      minZoom: 3,
      center: latLng(45.0598278,  7.6457140),
      maxBounds: latLngBounds(latLng(90, 180), latLng(-90, -180))
    };

    this.shapeOptions = {
      editing: {
        className: '',
      },
      stroke: true,
      weight: 4,
      opacity: 0.5,
      fill: true,
      fillOpacity: 0.2,
      clickable: true,
      editable: false
    };

    this.drawOptions = {
      position: 'bottomleft',
      draw: {
        marker: false,
        polyline: false,
        polygon: true,
        circle: false,
        rectangle: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: this.editableLayers,
        edit: false,
        remove: true
      }
    };

    // rappr temporale
    this.timeChart = document.getElementById('timeChart');
    this.timeRapprHeaders = ['ID', 'Giorno', 'Ora', 'Utente'];
    this.noPos = document.createElement('h2');
    this.noPos.setAttribute('id', 'no-positions-time');
    this.noPos.setAttribute('class', 'no-positions');
    this.textNoPos = document.createTextNode('Nessuna posizione selezionata');

    this.optionsTime = {
      hAxis: {
        title: 'Giorni',
        format: 'dd/MM/yyyy'
      },
      vAxis: {
        title: 'Ore',
        format: 'HH:mm'
      },
      sizeAxis: {
        minSize: 5,
        maxSize: 5
      }
    };
  }

  // Funzione che mi serve per salvarmi la mappa in una variabile locale quando so che è stato tutto inizializzato
  onMapReady(map: Map): void {
    this.map = map;
    this.editableLayers = new FeatureGroup();
    this.map.addLayer(this.editableLayers);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // map
          // Opzioni per il setup iniziale della mappa: dove è centrata, quanto è lo zoom iniziale, il tema del background
          this.map.setView(latLng(pos.coords.latitude, pos.coords.longitude), 12);
          this.getPositionsToBuy();
        });
    } else {
      this.getPositionsToBuy();
    }

    this.map.on(Draw.Event.CREATED, this.onDrawMap, this);
    this.map.on('moveend', this.onZoomMoveMap, this);
    this.map.on('zoomend', this.onZoomMoveMap, this);
    this.map.on(Draw.Event.DELETED, this.onDeleteFromMap, this);
  }

  onZoomMoveMap(): void {
    this.getPositionsToBuy();
  }

  // Funzione chiamata quando è terminato il disegno sulla mappa
  onDrawMap(e: any): void {
    // Pulisco tutto prima di iniziare in caso
    this.clearMap();

    // Qua volendo si può estendere a disegnare un po'qualsiasi cosa, dai marker ai cerchi
    if (e.layer instanceof Polygon) {
      this.drawPolygon(e);
    }
  }

  // Funzione da chiamare quando si disegna un poligono
  drawPolygon(e: any): void {
    const arrayCoordinates: Array<Array<number>> = e.layer.toGeoJSON().geometry.coordinates;
    const latlngs = [];
    this.positionService.polygonPositions = [];
    arrayCoordinates[0].forEach((point, index) => {
      if (index !== (arrayCoordinates[0].length - 1)) {
        const latitudeLongitude = latLng(point[1], point[0]); // Sono invertite nel GeoJSON
        const newPosition = new Position();
        newPosition.latitude = latitudeLongitude.lat;
        newPosition.longitude = latitudeLongitude.lng;

        latlngs.push(latLng(latitudeLongitude.lat, latitudeLongitude.lng));
        this.positionService.polygonPositions.push(newPosition);
      }
    });
    this.polygon = new Polygon(latlngs, this.shapeOptions);
    this.client.countPositions(
      this.positionService.polygonPositions, this.dateMax, this.dateMin, this.positionService.usersIdRequestList)
      .subscribe(
        data => this.positionCount = data
      );
  }

  // Funzione chiamata quando si cancella il disegno dalla mappa
  onDeleteFromMap() {
    this.clearMap();
    this.positionService.polygonPositions = [];
    // creo poligono da vertici mappa
    const bounds = this.map.getBounds();
    this.positionService.polygonPositions.push(
      new Position(null, bounds.getSouthWest().lat, bounds.getSouthWest().lng)
    ); // bottom left
    this.positionService.polygonPositions.push(
      new Position(null, bounds.getSouthEast().lat, bounds.getSouthEast().lng)
    ); // bottom right
    this.positionService.polygonPositions.push(
      new Position(null, bounds.getNorthEast().lat, bounds.getNorthEast().lng)
    ); // top right
    this.positionService.polygonPositions.push(
      new Position(null, bounds.getNorthWest().lat, bounds.getNorthWest().lng)
    ); // top left
  }

  open() {
    const amazingTimePicker = this.atp.open();
    amazingTimePicker.afterClose().subscribe(time => {
      console.log(time);
    });
  }

  // Funzione per pulire la mappa
  clearMap(): void {
    this.map.eachLayer((layer) => {
      if (layer instanceof Polygon) {
        this.map.removeLayer(layer);
      }
    });
  }

  udpdateHourMin() {
    const amazingTimePicker = this.atp.open();
    amazingTimePicker.afterClose().subscribe(time => {
      this.timeInitMin = time;
      this.timeInitMinValue = 0;
      const a = time.split(':'); // split it at the colons

// minutes are worth 60 seconds. Hours are worth 60 minutes.
      this.timeInitMinValue = (+a[0]) * 60 * 60 + (+a[1]) * 60;
      this.positionService.dateMin = this.timeInitMinValue + this.dateMin;
    });
  }

  udpdateHourMax() {
    const amazingTimePicker = this.atp.open();
    amazingTimePicker.afterClose().subscribe(time => {
      this.timeInitMax = time;
      this.timeInitMaxValue = 0;
      const a = time.split(':'); // split it at the colons

// minutes are worth 60 seconds. Hours are worth 60 minutes.
      this.timeInitMaxValue = (+a[0]) * 60 * 60 + (+a[1]) * 60;
      this.positionService.dateMax = this.timeInitMaxValue + this.dateMax;
    });
  }

  updateSalesMin(date: MatDatepickerInputEvent<Date>) {
    this.dateMin = date.value.valueOf() / 1000;
    this.positionService.dateMin = this.timeInitMinValue + this.dateMin;
  }

  updateSalesMax(date: MatDatepickerInputEvent<Date>) {
    this.dateMax = date.value.valueOf() / 1000;
    this.positionService.dateMax = this.timeInitMaxValue + this.dateMax;
  }

  verifySales() {
    if (this.dateMin >= this.dateMax) {
      this.openSnackBar('La data di inizio deve essere minore della data di fine', 'OK');
      return;
    }
    this.clearMap();
    this.getPositionsToBuy();
  }

  // Apri la snack bar e fai vedere un messaggio con un bottoncino di fianco
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  private getPositionsToBuy(usersList?) {
    let cssText = '';
    let userAdded = false;
    this.clearMap();
    // remove markers
    this.map.eachLayer((layer) => {
      if (layer instanceof Marker) {
        this.map.removeLayer(layer);
      }
    });

    this.positionsTimestamp = [];
    this.positionService.polygonPositions = [];
    this.positionService.usersIdRequestList = [];

    // se presente riempo la lista di users richiedere al server
    if (usersList !== undefined) {
      this.users = [];
      if (usersList.length === 0) {
        this.positionService.usersIdRequestList.push('fakeUser');
      } else {
        usersList.forEach(user => {
          this.positionService.usersIdRequestList.push(user._text.nativeElement.innerText);
        });
      }
    }

    // creo poligono da vertici mappa
    const bounds = this.map.getBounds();
    this.positionService.polygonPositions.push(
      new Position(null, bounds.getSouthWest().lat, bounds.getSouthWest().lng)
      ); // bottom left
    this.positionService.polygonPositions.push(
      new Position(null, bounds.getSouthEast().lat, bounds.getSouthEast().lng)
    ); // bottom right
    this.positionService.polygonPositions.push(
      new Position(null, bounds.getNorthEast().lat, bounds.getNorthEast().lng)
    ); // top right
    this.positionService.polygonPositions.push(
      new Position(null, bounds.getNorthWest().lat, bounds.getNorthWest().lng)
    ); // top left


    this.client.getBuyablePositions(
      this.positionService.polygonPositions, this.positionService.dateMax, this.positionService.dateMin,
      this.positionService.usersIdRequestList).subscribe(
      data => {
        this.positionCount = 0;
        data.reprCoordList.forEach(p => {
          // inserisco utente nell'array users solo se non c'è già
          let temp = new User(p.userId);
          let flag = true;
          this.users.forEach(user => {
            if ( user.id === temp.id ) {
              temp = user;
              flag = false;
            }
          });
          if (flag) {
            userAdded = true;
            temp.markerColor = '';
            const user: number[] = [0, 0, 0, 0, 0, 0];

            user[0] = (temp.id.charCodeAt(0) + temp.id.charCodeAt(1) * temp.id.charCodeAt(2) * temp.id.charCodeAt(3)) % 16;
            user[1] = (temp.id.charCodeAt(4) * temp.id.charCodeAt(5) + temp.id.charCodeAt(6) * temp.id.charCodeAt(7)) % 16;
            user[2] = (temp.id.charCodeAt(8) + temp.id.charCodeAt(9) + temp.id.charCodeAt(10) + temp.id.charCodeAt(11)) % 16;
            user[3] = (temp.id.charCodeAt(12) * temp.id.charCodeAt(13) * temp.id.charCodeAt(14) * temp.id.charCodeAt(15)) % 16;
            user[4] = (temp.id.charCodeAt(16) + temp.id.charCodeAt(17) + temp.id.charCodeAt(18) * temp.id.charCodeAt(19)) % 16;
            user[5] = (temp.id.charCodeAt(20) + temp.id.charCodeAt(21) + temp.id.charCodeAt(22) + temp.id.charCodeAt(23)) % 16;

            for (let i = 0; i < 6; i++) {
              temp.markerColor +=
                  this.colorLetters[(i === 0) ? user[i] : (user[i] + user[i - 1]) % 16];
            }
            this.users.push(temp);
            cssText += '.color-' + temp.markerColor + ' {background-color: #' + temp.markerColor + ';} ';
          }

          this.markerUserEmpty.options.className = 'marker-user color-' + temp.markerColor;
          // popolo mappa
          const newMarker = marker(latLng(p.lat, p.lng),
            { icon: this.markerUserEmpty })
            .bindPopup('<b>Coordinate:</b><br>LatLng(' + p.lat + ', ' + p.lng + ')')
          ;
          // .getElement().setAttribute('style', 'background-color: ' + temp.markerColor);
          this.map.addLayer(newMarker);
          this.positionCount++;
        });

        // prendo i dati per il grafico temporale
        data.reprTimeList.forEach(p => {
          this.positionsTimestamp.push(
            new Position(null, null, null, p.tstp, p.userId)
          );
        });

        this.buildChart(this.positionsTimestamp);
        // aggiungo css solo se ho trovato nuovo utente
        if (userAdded) {
          const style: HTMLLinkElement = document.createElement('link');
          style.setAttribute('class', 'markers-color-icon');
          style.setAttribute('rel', 'stylesheet');
          style.setAttribute('type', 'text/css');
          style.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(cssText));
          document.head.appendChild(style);
        }
      });
  }

  // rappr temporale
  private buildChart(userTimestamps: Position[]): void {
    const chartFunc = () => new google.visualization.BubbleChart(this.timeChart);

    const func = (cb, opt) => {
      const data = [];

      if (userTimestamps.length > 0) {
        this.timeChart.setAttribute('style', 'height: 300px');
        data.push(this.timeRapprHeaders);
        userTimestamps.forEach(p => {
          const date = new Date(p.timestamp * 1000);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          data.push(['', date, [hours, minutes, 0], p.userId]);
        });

        const datatable = new google.visualization.arrayToDataTable(data);
        cb().draw(datatable, opt);
      } else {
        for (let i = 0; i < this.timeChart.childNodes.length; i++) {
          this.timeChart.removeChild(this.timeChart.childNodes[i]);
        }
        this.noPos.appendChild(this.textNoPos);
        this.timeChart.appendChild(this.noPos);
        this.timeChart  .setAttribute('style', 'height: auto');
      }

    };

    const callback = () => func(chartFunc, this.optionsTime);
    google.charts.setOnLoadCallback(callback);
  }
}
