import { Component } from "@angular/core";
import { MenuItem } from "primeng/api";
import { PanelMenuModule } from "primeng/panelmenu";
import { AuthService } from "app/services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-panel-menu",
  standalone: true,
  imports: [PanelMenuModule],
  template: `
    <p-panelMenu [model]="items" styleClass="w-full" />
  `,
})
export class PanelMenuComponent {
  public items: MenuItem[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.items = [
      {
        label: "Accueil",
        icon: "pi pi-home",
        routerLink: ["/home"],
      },
      {
        label: "Produits",
        icon: "pi pi-th-large",
        routerLink: ["/products/list"],
      },
      {
        label: "Contact",
        icon: "pi pi-envelope",
        routerLink: ["/contact"],
      }
    ];
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
