import { Product } from "app/products/data-access/product.model";

export class User {
  constructor(
    public id: number,
    public username: string,
    public firstName: string,
    public email: string,
    public password: string,
    public panierAchat: Product[] | null,
    public listEnvie: Product[] | null
  ) {}
}
