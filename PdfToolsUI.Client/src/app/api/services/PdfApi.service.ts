import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap, toArray } from "rxjs";
import { environment } from "../../environments/environment";
import { ITools } from "./models/tools";

@Injectable({
    providedIn: "root"
})

export class PdfApiService {
    private apiUrl: string = `${environment.apiUrl}/api/PdfTools`;

    constructor(private http: HttpClient) { }

    getAllTools(): Observable<ITools[]> {
        return this.http.get<ITools[]>(`${this.apiUrl}/getalltools`);
    }

    mergePdfFiles(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/merge`,
            formData,
            {
                responseType: "blob"
            }
        );
    }
}