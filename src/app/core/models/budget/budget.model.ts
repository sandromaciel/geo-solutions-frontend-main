import { AreaParameters } from "../area.parameters.model";
import { BudgetUser } from "./budget.user.model";
import { AddressResponse } from "./response/address.response.model";
import { IntentionServiceResponse } from "./response/intention.service.response.model";
import { ServiceTypeResponse } from "./response/service.type.response.model";

export interface BudgetResponse {
  id: number;
  user: BudgetUser;
  price: number;
  startDate: Date;
  endDate: Date;
  budgetAreaSettings: AreaParameters;
  confrontations: number;
  intentionService: IntentionServiceResponse;
  serviceType: ServiceTypeResponse;
  address: AddressResponse;
}

