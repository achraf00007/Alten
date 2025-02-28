import {
    Component,
    effect,
    inject,
    signal,
    ViewEncapsulation,
  } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { SplitterModule } from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from "@angular/common";
import { DialogModule } from "primeng/dialog";
import { SidebarModule } from 'primeng/sidebar';
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { ReactiveFormsModule } from "@angular/forms";
import { PanelMenuComponent } from "app/shared/ui/panel-menu/panel-menu.component";
import { CartService } from "app/shared/cart/cart.service";
import { AuthService } from "app/services/auth.service";
import { WishlistService } from "app/services/wishlist.service";

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.scss"],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [RouterModule, SidebarModule, ToastModule, SplitterModule, ReactiveFormsModule, ToolbarModule, PanelMenuComponent, CommonModule, DialogModule, ButtonModule],
  providers: [MessageService]
})
export class LayoutComponent {
  title = "ALTEN SHOP";

  dropdownVisible = false;

  private readonly messageService = inject(MessageService);


  private readonly wishlistService = inject(WishlistService);
  public isWishlistSidebarVisible = signal(false);
  public wishlist = this.wishlistService.wishlist;

  public wishlistCount = signal(0);


  private readonly cartService = inject(CartService);
  public isCartSidebarVisible  = signal(false);
  private readonly cart_service = inject(CartService);
  public cart = this.cartService.cart;


  public cartCount = signal(0);

  constructor(private authService: AuthService, private router: Router) {
    effect(() => {
      this.cartCount.set(this.cart_service.getCartCount());
      this.wishlistCount.set(this.wishlistService.wishlist().length);
    }, { allowSignalWrites: true });
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  getUsername(): string {
    return this.authService.getUsername() ?? '';
  }

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  goToLogin() {
    this.router.navigate(["/login"]);
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

  public toggleWishlistSidebar() {
    this.isWishlistSidebarVisible.set(!this.isWishlistSidebarVisible());
  }

  public removeFromWishlist(productId: number) {
      this.wishlistService.removeFromWishlist(productId);
  }
}
