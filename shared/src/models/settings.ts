export interface IAppSettings {
  invoiceMessageTemplate: string;
  products: {
    [productName: string]: {
      price: number;
      displayName?: string;
    };
  };
  discounts: {
    [name: string]: {
      amountValue?: number;
      percentageValue?: string;
      labels?: string[];
    };
  };
}
