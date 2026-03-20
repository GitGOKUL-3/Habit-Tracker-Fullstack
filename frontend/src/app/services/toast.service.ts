import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastSubject = new Subject<Toast>();
    toast$ = this.toastSubject.asObservable();

    show(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
        const id = Date.now();
        this.toastSubject.next({ message, type, id });
    }
}
