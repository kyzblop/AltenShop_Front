import { Product } from "app/products/data-access/product.model";

export interface User {
  id: number;
  username: string;
  firstName: string;
  email: string;
  password: string;
  panier: Array<Product>;
  listeEnvie: Array<Product>;
}
