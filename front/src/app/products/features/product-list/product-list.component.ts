import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewEncapsulation, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Product } from "app/products/data-access/product.model";
import { ProductsService } from "app/products/data-access/products.service";
import { ProductFormComponent } from "app/products/ui/product-form/product-form.component";
import { CartService } from "app/shared/cart/cart.service";
import { MessageService, SelectItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from "primeng/dropdown";
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { AuthService } from "app/services/auth.service";

const emptyProduct: Product = {
  id: 0,
  code: "",
  name: "",
  description: "",
  image: "",
  category: "",
  price: 0,
  quantity: 0,
  internalReference: "",
  shellId: 0,
  inventoryStatus: "INSTOCK",
  rating: 0,
  createdAt: 0,
  updatedAt: 0,
};

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [DataViewModule, CardModule, TagModule, RatingModule, ButtonModule, DialogModule,DropdownModule, ProductFormComponent, CommonModule, ToastModule, FormsModule, TagModule],
  providers: [MessageService, ProductsService]
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly authService = inject(AuthService);
  
  private readonly cartService = inject(CartService);
  private readonly messageService = inject(MessageService);


  public readonly products = this.productsService.products;

  layout: string = 'list';

  sortOptions!: SelectItem[];
  sortOrder!: number;
  sortField!: string;
  sortKey!: string;

  public isDialogVisible = false;
  public isCreation = false;
  public readonly editedProduct = signal<Product>(emptyProduct);

  ngOnInit() {
    this.productsService.get().subscribe();

    this.sortOptions = [
      { label: 'Price High to Low', value: '!price' },
      { label: 'Price Low to High', value: 'price' }
    ];
  }

  public isAdmin(): boolean {
    return this.authService.getUserEmail() === "admin@admin.com";
  }

  public onCreate() {
    if (!this.isAdmin()) {
      this.messageService.add({
        severity: "error",
        summary: "Accès refusé",
        detail: "Vous n'avez pas l'autorisation d'ajouter un produit",
        life: 3000,
      });
      return;
    }
    
    this.isCreation = true;
    this.isDialogVisible = true;
    this.editedProduct.set(emptyProduct);
  }

  public onUpdate(product: Product) {
    if (!this.isAdmin()) {
      this.messageService.add({
          severity: "error",
          summary: "Accès refusé",
          detail: "Vous n'avez pas l'autorisation de modifier un produit",
          life: 3000,
      });
      return;
    }

    this.isCreation = false;
    this.isDialogVisible = true;
    this.editedProduct.set(product);
  }

  public onDelete(product: Product) {
    if (!this.isAdmin()) {
      this.messageService.add({
          severity: "error",
          summary: "Accès refusé",
          detail: "Vous n'avez pas l'autorisation de supprimer un produit",
          life: 3000,
      });
      return;
    }

    this.productsService.delete(product.id).subscribe(() => {
      this.messageService.add({
        severity: "success",
        summary: "Suppression réussie",
        detail: `Le produit "${product.name}" a été supprimé.`,
        life: 3000
      });
    });
  }

  public onSave(product: Product) {
    if (this.isCreation) {
      this.productsService.create(product).subscribe(() => {
        this.messageService.add({
          severity: "success",
          summary: "Ajout réussi",
          detail: `Le produit "${product.name}" a été ajouté.`,
          life: 3000
        });
        this.productsService.get().subscribe();
      });
    } else {
      this.productsService.update(product).subscribe(() => {
        this.messageService.add({
          severity: "success",
          summary: "Mise à jour réussie",
          detail: `Le produit "${product.name}" a été mis à jour.`,
          life: 3000
        });
        this.productsService.get().subscribe();
      });
    }
    this.closeDialog();
  }

  public onCancel() {
    this.closeDialog();
  }

  private closeDialog() {
    this.isDialogVisible = false;
  }

  public onAddToCart(product: Product) {
    this.cartService.addToCart(product);
    this.messageService.add({
      severity: "success",
      summary: "Produit ajouté",
      detail: `${product.name} a été ajouté au panier`,
      life: 3000,
    });
  }

  onSortChange(event: any) {
    let value = event.value;

    if (value.indexOf('!') === 0) {
        this.sortOrder = -1;
        this.sortField = value.substring(1, value.length);
    } else {
        this.sortOrder = 1;
        this.sortField = value;
    }
}

getSeverity(item: any): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    switch (item.inventoryStatus) {
        case 'INSTOCK':
            return 'success';
        case 'LOWSTOCK':
            return 'warning';
        case 'OUTOFSTOCK':
            return 'danger';
        default:
            return undefined;
    }
}
  
}
