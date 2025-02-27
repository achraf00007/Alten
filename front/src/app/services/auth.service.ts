import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { jwtDecode } from "jwt-decode";
import { environment } from "environments/environment";
import { CartService } from "app/shared/cart/cart.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {

  constructor(private http: HttpClient, private cartService: CartService) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return new Observable(observer => {
      this.http.post<{ token: string }>(`${environment.apiUrl}/token`, credentials).subscribe(response => {
        if (response.token) {
          this.saveToken(response.token);
          this.loadUserCart();
        }
        observer.next(response);
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  register(userData: { username: string; firstname: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/account`, userData);
  }

  logout() {
    localStorage.removeItem("token");
  }

  saveToken(token: string) {
    localStorage.setItem("token", token);
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      return Date.now() < decoded.exp * 1000;
    } catch (error) {
      return false;
    }
  }

  getUsername(): string | undefined {
    const token = this.getToken();
    if (!token) return undefined;

    try {
      return (jwtDecode(token) as any).username;
    } catch (error) {
      return undefined;
    }
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return (jwtDecode(token) as any).email;
    } catch (error) {
      return null;
    }
  }

  private loadUserCart() {
    this.cartService.loadCart();
  }
}
