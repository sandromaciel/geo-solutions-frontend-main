import { AreaParameters } from "../../area.parameters.model";
import { AddressRequest } from "./address.request.model";

export interface BudgetRequest {
  userId: number;
  price: number ;
  startDate: string;
  endDate: string;
  budgetAreaSettings: AreaParameters;
  confrontations: number;
  serviceTypeId: number;
  intentionServiceId: number;
  address: AddressRequest;
}


