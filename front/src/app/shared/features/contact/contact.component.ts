import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { HttpClient } from "@angular/common/http";
import { ToastModule } from "primeng/toast";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-contact",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"],
  standalone: true,
  imports: [FormsModule, ToastModule, CommonModule, ReactiveFormsModule],
  providers: [MessageService]
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  public contactForm: FormGroup;

  constructor() {
    this.contactForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      message: ["", [Validators.required, Validators.maxLength(300)]],
    });
  }

  get email() {
    return this.contactForm.get("email");
  }

  get message() {
    return this.contactForm.get("message");
  }

  public formSubmitted = false;

onSubmit() {
  this.formSubmitted = true;

  if (this.contactForm.invalid) {
    return;
  }

  const formData = this.contactForm.value;

  this.http.post("http://localhost:5000/send-email", formData).subscribe({
    next: () => {
      this.messageService.add({
        severity: "success",
        summary: "Succès",
        detail: "Demande de contact envoyée avec succès",
        life: 3000
      });

      this.contactForm.reset();
      this.formSubmitted = false;
    },
    error: () => {
      this.messageService.add({
        severity: "error",
        summary: "Erreur",
        detail: "Une erreur s'est produite, réessayez plus tard.",
        life: 3000
      });
    }
  });
}
}
