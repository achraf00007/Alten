import { Injectable, inject, signal } from "@angular/core";
import { Product } from "./product.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, Observable, of, tap } from "rxjs";
import { environment } from "environments/environment";
import { AuthService } from "app/services/auth.service";

@Injectable({
    providedIn: "root"
})
export class ProductsService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly path = `${environment.apiUrl}/products`;

    private readonly _products = signal<Product[]>([]);
    public readonly products = this._products.asReadonly();

    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    public get(): Observable<Product[]> {
        return this.http.get<Product[]>(this.path, { headers: this.getAuthHeaders() }).pipe(
            catchError((error) => {
                console.error("Erreur de récupération des produits:", error);
                return this.http.get<Product[]>("assets/products.json");
            }),
            tap((products) => this._products.set(products))
        );
    }

    public create(product: Product): Observable<Product> {
        return this.http.post<Product>(this.path, product, { headers: this.getAuthHeaders() }).pipe(
            catchError((error) => {
                console.error("Erreur d'ajout du produit:", error);
                return of(product);
            }),
            tap((newProduct) => this._products.update(products => [newProduct, ...products]))
        );
    }

    public update(product: Product): Observable<Product> {
        return this.http.patch<Product>(`${this.path}/${product.id}`, product, { headers: this.getAuthHeaders() }).pipe(
            catchError((error) => {
                console.error("Erreur de mise à jour du produit:", error);
                return of(product);
            }),
            tap((updatedProduct) => this._products.update(products =>
                products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
            ))
        );
    }

    public delete(productId: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.path}/${productId}`, { headers: this.getAuthHeaders() }).pipe(
            catchError((error) => {
                console.error("Erreur de suppression du produit:", error);
                return of(true);
            }),
            tap(() => this._products.update(products => products.filter(product => product.id !== productId)))
        );
    }
}
