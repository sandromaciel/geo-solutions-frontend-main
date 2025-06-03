export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  jwtToken: string;
}

export interface DecodedToken{
  nameid: string[];
  role: string;
  exp: number;
  iat: number;
}
