import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SplitterModule } from "primeng/splitter";
import { ToolbarModule } from "primeng/toolbar";
import { PanelMenuComponent } from "./shared/ui/panel-menu/panel-menu.component";
import { ButtonModule } from "primeng/button";
import { AuthService } from "./authentication/data-access/auth.service";
import { DialogModule } from "primeng/dialog";
import { LoginFormComponent } from "./authentication/ui/login-form/login-form.component";
import { RegisterFormComponent } from "./authentication/ui/register-form/register-form.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [
    RouterModule,
    SplitterModule,
    ToolbarModule,
    PanelMenuComponent,
    ButtonModule,
    DialogModule,
    LoginFormComponent,
    RegisterFormComponent,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "ALTEN SHOP";

  isDialogLoginVisible: boolean = false;
  isDialogRegisterVisible: boolean = false;
  isLogin: boolean = false;
  authSubscription: Subscription | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isAuthObservable.subscribe(
      (authStatus) => {
        this.isLogin = authStatus;
      }
    );
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  public login() {
    this.isDialogLoginVisible = true;
  }

  public register() {
    this.isDialogRegisterVisible = true;
  }

  public closeDialog() {
    this.isDialogLoginVisible = false;
    this.isDialogRegisterVisible = false;
  }

  public logout() {
    this.authService.logout();
  }
}
