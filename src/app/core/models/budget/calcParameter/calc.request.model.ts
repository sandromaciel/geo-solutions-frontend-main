import { AreaParameters } from "../../area.parameters.model";

export interface CalcRequest {
  address: CalcAddress;
  areaSettings: AreaParameters;
  confrontations: number;
  serviceTypeId: number;
  intentionServiceId: number;
}

export interface CalcAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

