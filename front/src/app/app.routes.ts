import { Routes } from "@angular/router";
import { HomeComponent } from "./shared/features/home/home.component";
import { ContactComponent } from "./shared/features/contact/contact.component";
import { LoginComponent } from "./shared/features/auth/login.component";
import { LayoutComponent } from "./layout/layout.component";
import { RegisterComponent } from "./shared/features/auth/register.component";

export const APP_ROUTES: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "home",
        component: HomeComponent,
      },
      {
        path: "products",
        loadChildren: () =>
          import("./products/products.routes").then((m) => m.PRODUCTS_ROUTES)
      },
      { path: "contact", component: ContactComponent },
      { path: "", redirectTo: "home", pathMatch: "full" },
    ]
  },
  { path: "**", redirectTo: "home"},
];
