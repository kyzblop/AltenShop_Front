import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Product } from "app/products/data-access/product.model";
import { User } from "./user.model";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { AuthService } from "app/authentication/data-access/auth.service";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiPath = "http://localhost:8080";
  private readonly path = this.apiPath + "/users";

  private bucketSubject = new BehaviorSubject<Product[]>([]);
  public bucketObservable = this.bucketSubject.asObservable();

  private wantedListSubject = new BehaviorSubject<Product[]>([]);
  public wantedListObservable = this.wantedListSubject.asObservable();

  constructor(private authService: AuthService) {
    const userId = authService.getUserId();
    if (userId != null) {
      this.getBucketByIdUser(this.authService.getUserId()).subscribe();
      this.getWantedListByIdUser(this.authService.getUserId()).subscribe();
    }
  }

  // Méthode pour avoir le panier de l'utilisateur connecté
  public getBucketByIdUser(idUser: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.path}/${idUser}/panier`).pipe(
      tap((products) => {
        this.bucketSubject.next(products);
      })
    );
  }

  // Méthode pour avoir la liste d'envie de l'utilisateur connecté
  public getWantedListByIdUser(idUser: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.path}/${idUser}/listeEnvie`).pipe(
      tap((products) => {
        this.wantedListSubject.next(products);
      })
    );
  }

  // Méthode pour mettre à jour les listes
  public updateUser(
    idUser: number,
    bucket: Product[] | null,
    wantedList: Product[] | null
  ): Observable<User> {
    const user = new User(idUser, "", "", "", "", bucket, wantedList);
    return this.http
      .patch<User>(`${this.path}/${idUser}/modification`, user)
      .pipe(
        tap((updatedUser) => {
          if (updatedUser.panierAchat) {
            this.bucketSubject.next(updatedUser.panierAchat);
          }
          if (updatedUser.listEnvie) {
            this.wantedListSubject.next(updatedUser.listEnvie);
          }
        })
      );
  }
}
