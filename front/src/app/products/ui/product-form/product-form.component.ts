import {
  Component,
  computed,
  EventEmitter,
  input,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Product } from "app/products/data-access/product.model";
import { SelectItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: "app-product-form",
  template: `
    <form #form="ngForm" (ngSubmit)="onSave()">
      
        <div class="form-field w-full">
          <label for="name">Nom</label>
          <input pInputText
            type="text"
            id="name"
            name="name"
            [(ngModel)]="editedProduct().name"
            required>
        </div>

        <div class="form-field w-full">
          <label for="code">Code</label>
          <input pInputText
            type="text"
            id="code"
            name="code"
            [(ngModel)]="editedProduct().code"
            required>
        </div>

        <div class="form-field w-full">
          <label for="image">Image (URL)</label>
          <input pInputText
            type="text"
            id="image"
            name="image"
            [(ngModel)]="editedProduct().image">
        </div>

        <div class="form-field w-full">
          <label for="price">Prix</label>
          <p-inputNumber
            [(ngModel)]="editedProduct().price"
            name="price"
            mode="decimal"
            required />
        </div>

        <div class="form-field w-full">
          <label for="quantity">Quantité</label>
          <p-inputNumber
            [(ngModel)]="editedProduct().quantity"
            name="quantity"
            mode="decimal"
            required />
        </div>

        <div class="form-field w-full">
          <label for="internalReference">Référence interne</label>
          <input pInputText
            type="text"
            id="internalReference"
            name="internalReference"
            [(ngModel)]="editedProduct().internalReference">
        </div>

        <div class="form-field w-full">
          <label for="shellId">ID de stockage</label>
          <p-inputNumber
            [(ngModel)]="editedProduct().shellId"
            name="shellId"
            mode="decimal"/>
        </div>

        <div class="form-field w-full">
          <label for="category">Catégorie</label>
          <p-dropdown
            [options]="categories"
            [(ngModel)]="editedProduct().category"
            name="category"
            appendTo="body"
          />
        </div>

        <div class="form-field w-full">
          <label for="inventoryStatus">Statut du stock</label>
          <p-dropdown
            [options]="inventoryStatuses"
            [(ngModel)]="editedProduct().inventoryStatus"
            name="inventoryStatus"
            appendTo="body"
          />
        </div>

        <div class="form-field w-full">
          <label for="rating">Évaluation</label>
          <p-inputNumber
            [(ngModel)]="editedProduct().rating"
            name="rating"
            mode="decimal"
            min="0"
            max="5"/>
        </div>

        <div class="form-field w-full md:col-span-2">
          <label for="description">Description</label>
          <textarea pInputTextarea
            id="description"
            name="description"
            rows="3"
            [(ngModel)]="editedProduct().description">
          </textarea>
        </div>

      <div class="flex justify-between mt-4">
        <p-button type="button" (click)="onCancel()" label="Annuler" severity="help"/>
        <p-button type="submit" [disabled]="!form.valid" label="Enregistrer" severity="success"/>
      </div>
    </form>
  `,
  styleUrls: ["./product-form.component.scss"],
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    DropdownModule,
  ],
  encapsulation: ViewEncapsulation.None
})
export class ProductFormComponent {
  public readonly product = input.required<Product>();

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<Product>();

  public readonly editedProduct = computed(() => ({ ...this.product() }));

  // Catégories disponibles
  public readonly categories: SelectItem[] = [
    { value: "Accessories", label: "Accessories" },
    { value: "Fitness", label: "Fitness" },
    { value: "Clothing", label: "Clothing" },
    { value: "Electronics", label: "Electronics" },
  ];

  // Statuts de l'inventaire disponibles
  public readonly inventoryStatuses: SelectItem[] = [
    { value: "INSTOCK", label: "En stock" },
    { value: "LOWSTOCK", label: "Stock faible" },
    { value: "OUTOFSTOCK", label: "Rupture de stock" },
  ];

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.save.emit(this.editedProduct());
  }
}
