import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "app/services/auth.service";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  standalone: true,
  imports: [CommonModule, DividerModule, ButtonModule, InputTextModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.loginForm.get("email");
  }

  get password() {
    return this.loginForm.get("password");
  }

  goToRegister() {
    this.router.navigate(["/register"]);
  }

  login() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.messageService.add({ severity: "warn", summary: "Validation", detail: "Veuillez remplir correctement les champs" });
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.messageService.add({ severity: "success", summary: "Succès", detail: "Connexion réussie!" });
        setTimeout(() => this.router.navigate(["/home"]), 1500);
      },
      error: () => {
        this.messageService.add({ severity: "error", summary: "Erreur", detail: "Identifiants incorrects!" });
      },
    });
  }
}
