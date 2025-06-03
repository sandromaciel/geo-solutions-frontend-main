export interface AddressRequest {
  zipcode: string;
  neighborhood: string;
  street: string;
  city: string;
  state: string;
  number?: number;
  complement: string;
}
