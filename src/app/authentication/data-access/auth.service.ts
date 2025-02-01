import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoginDto } from "./login-dto";
import { BehaviorSubject, catchError, Observable, tap, throwError } from "rxjs";
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

  private userEmailSubject = new BehaviorSubject<string>(this.getUserEmail());
  public userEmailObservable = this.userEmailSubject.asObservable();

  constructor() {}

  // Méthode pour savoir si l'utilisateur est connecté
  public isAuth(): boolean {
    return !!localStorage.getItem("token");
  }

  // Méthode pour savoir si l'utilisateur connecté est admin
  public isAdminLogin(): boolean {
    const email = this.getUserEmail();

    if (email == "admin@admin.com") {
      return true;
    } else {
      return false;
    }
  }

  // Méthode pour se connecter
  public login(loginDto: LoginDto): Observable<ResponseLoginDto> {
    return this.http
      .post<ResponseLoginDto>(`${this.path}/token`, loginDto)
      .pipe(
        tap((response: ResponseLoginDto) => {
          localStorage.setItem("token", response.token);
          this.isAuthSubject.next(this.isAuth());
          this.isAdminLoginSubject.next(this.isAdminLogin());
          this.userEmailSubject.next(this.getUserEmail());
        })
      );
  }

  // Méthode pour se déconnecter
  public logout() {
    localStorage.removeItem("token");
    this.isAuthSubject.next(this.isAuth());
    this.isAdminLoginSubject.next(this.isAdminLogin());
    this.userEmailSubject.next("");
  }

  // Méthode pour créer un compte
  public register(user: User): Observable<User> {
    return this.http.post<User>(`${this.path}/account`, user).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.error));
      })
    );
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

  // Méthode pour avoir l'email de l'utilisateur
  public getUserEmail(): string {
    // Récupération du token dans le local storage
    const token = localStorage.getItem("token");

    if (!token) {
      return "L'utilisateur n'est pas connecté";
    }

    try {
      // Décodage du token
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));

      // Retourne le subject du token (soit l'adresse mail)
      return tokenPayload.sub;
    } catch (error) {
      return "Erreur lors du décodage du token : " + error;
    }
  }
}
