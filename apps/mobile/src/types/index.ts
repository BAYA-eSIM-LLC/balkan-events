export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type UserProfile = {
  id: number;
  email: string;
  full_name?: string;
  role?: string;
};

export type ApiError = {
  status: number;
  detail: string;
};
