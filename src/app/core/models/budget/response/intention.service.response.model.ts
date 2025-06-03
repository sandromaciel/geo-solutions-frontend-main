export interface IntentionServiceResponse {
  id: number;
  name: string;
  description: string;
  serviceTypeId: number;
  serviceTypeName: string;
  limit_Area: number;
  daily_Price: number;
  urbanConfrontation: boolean;
  ruralConfrontation: boolean;
}
