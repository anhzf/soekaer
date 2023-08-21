export interface IAppSettings {
  invoiceMessageTemplate: string;
  products: {
    [productName: string]: {
      price: number;
      displayName?: string;
    };
  };
}
