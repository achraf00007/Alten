import {
  Component,
  effect,
  inject,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { SplitterModule } from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelMenuComponent } from "./shared/ui/panel-menu/panel-menu.component";
import { CartService } from "./shared/cart/cart.service";
import { CommonModule } from "@angular/common";
import { DialogModule } from "primeng/dialog";
import { SidebarModule } from 'primeng/sidebar';
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { ReactiveFormsModule } from "@angular/forms";


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [RouterModule, SidebarModule, ToastModule, SplitterModule, ReactiveFormsModule, ToolbarModule, PanelMenuComponent, CommonModule, DialogModule, ButtonModule],
  providers: [MessageService]
})
export class AppComponent {
  title = "ALTEN SHOP";
  private readonly messageService = inject(MessageService);


  private readonly cartService = inject(CartService);
  public isCartSidebarVisible  = signal(false);
  private readonly cart_service = inject(CartService);
  public cart = this.cartService.cart;


  public cartCount = signal(0);

  constructor() {
    effect(() => {
      this.cartCount.set(this.cart_service.getCartCount());
    }, { allowSignalWrites: true });
  }

  public openCart() {
    this.isCartSidebarVisible .set(true);
  }
  
  public addToCart(product: any) {
    this.cartService.addToCart(product);
  }

  public decreaseQuantity(productId: number, productName: string) {
    let currentCart = this.cart();
    let product = currentCart.find(item => item.product.id === productId);

    if (product && product.quantity === 1) {
      this.cartService.removeFromCart(productId);
      this.messageService.add({
        severity: "info",
        summary: "Produit retiré",
        detail: `${productName} a été retiré du panier`,
        life: 3000,
      });
    } else {
      this.cartService.decreaseQuantity(productId);
    }
  }

  public removeFromCart(productId: any, productName: any) {
    this.cartService.removeFromCart(productId);
    this.messageService.add({
      severity: "info",
      summary: "Produit retiré",
      detail: `${productName} a été retiré du panier`,
      life: 3000,
    });
  }

  public getTotalPrice() {
    return this.cartService.getTotalPrice();
  }

}
