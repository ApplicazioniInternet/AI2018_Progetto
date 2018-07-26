import { FormControl, Validators, FormGroup,  } from '@angular/forms';
import { Position } from '../../position';

export class PositionForm {
    id: number;
    positionValue?: Position;
    group: FormGroup;

    constructor(id: number, latitude?: number, longitude?: number, timestamp?: number) {
        this.id = id;
        this.positionValue = new Position(id, undefined, undefined, undefined);

        // Creo i validati dell'input del form
        const latitudeFormControl = new FormControl('', [Validators.required,
                                                        Validators.min(-90),
                                                        Validators.max(90),
                                                        Validators.pattern('\-?[0-9]+[.]?[0-9]*')]);
        const longitudeFormControl = new FormControl('', [Validators.required,
                                                        Validators.min(-180),
                                                        Validators.max(180),
                                                        Validators.pattern('\-?[0-9]+[.]?[0-9]*')]);

        // Metto tutti i validatori in un unico gruppo
        this.group = new FormGroup({
            'latitude': latitudeFormControl,
            'longitude': longitudeFormControl
        }, this.validateGroup);

        // Setto dei valori di default
        this.group.get('latitude').setValue(undefined);
        this.group.get('longitude').setValue(undefined);
    }

    // Funzione per validare il gruppo, ora non fa nulla, ma nel dubbio io ce l'ho cacciata
    validateGroup(g: FormGroup) {
        return (g.get('latitude').valid && g.get('longitude').valid) ? null : { 'mismatch': true };
    }

    // Funzione per fare l'update dell'input arrivato dalla mappa
    updateView(latitude: number, longitude: number): void {
        this.inputLatitude(latitude);
        this.inputLongitude(longitude);
    }

    // Funzione per prendere il messaggio di errore sulla latitudine
    getErrorMessageLatitude(): String {
        return this.group.get('latitude').hasError('required') ? 'Devi inserire un valore' :
            this.group.get('latitude').hasError('max') ? 'Valore massimo latitudine = 90' :
            this.group.get('latitude').hasError('min') ? 'Valore minimo latitudine = -90' :
            this.group.get('latitude').hasError('pattern') ? 'Consentiti solo valori numerici' :
            '';
    }

    // Funzione per prendere il messaggio di errore sulla longitudine
    getErrorMessageLongitude(): String {
        return this.group.get('longitude').hasError('required') ? 'Devi inserire un valore' :
            this.group.get('longitude').hasError('max') ? 'Valore massimo longitudine = 180' :
            this.group.get('longitude').hasError('min') ? 'Valore minimo longitudine = -180' :
            this.group.get('longitude').hasError('pattern') ? 'Consentiti solo valori numerici' :
            '';
    }

    // Funzione per aggiornare la latitudine
    inputLatitude(latitude: number) {
        this.positionValue.latitude = latitude;
        this.group.get('latitude').setValue(latitude);
    }

    // Funzione per aggiornare la longitudine
    inputLongitude(longitude: number) {
        this.positionValue.longitude = longitude;
        this.group.get('longitude').setValue(longitude);
    }

    // Funzione per controllare se le coordinate inserite in questo form corrispondono a quelle della posizione passata come parametro
    sameCoordinates(position: Position) {
        return this.positionValue.latitude === position.latitude && this.positionValue.longitude === position.longitude;
    }

    // Funzione per controllare se c'è un errore nell'input
    hasWrongInput(): boolean {
        return  this.hasWrongLatitude() || this.hasWrongLongitude();
    }

    hasWrongLatitude(): boolean {
        return this.group.get('latitude').hasError('required') ||
            this.group.get('latitude').hasError('max') ||
            this.group.get('latitude').hasError('min') ||
            this.group.get('latitude').hasError('pattern');
    }

    hasWrongLongitude(): boolean {
        return this.group.get('longitude').hasError('required') ||
            this.group.get('longitude').hasError('max') ||
            this.group.get('longitude').hasError('min') ||
            this.group.get('longitude').hasError('pattern');
    }

    // Funzione per capire se il form è vuoto
    isEmpty(): boolean {
        if (this.group.get('latitude').hasError('required')) {
            this.positionValue.latitude = undefined;
        }

        if (this.group.get('longitude').hasError('required')) {
            this.positionValue.longitude = undefined;
        }

        return this.positionValue.latitude === undefined &&
                this.positionValue.longitude === undefined;
    }

    save(): void {
        this.positionValue.latitude = this.group.get('latitude').value;
        this.positionValue.longitude = this.group.get('longitude').value;
    }

    emptyForm(): void {
        this.positionValue.latitude = undefined;
        this.positionValue.longitude = undefined;
        this.group.get('latitude').setValue(undefined);
        this.group.get('longitude').setValue(undefined);
    }
}
