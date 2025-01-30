import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "app/authentication/data-access/auth.service";
import { Product } from "app/products/data-access/product.model";
import { ProductsService } from "app/products/data-access/products.service";
import { UserService } from "app/user/data-access/user.service";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DataViewModule } from "primeng/dataview";
import { Subscription } from "rxjs";

@Component({
  selector: "app-bucket",
  standalone: true,
  imports: [DataViewModule, CardModule, ButtonModule],
  templateUrl: "./bucket.component.html",
  styleUrl: "./bucket.component.css",
})
export class BucketComponent implements OnInit, OnDestroy {
  public bucket: Product[] = [];
  public idUser: number = 0;
  public BucketSet: Product[] = [];
  public isBucketEmpty: boolean = true;

  public emptyMessage: string = "Votre panier est vide";

  public BucketSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private productService: ProductsService
  ) {}

  ngOnInit(): void {
    this.idUser = this.authService.getUserId();
    this.BucketSubscription = this.userService.bucketObservable.subscribe(
      (bucket) => {
        this.bucket = bucket;
        if (bucket.length > 0) {
          this.isBucketEmpty = false;
        }
        this.BucketSet = [
          ...new Map(bucket.map((product) => [product.id, product])).values(),
        ];
      }
    );
  }

  ngOnDestroy(): void {
    this.BucketSubscription?.unsubscribe();
  }

  // Méthode pour savoir combien de fois un produit a été mis dans le panier
  public getQuantityProduct(product: Product): number {
    const quantity: number = this.bucket.filter(
      (p) => p.id == product.id
    ).length;

    return quantity;
  }

  // Méthode pour supprimer un produit du panier
  public delete(product: Product): void {
    const index = this.bucket.findIndex((p) => p.id == product.id);
    this.bucket.splice(index, 1);
    this.userService.updateUser(this.idUser, this.bucket, null).subscribe();
    product.quantity++;
    this.productService.updateQuantity(product).subscribe();
  }
}
