import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "app/authentication/data-access/auth.service";
import { LoginDto } from "app/authentication/data-access/login-dto";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "app-login-form",
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: "./login-form.component.html",
  styleUrl: "./login-form.component.css",
})
export class LoginFormComponent {
  public loginDto: LoginDto = { email: "", password: "" };

  public isErrorLogin: boolean = false;

  @Output() onLogin = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  public onSubmit() {
    this.authService.login(this.loginDto).subscribe({
      next: () => {
        console.log("Connexion réussie");
        this.onLogin.emit();
        this.isErrorLogin = false;
      },
      error: (err) => {
        this.isErrorLogin = true;
      },
    });
  }
}
