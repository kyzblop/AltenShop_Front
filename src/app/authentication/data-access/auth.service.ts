import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoginDto } from "./login-dto";
import { BehaviorSubject, catchError, Observable, tap } from "rxjs";
import { ResponseLoginDto } from "./response-login-dto";
import { User } from "./user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiPath = "http://localhost:8080";
  private readonly path = this.apiPath + "/auth";

  private isAuthSubject = new BehaviorSubject<boolean>(this.isAuth());
  public isAuthObservable = this.isAuthSubject.asObservable();

  constructor() {
    this.checkLocalStorage();
  }

  // Méthode pour savoir si l'utilisateur est connecté
  public isAuth() {
    if (window.localStorage) {
      return !!localStorage.getItem("token");
    } else {
      return false;
    }
  }

  // Méthode pour regarder si le token change et mettre à jour l'onformation d'authentification s'il change
  public checkLocalStorage() {
    window.addEventListener("storage", (event) => {
      if (event.key === "token") {
        this.isAuthSubject.next(this.isAuth());
      }
    });
  }

  // Méthode pour se connecter
  public login(loginDto: LoginDto): Observable<ResponseLoginDto> {
    return this.http
      .post<ResponseLoginDto>(this.path + "/token", loginDto)
      .pipe(
        tap((response: ResponseLoginDto) => {
          localStorage.setItem("token", response.token);
          this.isAuthSubject.next(true);
        })
      );
  }

  // Méthode pour se déconnecter
  public logout() {
    localStorage.removeItem("token");
    this.isAuthSubject.next(false);
  }

  // Méthode pour créer un compte
  public register(user: User): Observable<User> {
    return this.http.post<User>(this.path + "/account", user);
  }
}
