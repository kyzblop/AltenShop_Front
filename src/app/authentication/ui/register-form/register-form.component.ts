import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "app/authentication/data-access/auth.service";
import { LoginDto } from "app/authentication/data-access/login-dto";
import { User } from "app/user/data-access/user.model";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "app-register-form",
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: "./register-form.component.html",
  styleUrl: "./register-form.component.css",
})
export class RegisterFormComponent {
  public user: User = {
    email: "",
    firstName: "",
    username: "",
    id: 0,
    password: "",
    panierAchat: [],
    listEnvie: [],
  };

  isEmailAlreadyUsed: boolean = false;

  @Output() onRegister = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  public onSubmit() {
    this.authService.register(this.user).subscribe({
      next: (user) => {
        this.authService.login(new LoginDto(user.email, user.password));
        this.onRegister.emit();
      },
      error: (error) => {
        this.isEmailAlreadyUsed = true;
      },
    });
  }
}
