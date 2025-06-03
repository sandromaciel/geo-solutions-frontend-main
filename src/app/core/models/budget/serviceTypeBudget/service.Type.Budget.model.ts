import { IntentionServiceBudget } from "./intention.service.budget.model";

export interface ServiceTypeBudget {
  id: number;
  name: string;
  description: string;
  intentionServices: IntentionServiceBudget[];
}
