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
  public create(product: Product): Observable<Product> {
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
      .post<Product>(this.path, product, {
        headers: headers,
      })
      .pipe(
        tap((newProduct: Product) => {
          const updatedProducts = [...this.productSubject.value, newProduct];
          this.productSubject.next(updatedProducts);
        })
      );
  }

  // Modification du produit
  public update(product: Product): Observable<Product> {
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
      .patch<Product>(`${this.path}/${product.id}`, product, {
        headers: headers,
      })
      .pipe(
        tap((updatedProduct: Product) => {
          const updatedProducts = this.productSubject.value.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          );
          this.productSubject.next(updatedProducts);
        })
      );
  }

  // Modification de la quantité d'un produit
  public updateQuantity(product: Product): Observable<Product> {
    return this.http
      .patch<Product>(`${this.path}/${product.id}/quantity`, product.quantity)
      .pipe(
        tap((updatedProduct) => {
          const updatedProducts = this.productSubject.value.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          );
          this.productSubject.next(updatedProducts);
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
          const updatedProducts = this.productSubject.value.filter(
            (product) => product.id !== productId
          );
          this.productSubject.next(updatedProducts);
        })
      );
  }
}
