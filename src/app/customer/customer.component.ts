import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FeatureGroup, latLng, latLngBounds, Map, marker, Marker, Polygon, tileLayer, Draw, icon} from 'leaflet';
import {FormControl} from '@angular/forms';
import {PositionService} from '../position.service';
import {Position} from '../position';
import {MatDatepickerInputEvent, MatDialog, MatSnackBar, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material';
import {PositionForm} from './position-form';
import {DialogOverviewComponent} from '../shared-components/dialog-overview/dialog-overview.component';
import {ClientHttpService} from '../client-http.service';

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 100,
  touchendHideDelay: 100,
};

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults }
  ],
  encapsulation: ViewEncapsulation.None,
})
export class CustomerComponent implements OnInit {
  toolbarTitle = 'Customer';

  // from service
  ICON_URL_RED = '../assets/images/marker-icon-red.png';
  ICON_URL_BLUE = '../assets/images/marker-icon-blue.png';
  SHADOW_URL = '../assets/images/marker-shadow.png';

  minNumberOfVertices = 3;
  maxNumberOfVertices = 20;
  markerIconRed;
  markerIconBlue;
  markersForSale: Marker[] = []; // Posizioni in vendita
  markers: Marker[] = []; // Marker messi nella mappa

  // form
  positionsForm: PositionForm[] = [];
  numberOfVertices = 3;

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

