export interface UserDTO {
  id?: string;
  name: string;
  email: string;
  cell: string;
  userType: number;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
