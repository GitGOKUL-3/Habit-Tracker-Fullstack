
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = `${environment.apiUrl}/api/admin`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders() {
        const token = this.authService.getToken();
        return {
            headers: { 'Authorization': `Bearer ${token}` }
        };
    }

    getAllUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`, this.getHeaders());
    }

    getUserActivity(userId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users/${userId}/activity`, this.getHeaders());
    }
}
