import { Routes } from "@angular/router";
import { HomeComponent } from "./shared/features/home/home.component";
import { BucketComponent } from "./user/features/bucket/bucket.component";

export const APP_ROUTES: Routes = [
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "products",
    loadChildren: () =>
      import("./products/products.routes").then((m) => m.PRODUCTS_ROUTES),
  },
  { path: "bucket", component: BucketComponent },
  { path: "", redirectTo: "home", pathMatch: "full" },
];
