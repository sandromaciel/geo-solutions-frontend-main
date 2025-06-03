import { VariableConfig, VariableType } from './variables.model';

export interface VariableCard {
  title: string;
  configs: VariableConfig[];
  onAddConfig: (type: VariableType, config: VariableConfig) => void;
  onEditConfig: (type: VariableType, config: VariableConfig) => void;
  onDeleteConfig: (type: VariableType, id: string) => void;
}
