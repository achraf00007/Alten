import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "app/services/auth.service";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from "primeng/divider";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
  standalone: true,
  imports: [CommonModule, DividerModule, ButtonModule, InputTextModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      username: ["", [Validators.required, Validators.minLength(3)]],
      firstname: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  get username() {
    return this.registerForm.get("username");
  }

  get firstname() {
    return this.registerForm.get("firstname");
  }

  get email() {
    return this.registerForm.get("email");
  }

  get password() {
    return this.registerForm.get("password");
  }

  goToLogin() {
    this.router.navigate(["/login"]);
  }

  register() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.messageService.add({ severity: "warn", summary: "Validation", detail: "Veuillez remplir correctement les champs" });
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: "success", summary: "Succès", detail: "Inscription réussie!" });
        setTimeout(() => this.router.navigate(["/login"]), 2000);
      },
      error: () => {
        this.messageService.add({ severity: "error", summary: "Erreur", detail: "Erreur lors de l'inscription. Essayez un autre email." });
      },
    });
  }
}
