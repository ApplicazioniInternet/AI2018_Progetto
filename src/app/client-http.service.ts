import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {User} from './user';
import {Position} from './position';
import {Archive} from './archive';

@Injectable({
  providedIn: 'root'
})
export class ClientHttpService {
    private path = 'http://localhost:8080';

    constructor(private http: HttpClient) {}

    /**
    * Funzione per prendere tute le posizioni acquistate dal customer loggato
    */
    getArchivesBought(id: string): Observable<Archive[]> {
        return this.http.get<Archive[]>(this.path + '/secured/archives/purchased/user/' + id, {});
    }

    /**
    * Funzione per prendere tutte le posizioni caricate dallo user loggato
    */
    getUserArchives(id: string): Observable<Archive[]> {
        return this.http.get<Archive[]>(this.path + '/secured/archives/uploaded/user/' + id );
    }

    /**
    * Funzione per caricare le posizioni inserite nella textarea da parte dello use loggato
    * @param textarea = posizioni da caricare
    */
    uploadArchives(positionJson: string) {
        return this.http.post(this.path + '/secured/archives/archive/upload', positionJson, {});
    }

    /**
     * Funzione per prendere tutte le posizioni caricate sul server per l'admin
     */
    // getPositions(): Observable<Position[]> {
    //     return this.http.get<Position[]>(this.path + '/secured/admin/archives');
    // }

    /**
     * Funzione per prendere tutti gli utenti registrati per l'admin
     */
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.path + '/secured/users');
    }

    /**
     * Funzione per comprare le posizioni per il customer loggato
     * @param polygon = poligono che definisce l'area di interesse
     * @param timestampBefore = timestamp dopo il quale non ci interessano più le posizioni
     * @param timestampAfter = timestamp prima del quale non ci interessano più le posizioni
     */
    buyArchives(polygon: Position[], timestampBefore: number, timestampAfter: number): Observable<Archive[]> {
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
        return this.http.post<Archive[]>(this.path + '/secured/buy/archives/buy', json, {});
    }

    /**
     * Funzione per prendere tutte le posizioni che il customer loggato può comprare
     */
    getBuyablePositions(): Observable<Position[]> {
        return this.http.get<Position[]>(this.path + '/secured/buy/buyable/archives');
    }

    getArchivePositions(id: string) {
      return this.http.get<Position[]>(this.path + '/secured/archives/archive/' + id + '/positions');
    }

    deleteArchive(id: string) {
      return this.http.delete(this.path + '/secured/archives/archive/' + id + '/delete');
    }

    downloadArchive(id: string) {
      return this.http.get(this.path + '/secured/archives/archive/' + id + '/download');
    }
}
