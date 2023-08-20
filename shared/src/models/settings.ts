export interface IAppSettings {
  products: {
    [productName: string]: {
      price: number;
      displayName?: string;
    };
  };
}
