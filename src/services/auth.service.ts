import { axiosInstance } from '../api/client';

type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    avatar: string | null;
  };
};

export async function loginService(params: {
  email: string;
  password: string;
}) {
  const { email, password } = params;

  console.log('LoginService called with', email, password);
  const response = await axiosInstance.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  return response.data;
}
