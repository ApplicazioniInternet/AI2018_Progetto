import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {User} from './user';
import {Position} from './position';
import {Archive} from './archive';
import {ArchiveLight} from './archive-light';

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
     * Funzione per comprare le posizioni per il customer loggato
     * @param polygon = poligono che definisce l'area di interesse
     * @param timestampBefore = timestamp dopo il quale non ci interessano più le posizioni
     * @param timestampAfter = timestamp prima del quale non ci interessano più le posizioni
     */
    buyArchives(archiveList: ArchiveLight[]) {
      const json = { archiveList };
      return this.http.post(this.path + '/secured/archives/buy', json, {});
    }

  /**
   * Funzione per contare archivi relativi alle posizioni nell'area selezionata
   * @param polygon = poligono che definisce l'area di interesse
   * @param timestampBefore = timestamp dopo il quale non ci interessano più le posizioni
   * @param timestampAfter = timestamp prima del quale non ci interessano più le posizioni
   */
  countArchives(polygon: Position[], timestampBefore: number, timestampAfter: number, usersIdRequestList): Observable<number> {
    const longlatArray = polygon.map((x) => [x.longitude, x.latitude]);
    longlatArray.push(longlatArray[0]); // Per chiudere il poligono
    const json = {
      'timestampBefore': timestampBefore.toString(), // Da mettere come stringa
      'timestampAfter': timestampAfter.toString(), // Da mettere come stringa
      'area': {
        'type': 'Polygon',
        'coordinates': [longlatArray]
      },
      'userIds' : usersIdRequestList
    };
    return this.http.post<number>(this.path + '/secured/archives/area/count', json, {});
  }

  /**
   * Funzione per contare archivi relativi alle posizioni nell'area selezionata
   * @param polygon = poligono che definisce l'area di interesse
   * @param timestampBefore = timestamp dopo il quale non ci interessano più le posizioni
   * @param timestampAfter = timestamp prima del quale non ci interessano più le posizioni
   */
  listArchives(polygon: Position[], timestampBefore: number, timestampAfter: number, usersIdRequestList): Observable<ArchiveLight[]> {
    const longlatArray = polygon.map((x) => [x.longitude, x.latitude]);
    longlatArray.push(longlatArray[0]); // Per chiudere il poligono
    const json = {
      'timestampBefore': timestampBefore.toString(), // Da mettere come stringa
      'timestampAfter': timestampAfter.toString(), // Da mettere come stringa
      'area': {
        'type': 'Polygon',
        'coordinates': [longlatArray]
      },
      'userIds' : usersIdRequestList
    };
    return this.http.post<ArchiveLight[]>(this.path + '/secured/archives/area/list', json, {});
  }

  countPositions(polygon: Position[], timestampBefore: number, timestampAfter: number, usersIdRequestList): Observable<number> {
    const longlatArray = polygon.map((x) => [x.longitude, x.latitude]);
    longlatArray.push(longlatArray[0]); // Per chiudere il poligono
    const json = {
      'timestampBefore': timestampBefore.toString(), // Da mettere come stringa
      'timestampAfter': timestampAfter.toString(), // Da mettere come stringa
      'area': {
        'type': 'Polygon',
        'coordinates': [longlatArray]
      },
      'userIds' : usersIdRequestList
    };
    return this.http.post<number>(this.path + '/secured/positions/area/count', json, {});
  }

  /**
     * Funzione per prendere tutte le posizioni che il customer loggato può comprare
     */
    getBuyablePositions(polygon: Position[], timestampBefore: number, timestampAfter: number, usersIdRequestList): Observable<any> {
    const longlatArray = polygon.map((x) => [x.longitude, x.latitude]);
    longlatArray.push(longlatArray[0]); // Per chiudere il poligono
      const json = {
        'timestampBefore': timestampBefore.toString(), // Da mettere come stringa
        'timestampAfter': timestampAfter.toString(), // Da mettere come stringa
        'area': {
          'type': 'Polygon',
          'coordinates': [longlatArray]
        },
        'userIds' : usersIdRequestList
      };
      return this.http.post<any[]>(this.path + '/secured/positions/representations', json, {});
    }

    deleteArchive(id: string) {
      return this.http.delete(this.path + '/secured/archives/archive/' + id + '/delete');
    }

    downloadArchive(id: string) {
      return this.http.get(this.path + '/secured/archives/archive/' + id + '/download');
    }

    getArchiveSaleCount(id: string): Observable<number> {
      return this.http.get<number>(this.path + '/secured/archives/archive/' + id + '/sales');
    }
}
