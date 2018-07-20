import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {User} from './user';
import {Position} from './position';

@Injectable({
  providedIn: 'root'
})
export class ClientHttpService {
    private path = 'http://localhost:8080';

    constructor(private http: HttpClient) {}

    /**
     * Funzione per prendere tutte le posizioni caricate sul server per l'admin
     */
    getPositions(): Observable<Position[]> {
        return this.http.get<Position[]>(this.path + '/secured/admin/positions');
    }

    /**
     * Funzione per prendere tutti gli utenti registrati per l'admin
     */
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.path + '/secured/admin/users');
    }

    /**
     * Funzione per prendere tutte le posizioni caricate dallo user con un certo id
     * @param id = id dello user di interesse
     */
    getUsersPositions(id: number): Observable<Position[]> {
        return this.http.get<Position[]>(this.path + '/secured/admin/users/' + id + '/positions');
    }


    /**
     * Funzione per prendere tutte le posizioni caricate dallo user loggato
     */
    getUserPositions(): Observable<Position[]> {
        return this.http.get<Position[]>(this.path + '/secured/user/positions');
    }

    /**
     * Funzione per caricare le posizioni inserite nella textarea da parte dello use loggato
     * @param textarea = posizioni da caricare
     */
    uploadPositions(textarea: string) {
        return this.http.post(this.path + '/secured/user/positions', textarea, {});
    }

    /**
     * Funzione per comprare le posizioni per il customer loggato
     * @param polygon = poligono che definisce l'area di interesse
     * @param timestampBefore = timestamp dopo il quale non ci interessano più le posizioni
     * @param timestampAfter = timestamp prima del quale non ci interessano più le posizioni
     */
    buyPositions(polygon: Position[], timestampBefore: number, timestampAfter: number): Observable<Position[]> {
        const longlatArray = polygon.map((x) => [x.longitude, x.latitude]);
        longlatArray.push(longlatArray[0]); // Per chiudere il poligono
        const json = {
            'timestampBefore': timestampBefore.toString(), // Da mettere come stringa
            'timestampAfter': timestampAfter.toString(), // Da mettere come stringa
            'area': {
                'type': 'Polygon',
                'coordinates': [longlatArray]
            }
        };
        return this.http.post<Position[]>(this.path + '/secured/customer/positions/buy', json, {});
    }

    /**
     * Funzione per prendere tute le posizioni acquistate dal customer loggato
     */
    getPositionsBought(): Observable<Position[]> {
        return this.http.get<Position[]>(this.path + '/secured/customer/positions/purchased', {});
    }

    /**
     * Funzione per prendere tutte le posizioni che il customer loggato può comprare
     */
    getBuyablePositions(): Observable<Position[]> {
        return this.http.get<Position[]>(this.path + '/secured/customer/buyable/positions');
    }
}
