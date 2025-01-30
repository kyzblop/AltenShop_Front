import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoginDto } from "./login-dto";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { ResponseLoginDto } from "./response-login-dto";
import { User } from "../../user/data-access/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiPath = "http://localhost:8080";
  private readonly path = this.apiPath + "/auth";

  private isAuthSubject = new BehaviorSubject<boolean>(this.isAuth());
  public isAuthObservable = this.isAuthSubject.asObservable();

  private isAdminLoginSubject = new BehaviorSubject<boolean>(
    this.isAdminLogin()
  );
  public isAdminLoginObservable = this.isAdminLoginSubject.asObservable();

  constructor() {
    this.checkLocalStorage();
  }

  // Méthode pour savoir si l'utilisateur est connecté
  public isAuth(): boolean {
    if (window.localStorage) {
      return !!localStorage.getItem("token");
    } else {
      return false;
    }
  }

  // Méthode pour savoir si l'utilisateur connecté est admin
  public isAdminLogin(): boolean {
    // Récupération du token dans le local storage
    const token = localStorage.getItem("token");

    if (!token) {
      return false;
    }

    try {
      // Décodage du token
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));

      // Si le subject du token est l'adresse mail admin alors l'utilisateur est admin
      if (tokenPayload.sub == "admin@admin.com") {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Erreur lors du décodage du token : " + error);
      return false;
    }
  }

  // Méthode pour regarder si le token change et mettre à jour l'information d'authentification s'il change
  public checkLocalStorage() {
    window.addEventListener("storage", (event) => {
      if (event.key === "token") {
        this.isAuthSubject.next(this.isAuth());
        this.isAdminLoginSubject.next(this.isAdminLogin());
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
          this.isAuthSubject.next(this.isAuth());
          this.isAdminLoginSubject.next(this.isAdminLogin());
        })
      );
  }

  // Méthode pour se déconnecter
  public logout() {
    localStorage.removeItem("token");
    this.isAuthSubject.next(this.isAuth());
    this.isAdminLoginSubject.next(this.isAdminLogin());
  }

  // Méthode pour créer un compte
  public register(user: User): Observable<User> {
    return this.http.post<User>(this.path + "/account", user);
  }

  public getUserId(): number {
    // Récupération du token dans le local storage
    const token = localStorage.getItem("token");

    if (!token) {
      return 0;
    }

    try {
      // Decoder le token
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      // Retourner l'id de l'utilisateur du token ou -1 s'il n'existe pas
      return tokenPayload.idUser || -1;
    } catch (error) {
      console.error("Erreur de décodage du token : " + error);
      return -1;
    }
  }
}
