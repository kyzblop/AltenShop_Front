import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "app/authentication/data-access/auth.service";
import { Product } from "app/products/data-access/product.model";
import { ProductsService } from "app/products/data-access/products.service";
import { ProductFormComponent } from "app/products/ui/product-form/product-form.component";
import { UserService } from "app/user/data-access/user.service";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DataViewModule } from "primeng/dataview";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { Observable, Subscription, tap } from "rxjs";

const emptyProduct: Product = {
  id: 0,
  code: "",
  name: "",
  description: "",
  image: "",
  category: "",
  price: 0,
  quantity: 0,
  internalReference: "",
  shellId: 0,
  inventoryStatus: "INSTOCK",
  rating: 0,
  createdAt: 0,
  updatedAt: 0,
};

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
  standalone: true,
  imports: [
    DataViewModule,
    CardModule,
    ButtonModule,
    DialogModule,
    ProductFormComponent,
    InputTextModule,
    DropdownModule,
    FormsModule,
  ],
})
export class ProductListComponent implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);

  public products: Product[] = [];

  public isDialogVisible: boolean = false;
  public isCreation: boolean = false;
  public isAdmin: boolean = false;
  public readonly editedProduct = signal<Product>(emptyProduct);

  public isLogin: boolean = false;
  public authSubscription: Subscription | null = null;
  public isAdminLoginSubscription: Subscription | null = null;
  public productSubscription: Subscription | null = null;

  public bucket: Product[] = [];
  public wantedList: Product[] = [];
  public idUser: number = 0;

  public categories: string[] = [
    "Toutes categories",
    "Accessoires",
    "Fitness",
    "Vêtements",
    "Electronique",
  ];
  public wordSearched: string = "";
  public categorySelected: string = "Toutes categories";

  public productListFiltered: Product[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.productSubscription = this.productsService.productObservable.subscribe(
      (products) => {
        this.products = products;
        this.productListFiltered = products;
      }
    );

    this.isAdminLoginSubscription =
      this.authService.isAdminLoginObservable.subscribe((isAdminStatus) => {
        this.isAdmin = isAdminStatus;
      });

    this.authSubscription = this.authService.isAuthObservable.subscribe(
      (authStatus) => {
        this.isLogin = authStatus;
        this.idUser = this.authService.getUserId();
        if (this.isLogin) {
          this.userService.bucketObservable.subscribe((bucket) => {
            if (bucket != null) {
              this.bucket = bucket;
            }
          });

          this.userService.wantedListObservable.subscribe((wantedList) => {
            if (wantedList != null) {
              this.wantedList = wantedList;
            }
          });
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.isAdminLoginSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.productSubscription?.unsubscribe();
  }

  // Méthode lors de la création d'un produit
  public onCreate() {
    this.isCreation = true;
    this.isDialogVisible = true;
    this.editedProduct.set(emptyProduct);
  }

  // Méthode lors de la mise à jour d'un produit
  public onUpdate(product: Product) {
    this.isCreation = false;
    this.isDialogVisible = true;
    this.editedProduct.set(product);
  }

  // Méthode lors de la suppression d'un produit
  public onDelete(product: Product) {
    this.productsService.delete(product.id).subscribe();
  }

  // Méthode lors de l'enregistrement
  public onSave(product: Product) {
    if (this.isCreation) {
      this.productsService.create(product).subscribe();
    } else {
      this.productsService.update(product).subscribe();
    }
    this.closeDialog();
  }

  // Méthode lors de l'annulation
  public onCancel() {
    this.closeDialog();
  }

  // Méthode pour fermer le modal
  private closeDialog() {
    this.isDialogVisible = false;
  }

  // Méthode pour ajouter un produit dans le panier
  public addBucket(product: Product) {
    this.bucket.push(product);
    this.userService.updateUser(this.idUser, this.bucket, null).subscribe();
    product.quantity--;
    this.productsService.updateQuantity(product).subscribe();
  }

  // Méthode pour ajouter un produit à la liste de souhait
  public addWantedList(product: Product) {
    this.wantedList.push(product);
    this.userService.updateUser(this.idUser, null, this.wantedList).subscribe();
  }

  // Méthode pour supprimer un element de la liste de souhait
  public suppWantedList(product: Product) {
    const newWantedList = this.wantedList.filter((p) => p.id != product.id);
    this.userService.updateUser(this.idUser, null, newWantedList).subscribe();
  }

  // Méthode pour savoir si le produit est dans la liste de souhait
  public isProductWanted(product: Product): boolean {
    return !!this.wantedList.find((p) => p.id === product.id);
  }

  // Méthode pour savoir si le produit est encore disponible
  public isProductAvailable(product: Product): boolean {
    if (product.quantity > 0) {
      return true;
    } else {
      return false;
    }
  }

  // Méthode pour faire une recherche sur le nom d'un produit
  search() {
    if (this.wordSearched) {
      this.productListFiltered = this.productListFiltered.filter((product) =>
        product.name.toLowerCase().includes(this.wordSearched.toLowerCase())
      );
    } else {
      this.changeFilter();
    }
  }

  // Méthode pour filtrer la liste selon la categorie
  changeFilter() {
    if (this.categorySelected != "Toutes categories") {
      this.productListFiltered = this.products.filter(
        (product) => product.category == this.categorySelected
      );
    } else {
      this.productListFiltered = this.products;
    }
  }

  // Change la couleur de la pastille selon la quantité disponible si on est connecté en tant qu'admin
  roundColor(product: Product): string {
    if (product.inventoryStatus == "LOWSTOCK") {
      return "orange";
    } else if (product.inventoryStatus == "OUTOFSTOCK") {
      return "red";
    } else {
      return "green";
    }
  }
}
