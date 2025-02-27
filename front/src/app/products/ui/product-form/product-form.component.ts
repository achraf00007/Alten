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
      <div class="flex justify-between gap-3">
        <div class="form-field w-full">
          <label class="text-black text-sm" for="name">Nom</label>
          <input class="h-10" pInputText
            type="text"
            id="name"
            name="name"
            [(ngModel)]="editedProduct().name"
            required>
        </div>
  
        <div class="form-field w-full">
          <label class="text-black text-sm" for="code">Code</label>
          <input class="h-10" pInputText
            type="text"
            id="code"
            name="code"
            [(ngModel)]="editedProduct().code"
            required>
        </div>
      </div>
      
      <div class="flex justify-between gap-3">
        

        <div class="form-field w-full">
          <label class="text-black text-sm" for="price">Prix</label>
          <p-inputNumber class="h-10"
            [(ngModel)]="editedProduct().price"
            name="price"
            mode="decimal"
            required />
        </div>

        <div class="form-field w-full">
          <label class="text-black text-sm" for="quantity">Quantité</label>
          <p-inputNumber class="h-10"
            [(ngModel)]="editedProduct().quantity"
            name="quantity"
            mode="decimal"
            required />
        </div>
      </div>

      <div class="form-field w-full">
          <label class="text-black text-sm" for="image">Image (URL)</label>
          <input class="h-10" pInputText
            type="text"
            id="image"
            name="image"
            [(ngModel)]="editedProduct().image">
        </div>

      <div class="flex justify-between gap-3">
        <div class="form-field w-full">
          <label class="text-black text-sm" for="shellId">ID de stockage</label>
          <p-inputNumber class="h-10"
            [(ngModel)]="editedProduct().shellId"
            name="shellId"
            mode="decimal"/>
        </div>  

        <div class="form-field w-full">
          <label class="text-black text-sm" for="internalReference">Référence interne</label>
          <input class="h-10" pInputText
            type="text"
            id="internalReference"
            name="internalReference"
            [(ngModel)]="editedProduct().internalReference">
        </div>
      </div>

        
      <div class="flex justify-between gap-3">
        <div class="form-field w-full">
          <label class="text-black text-sm" for="category">Catégorie</label>
          <p-dropdown class="h-10 mb-2"
            [options]="categories"
            [(ngModel)]="editedProduct().category"
            name="category"
            appendTo="body"
          />
        </div>

        <div class="form-field w-full">
          <label class="text-black text-sm" for="inventoryStatus">Statut du stock</label>
          <p-dropdown class="h-10 mb-2"
            [options]="inventoryStatuses"
            [(ngModel)]="editedProduct().inventoryStatus"
            name="inventoryStatus"
            appendTo="body"
          />
        </div>
      </div>

        <div class="form-field w-full">
          <label class="text-black text-sm" for="rating">Évaluation</label>
          <p-inputNumber class="h-10 mb-2"
            [(ngModel)]="editedProduct().rating"
            name="rating"
            mode="decimal"
            min="0"
            max="5"/>
        </div>

        <div class="form-field w-full md:col-span-2">
          <label class="text-black text-sm" for="description">Description</label>
          <textarea pInputTextarea
            id="description"
            name="description"
            rows="3"
            [(ngModel)]="editedProduct().description">
          </textarea>
        </div>

      <div class="flex justify-between gap-3 mt-4">
        <button class="w-full border border-black text-black rounded-lg p-2" type="button" (click)="onCancel()" severity="help">
          Annuler
        </button>
        <button class="w-full border bg-black text-white rounded-lg p-2 disabled:opacity-40 disabled:cursor-not-allowed" type="submit" [disabled]="!form.valid" severity="success">
          Enregistrer
        </button>
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

  public readonly categories: SelectItem[] = [
    { value: "Accessories", label: "Accessories" },
    { value: "Fitness", label: "Fitness" },
    { value: "Clothing", label: "Clothing" },
    { value: "Electronics", label: "Electronics" },
  ];

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
