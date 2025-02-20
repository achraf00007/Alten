import { Injectable, signal } from "@angular/core";
import { Product } from "app/products/data-access/product.model";

@Injectable({
  providedIn: "root",
})
export class CartService {
  
  public cart = signal<{ product: Product; quantity: number }[]>([]);

  
  public addToCart(product: Product) {
    let currentCart = this.cart();

    let existingItem = currentCart.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ product, quantity: 1 });
    }

    this.cart.set([...currentCart]);
  }

  
  public decreaseQuantity(productId: number) {
    let currentCart = this.cart().map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });

    
    this.cart.set(currentCart.filter(item => item.quantity > 0));
  }

  public removeFromCart(productId: number) {
    this.cart.set(this.cart().filter(item => item.product.id !== productId));
  }

  public getCartCount() {
    return this.cart().reduce((total, item) => total + item.quantity, 0);
  }

  public getTotalPrice() {
    return this.cart().reduce((total, item) => total + item.product.price * item.quantity, 0);
  }
}
