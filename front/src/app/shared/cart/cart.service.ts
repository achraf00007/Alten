import { Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Product } from "app/products/data-access/product.model";

@Injectable({
  providedIn: "root",
})
export class CartService {
  private apiUrl = "http://localhost:5000/api/cart"; 
  public cart = signal<{ product: Product; quantity: number }[]>([]);
  public totalPrice = signal<number>(0);

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    return new HttpHeaders({
      "Authorization": token ? `Bearer ${token}` : "",
      "Content-Type": "application/json"
    });
  }

  public loadCart() {
    this.http.get<{ cart: { product: Product; quantity: number }[], totalPrice: number }>(this.apiUrl, { headers: this.getAuthHeaders() })
      .subscribe(response => {
        if (response && Array.isArray(response.cart)) {
            this.cart.set(response.cart);
            this.totalPrice.set(response.totalPrice);
        } else {
            this.cart.set([]);
            this.totalPrice.set(0);
        }
      }, error => {
        console.error("Erreur lors du chargement du panier", error);
        this.cart.set([]);
        this.totalPrice.set(0);
      });
  }

  public addToCart(product: Product) {
    this.http.post(this.apiUrl, { id: product.id, quantity: 1 }, { headers: this.getAuthHeaders() })
      .subscribe(() => {
        this.loadCart();
      }, error => {
        console.error("Erreur lors de l'ajout au panier", error);
      });
  }

  public decreaseQuantity(productId: number) {
    let existingItem = this.cart().find(item => item.product.id === productId);

    if (existingItem && existingItem.quantity > 1) {
      this.updateCartItem(productId, existingItem.quantity - 1);
    } else {
      this.removeFromCart(productId);
    }
  }

  public updateCartItem(productId: number, quantity: number) {
    this.http.patch(`${this.apiUrl}/${productId}`, { quantity }, { headers: this.getAuthHeaders() })
      .subscribe(() => {
        this.loadCart();
      }, error => {
        console.error("Erreur lors de la mise à jour", error);
      });
  }

  public removeFromCart(productId: number) {
    this.http.delete(`${this.apiUrl}/${productId}`, { headers: this.getAuthHeaders() })
      .subscribe(() => {
        this.loadCart();
      }, error => {
        console.error("Erreur lors de la suppression", error);
      });
  }

  public getCartCount() {
    const cartItems = this.cart();

    if (!Array.isArray(cartItems)) {
        console.warn("Panier non valide détecté, initialisation à un tableau vide.");
        return 0;
    }

    return cartItems.reduce((total, item) => total + item.quantity, 0);
}

  public getTotalPrice() {
    return this.cart().reduce((total, item) => total + item.product.price * item.quantity, 0);
  }
}
