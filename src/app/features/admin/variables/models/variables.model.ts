export interface BaseConfig {
  id: string;
  type: VariableType;
}

export interface Confrontation extends BaseConfig {
  price: number;
  areaMin: number;
  areaMax: number;
  urbanConfrontation: boolean;
  ruralConfrontation: boolean;
}

export interface Displacement extends BaseConfig {
  areaMin: number;
  areaMax: number;
  multiplier: number;
}

export interface Accommodation extends BaseConfig {
  price: number;
  distanteMin: number;
  distanteMax: number;
}

export interface StartingPoint extends BaseConfig {
  street: string;
  country: string;
  number: string;
  bairro: string;
  city: string;
  state: string;
}

export type VariableConfig =
  | Accommodation
  | Confrontation
  | Displacement
  | StartingPoint;

export enum VariableType {
  ACCOMODATION = 'accomodation',
  CONFRONTATION = 'confrontation',
  DISPLACEMENT = 'displacement',
  STARTING_POINT = 'starting_point',
}
