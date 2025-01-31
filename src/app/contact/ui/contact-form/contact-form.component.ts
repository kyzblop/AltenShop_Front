import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "app/authentication/data-access/auth.service";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { Subscription } from "rxjs";

@Component({
  selector: "app-contact-form",
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, InputTextareaModule],
  templateUrl: "./contact-form.component.html",
  styleUrl: "./contact-form.component.css",
})
export class ContactFormComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription | null = null;
  public emailUser: string = "";
  public message: string = "";
  public isMessageSend: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.userEmailObservable.subscribe(
      (email) => {
        this.emailUser = email;
      }
    );
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  onSubmit() {
    this.isMessageSend = true;
    setTimeout(() => {
      this.isMessageSend = false;
    }, 2000);

    this.message = "";
  }
}
