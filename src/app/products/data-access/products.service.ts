import { Injectable, inject, signal } from "@angular/core";
import { Product } from "./product.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  tap,
  throwError,
} from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiPath = "http://localhost:8080";
  private readonly path = this.apiPath + "/products";

  // private readonly _products = signal<Product[]>([]);
  // public readonly products = this._products.asReadonly();

  private productSubject = new BehaviorSubject<Product[]>([]);
  public productObservable = this.productSubject.asObservable();

  constructor() {
    this.get().subscribe();
  }

  // Recupération de la liste de produits depuis la BDD
  public get(): Observable<Product[]> {
    return this.http.get<Product[]>(this.path).pipe(
      tap((products) => {
        this.productSubject.next(products);
      })
    );
  }

  // Créer un produit
  public create(product: Product): Observable<string> {
    // Récupération du token
    const token = localStorage.getItem("token");

    if (!token) {
      return throwError("Token manquant");
    }

    // Paramétrage du token en tant qu'autorisation
    const headers = new HttpHeaders()
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    return this.http
      .post<string>(this.path, product, {
        headers: headers,
        observe: "response",
      })
      .pipe(
        tap((response: any) => {
          console.log("Statut HTTP : " + response.status);
          this.get().subscribe();
        })
      );
  }

  // Modification du produit
  public update(product: Product): Observable<string> {
    // Récupération du token
    const token = localStorage.getItem("token");

    if (!token) {
      return throwError("Token manquant");
    }

    // Paramétrage du token en tant qu'autorisation
    const headers = new HttpHeaders()
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    return this.http
      .patch<boolean>(`${this.path}/${product.id}`, product, {
        headers: headers,
        observe: "response",
      })
      .pipe(
        tap((response: any) => {
          console.log("Statut HTTP : " + response.status);
          this.get().subscribe();
        })
      );
  }

  public delete(productId: number): Observable<string> {
    // Récupération du token
    const token = localStorage.getItem("token");

    if (!token) {
      return throwError("Token manquant");
    }

    // Paramétrage du token en tant qu'autorisation
    const headers = new HttpHeaders()
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    return this.http
      .delete<string>(`${this.path}/${productId}`, {
        headers: headers,
        observe: "response",
      })
      .pipe(
        tap((response: any) => {
          console.log("Statut HTTP : " + response.status);
          this.get().subscribe();
        })
      );
  }
}