    // map
    // Opzioni per il setup iniziale della mappa: dove è centrata, quanto è lo zoom iniziale, il tema del background
    this.options = {
      layers: [this.LAYER_OSM],
      zoom: 1,
      maxZoom: 19,
      minZoom: 1,
      center: latLng(45.116177, 7.742615),
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
      this.resetPositionForm();
      this.positionService.polygonPositions = [];
    });

    // Metto un listener per capire quando devo aggiornare le pos acquistate
    this.positionService.boughtPositions.subscribe( () => {
      this.getBoughtPositions();
    });

    this.getBoughtPositions();

    // form
    this.initPositionForm();
  }

  // Funzione che mi serve per salvarmi la mappa in una variabile locale quando so che è stato tutto inizializzato
  onMapReady(map: Map): void {
    this.map = map;
    this.editableLayers = new FeatureGroup();
    this.map.addLayer(this.editableLayers);

    this.getPositionsToBuy();

    this.map.on(Draw.Event.CREATED, this.onDrawMap, this);
    this.map.on(Draw.Event.DELETED, this.onDeleteFromMap, this);
  }

  // Funzione chiamata quando è terminato il disegno sulla mappa
  onDrawMap(e: any): void {
    // Pulisco tutto prima di iniziare in caso
    this.clearMap();
    this.resetPositionForm();
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
        this.addFormWithPosition(newPosition);
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
    this.resetPositionForm();
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
    this.resetPositionForm();
    this.positionService.polygonPositions = [];
    this.getPositionsToBuy();
  }

  // form
  // Funzione per inizializzare il form
  initPositionForm(): void {
    this.positionsForm = [];
    this.resetPositionForm();
  }

  // Funzione per resettare il form
  resetPositionForm(): void {
    this.positionsForm = new Array();
    this.numberOfVertices = this.minNumberOfVertices;
    for (let counter = 0; counter < this.numberOfVertices; counter++) {
      const newPositionForm = new PositionForm(counter);
      this.positionsForm.push(newPositionForm);
    }
  }

  getNumberOfVertices(): number {
    return this.numberOfVertices;
  }

  addFormWithPosition(position: Position): void {
    if (this.numberOfVertices - this.getNumberOfNotEmptyForms() <= 1) {
      this.pushPositionForms(1);
    }

    let indexEmptyForm = this.getIndexEmptyForm();
    const pf = (indexEmptyForm === -1) ? new PositionForm(this.numberOfVertices + 1) : this.positionsForm[indexEmptyForm];

    if (indexEmptyForm === -1 && this.canAddPosition()) {
      indexEmptyForm = this.positionsForm.length - 1;
    }

    this.positionsForm[indexEmptyForm].updateView(position.latitude, position.longitude);

    if (document.getElementById(indexEmptyForm + '-latitude') !== null &&
      document.getElementById(indexEmptyForm + '-longitude') !== null) {
      document.getElementById(indexEmptyForm + '-latitude').focus();
      document.getElementById(indexEmptyForm + '-longitude').focus();
      document.getElementById(indexEmptyForm + '-longitude').blur();
    }
  }

  // Funzione per ritornare il numero di form pieni
  getNumberOfNotEmptyForms(): number {
    let counter = 0;
    this.positionsForm.forEach(p => {
      p.save(); // Per salvare in position value l'input
      if (!p.isEmpty()) {
        counter++;
      }
    });

    return counter;
  }

  // Funzione per prendere l'indice del primo form vuoto
  getIndexEmptyForm(): number {
    let i = -1;
    let found = false;
    this.positionsForm.forEach((form, index) => {
      if (form.isEmpty() && !found) {
        i = index;
        found = true;
      }
    });

    return i;
  }

  // Funzione per formattare il label dello slider
  formatLabel(value: number | null) {
    if (!value) {
      return this.getNumberOfVertices();
    }

    return value;
  }

  // Funzione per aggiungere 'n' form delle posizioni
  pushPositionForms(n: number) {
    if (this.numberOfVertices === this.maxNumberOfVertices) {
      return;
    }
    for ( let i = 0; i < n; i++ ) {
      this.positionsForm.push(new PositionForm(this.numberOfVertices + i));
    }

    this.numberOfVertices += n;
  }

  // Funzione per rimuovere 'n' form delle posizioni dal fondo
  popPositionForms(n: number) {
    const notEmptyForm = this.getNumberOfNotEmptyForms();
    for (let i = 0; i < n; i++) {
      if (this.numberOfVertices > notEmptyForm
        && this.numberOfVertices > this.minNumberOfVertices) {
        this.positionsForm.pop();
        this.numberOfVertices -= 1;
      }
    }
  }

  // Funzione chiamata quando si modifica il valore dello slider
  pitch(event: any) {
    if (this.numberOfVertices < event.value) {
      this.pushPositionForms(event.value - this.numberOfVertices);
    } else if (this.numberOfVertices > event.value) {
      this.popPositionForms(this.numberOfVertices - event.value);
    }
  }

  // Aggiunge un form
  add() {
    if (this.numberOfVertices < this.maxNumberOfVertices) {
      this.pushPositionForms(1);
    }
  }

  // Funzione chiamata quando si è cliccato il fab in basso
  submit() {
    if (!this.inputVerticesOk()) { // È corretto l'input
      this.openSnackBar('Presente almeno un valore errato', 'OK');
    } else if (!this.areValidVertices()) { // Sono vertici validi, ossia lo stesso vertice non è ripetuto (e disegnano una figura?)
      this.openSnackBar('Non puoi ripetere lo stesso vertice più di una volta', 'OK');
    } else if (this.getNumberOfNotEmptyForms() < this.minNumberOfVertices) {
      this.openSnackBar('Devi inserire almeno 3 vertici', 'OK');
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
    let wrongPositions = 0;
    this.positionsForm.forEach(element => {
      if (element.hasWrongInput() && !element.isEmpty()) {
        wrongPositions++;
      }
    });

    return wrongPositions === 0;
  }

  // Funzione per controllare se un singolo vertice è valido
  areValidVertices(): boolean {
    let repetition = 0;
    this.positionsForm.forEach(element0 => {
      if (!element0.isEmpty()) {
        this.positionsForm.forEach(element1 => {
          if (element0.sameCoordinates(element1.positionValue) && element0 !== element1) {
            repetition++;
          }
        });
      }
    });

    return repetition === 0;
  }

  checkIfAddNewForm(): void {
    if (this.numberOfVertices - this.getNumberOfNotEmptyForms() < 1) {
      this.pushPositionForms(1);
    }
  }

  // Funzione per aprire il dialog che ti visualizza quante posizioni ci sono nell'area
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewComponent, {
      height: '250px',
      width: '250px',
      data: {  }
    });
  }

  // Funzione che viene chiamata quando si ha finito con un campo del form
  showOnMap(): void {
    const numberOfNotEmptyForms = this.getNumberOfNotEmptyForms();

    if (!this.inputVerticesOk()) { // È corretto l'input
      this.openSnackBar('Presente almeno un valore errato', 'OK');
    } else if (!this.areValidVertices()) { // Sono vertici validi, ossia lo stesso vertice non è ripetuto (e disegnano una figura?)
      this.openSnackBar('Non puoi ripetere lo stesso vertice più di una volta', 'OK');
    } else if (numberOfNotEmptyForms < this.minNumberOfVertices) {
      this.openSnackBar('Devi inserire almeno 3 vertici', 'OK');
    } else {
      this.popPositionForms(this.numberOfVertices - numberOfNotEmptyForms - 1);

      this.markers = [];
      this.positionService.polygonPositions = [];
      this.positionsForm.forEach((position, index) => {
        if (index > numberOfNotEmptyForms - 1) {
          return;
        }
        position.save();
        const newMarker = marker(latLng(position.positionValue.latitude, position.positionValue.longitude),
          {icon: this.markerIconBlue})
          .bindPopup('<b>Coordinate:</b><br>LatLng(' + position.positionValue.latitude + ', ' + position.positionValue.longitude + ')'
          );
        this.markers.push(newMarker);
        this.map.addLayer(newMarker);
        this.positionService.polygonPositions.push( new Position(null, position.positionValue.latitude, position.positionValue.longitude));
      });
      this.tryAddPolygon();
    }
  }

  // Funzione per aggiugnere l'area
  tryAddPolygon(): void  {
    this.clearMap();

    if (this.markers.length >= 3) {
      const latlngs = [];
      this.markers.forEach(point => {
        this.map.addLayer(point);
        latlngs.push(point.getLatLng());
      });
      latlngs.push(latlngs[0]);
      this.polygon = new Polygon(latlngs, this.shapeOptions);
      this.polygon.redraw();
      this.editableLayers.addLayer(this.polygon);
      this.map.addLayer(this.editableLayers);
      this.map.fitBounds(this.polygon.getBounds());
    }
  }

  getBoughtPositions(): void {
    this.client.getPositionsBought().subscribe(positions => {
      this.positionsBought = positions;
    });
  }

  getDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  private getPositionsToBuy() {
    this.clearMap();
    this.markersForSale = [];
    this.positionService.positionsForSale = [];
    this.client.getBuyablePositions().subscribe(positions => {
      positions.forEach(p => {
        if (p.timestamp > this.dateMin && p.timestamp < this.dateMax ) {
          const newMarker = marker(latLng(p.latitude, p.longitude),
            { icon: this.markerIconRed })
            .bindPopup('<b>Coordinate:</b><br>LatLng(' + p.latitude + ', ' + p.longitude + ')<br>'
              + new Date(p.timestamp * 1000).toLocaleString());
          this.map.addLayer(newMarker);
          this.markersForSale.push(newMarker);
          this.positionService.positionsForSale.push(p);
        }
      });
    });
  }

  canAddPosition(): boolean {
    return this.positionsForm.length !== this.maxNumberOfVertices && this.markers.length !== this.maxNumberOfVertices;
  }
}
