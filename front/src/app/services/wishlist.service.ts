import { Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Product } from "app/products/data-access/product.model";
import { environment } from "environments/environment";

@Injectable({
  providedIn: "root",
})
export class WishlistService {
  private apiUrl = `${environment.apiUrl}/wishlist`;
  public wishlist = signal<{ product: Product }[]>([]);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    return new HttpHeaders({
      "Authorization": token ? `Bearer ${token}` : "",
      "Content-Type": "application/json"
    });
  }

  public loadWishlist() {
    this.http.get<{ wishlist: { id: number, product: Product }[] }>(this.apiUrl, { headers: this.getAuthHeaders() })
      .subscribe(response => {
        if (response && Array.isArray(response.wishlist)) {
            this.wishlist.set(response.wishlist);
        } else {
            this.wishlist.set([]);
        }
      }, error => {
        console.error("Erreur lors du chargement de la wishlist", error);
        this.wishlist.set([]);
      });
}


  public addToWishlist(product: Product) {
    this.http.post(this.apiUrl, { id: product.id }, { headers: this.getAuthHeaders() })
      .subscribe(() => {
        this.wishlist.set([...this.wishlist(), { product }]);
      }, error => {
        console.error("Erreur lors de l'ajout à la wishlist", error);
      });
  }

  public removeFromWishlist(productId: number) {
    this.http.delete(`${this.apiUrl}/${productId}`, { headers: this.getAuthHeaders() })
      .subscribe(() => {
        this.wishlist.set(this.wishlist().filter(item => item.product.id !== productId));
      }, error => {
        console.error("Erreur lors de la suppression de la wishlist", error);
      });
  }

  public resetWishlist() {
    this.wishlist.set([]);
  }
}
