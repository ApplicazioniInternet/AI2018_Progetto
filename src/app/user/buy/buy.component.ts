import {Component, OnInit, ViewEncapsulation} from '@angular/core';
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
  icon,
  LatLng,
  control,
  LatLngBounds
} from 'leaflet';
import {FormControl} from '@angular/forms';
import {PositionService} from '../../position.service';
import {Position} from '../../position';
import {MatDatepickerInputEvent, MatDialog, MatSnackBar, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material';
import {DialogOverviewComponent} from '../../shared-components/dialog-overview/dialog-overview.component';
import {ClientHttpService} from '../../client-http.service';
import {User} from '../../user';

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
  users: User[];

  ICON_URL_RED = '../assets/images/marker-icon-red.png';
  ICON_URL_BLUE = '../assets/images/marker-icon-blue.png';
  SHADOW_URL = '../assets/images/marker-shadow.png';

  markerIconRed;
  markerIconBlue;
  markersForSale: Marker[] = []; // Posizioni in vendita
  markers: Marker[] = []; // Marker messi nella mappa

  // map
  LAYER_OSM = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
  options;
  drawOptions;
  shapeOptions;
  editableLayers;
  map: Map;
  polygon: Polygon = undefined;
  boundPositions: LatLng[] = [];
  dateMin: number;
  dateMax: number;
  dateInitMin = new FormControl(new Date(2018, 4, 25));
  dateInitMax = new FormControl(new Date());

  // position bought
  positionsBought: Position[] = new Array<Position>();

  constructor(private positionService: PositionService, public snackBar: MatSnackBar,
              public dialog: MatDialog, private client: ClientHttpService) {}

  ngOnInit() {

    // Marker per le posizioni degli utenti che sono sulla mappa
    this.markerIconRed = icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      popupAnchor: [0, -38],
      iconUrl: this.ICON_URL_RED,
      shadowUrl: this.SHADOW_URL
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

    // Metto un listener per capire quando devo pulire tutta la mappa
    this.positionService.clearAllPositions.subscribe( () => {
      this.clearMap();
      this.positionService.polygonPositions = [];
    });

    // // Metto un listener per capire quando devo aggiornare le pos acquistate
    // this.positionService.boughtPositions.subscribe( () => {
    //   this.getBoughtPositions();
    // });
    //
    // this.getBoughtPositions();

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
          this.map.setView(latLng(pos.coords.latitude, pos.coords.longitude), 5);
          this.getPositionsToBuy();
        });
    } else {
      this.getPositionsToBuy();
    }
    this.map.on(Draw.Event.CREATED, this.onDrawMap, this);
    this.map.on(Draw.Event.DELETED, this.onDeleteFromMap, this);
  }

  // Funzione chiamata quando è terminato il disegno sulla mappa
  onDrawMap(e: any): void {
    // Pulisco tutto prima di iniziare in caso
    this.clearMap();
    this.positionService.polygonPositions = [];

    // Qua volendo si può estendere a disegnare un po'qualsiasi cosa, dai marker ai cerchi
    if (e.layer instanceof Polygon) {
      this.drawPolygon(e);
    }
  }

  // Funzione da chiamare quando si disegna un poligono
  drawPolygon(e: any): void {
    const arrayCoordinates: Array<Array<number>> = e.layer.toGeoJSON().geometry.coordinates;
    const latlngs = [];
    arrayCoordinates[0].forEach((point, index) => {
      if (index !== (arrayCoordinates[0].length - 1)) {
        const latitudeLongitude = latLng(point[1], point[0]); // Sono invertite nel GeoJSON
        const newPosition = new Position();
        const newMarker = marker(latitudeLongitude, { icon: this.markerIconBlue })
          .bindPopup('<b>Coordinate:</b><br>' + latitudeLongitude + '');
        newPosition.latitude = newMarker.getLatLng().lat;
        newPosition.longitude = newMarker.getLatLng().lng;

        latlngs.push(latLng(newMarker.getLatLng().lat, newMarker.getLatLng().lng));
        this.map.addLayer(newMarker);
        this.positionService.polygonPositions.push(newPosition);
      }
    });
    this.polygon = new Polygon(latlngs, this.shapeOptions);
    this.map.fitBounds(this.polygon.getBounds());
  }

  // Funzione chiamata quando si cancella il disegno dalla mappa
  onDeleteFromMap(e: any) {
    if (this.markers.length === 0) {
      return;
    }
    this.clearMap();
    this.positionService.polygonPositions = [];
  }

  // Funzione per pulire la mappa
  clearMap(force?: boolean): void {
    if (force === undefined) {
      force = false;
    }
    this.map.eachLayer((layer) => {
      if (layer instanceof Marker) {
        const m: Marker = layer;
        if (!this.canBeDeleted(m) || force) {
          this.map.removeLayer(layer);
        }
      }

      if (layer instanceof Polygon) {
        this.map.removeLayer(layer);
      }
    });
  }

  canBeDeleted(mark: Marker): boolean {
    return this.markersForSale.indexOf(mark) !== -1;
  }

  updateSalesMin(date: MatDatepickerInputEvent<Date>) {
    this.dateMin = date.value.valueOf() / 1000;
    this.positionService.dateMin = this.dateMin;
  }

  updateSalesMax(date: MatDatepickerInputEvent<Date>) {
    this.dateMax = date.value.valueOf() / 1000;
    this.positionService.dateMax = this.dateMax;
  }

  verifySales() {
    if (this.dateMin >= this.dateMax) {
      this.openSnackBar('La data di inizio deve essere minore della data di fine', 'OK');
      return;
    }
    this.clearMap(true);
    this.positionService.polygonPositions = [];
    this.getPositionsToBuy();
  }

  // Funzione chiamata quando si è cliccato il fab in basso
  submit() {
    if (!this.inputVerticesOk()) { // È corretto l'input
      this.openSnackBar('Presente almeno un valore errato', 'OK');
    } else if (!this.areValidVertices()) { // Sono vertici validi, ossia lo stesso vertice non è ripetuto (e disegnano una figura?)
      this.openSnackBar('Non puoi ripetere lo stesso vertice più di una volta', 'OK');
    } else {
      this.openDialog();
    }
  }

  // Apri la snack bar e fai vedere un messaggio con un bottoncino di fianco
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  // Funzione per controllare che l'input sia corretto
  inputVerticesOk(): boolean {
    const wrongPositions = 0;
    return wrongPositions === 0;
  }

  // Funzione per controllare se un singolo vertice è valido
  areValidVertices(): boolean {
    const repetition = 0;
    return repetition === 0;
  }

  // Funzione per aprire il dialog che ti visualizza quante posizioni ci sono nell'area
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewComponent, {
      height: '250px',
      width: '250px',
      data: {  }
    });
  }

  getDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  private getPositionsToBuy() {
    this.clearMap();
    this.markersForSale = [];
    this.positionService.positionsForSale = [];

    if (this.boundPositions.length === 0) {
      // creo poligono da vertici mappa
      const bounds = this.map.getBounds();
      this.boundPositions.push(bounds.getSouthWest()); // bottom left
      this.boundPositions.push(bounds.getSouthEast()); // bottom right
      this.boundPositions.push(bounds.getNorthEast()); // top right
      this.boundPositions.push(bounds.getNorthWest()); // top left
    }

    this.client.getBuyablePositions(this.boundPositions, this.dateMax, this.dateMin).subscribe(
      data => {
        data.reprCoordList.forEach(p => {
          const newMarker = marker(latLng(p.lat, p.lng),
            { icon: this.markerIconRed })
            .bindPopup('<b>Coordinate:</b><br>LatLng(' + p.lat + ', ' + p.lng + ')');
          this.map.addLayer(newMarker);
          this.markersForSale.push(newMarker);
          this.positionService.positionsForSale.push(p);
        });
    });
  }
}
