export interface RegisterData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  avatar: string;
}

export interface RegisterDataForSend {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  avatar: string;
}

export interface RegisterErrorResponse {
  statusCode: number;
  message: string[]; 
  error: string;
}

export interface RegisterStringReponse {
  email: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
}

export interface LoginErrorResponse {
  statusCode: number;
  error: string;
}