import { VariableCard } from './variables-card.model';
import { VariableConfig, VariableType } from './variables.model';

export interface AddVariableModal {
  initialData?: VariableConfig;
  type: VariableType;
  onSave: VariableCard['onAddConfig'];
}
