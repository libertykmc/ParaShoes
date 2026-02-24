import { useState, FormEvent } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { login, setToken, fetchCurrentUser, FrontendUser } from '../api/auth';
import { toast } from 'sonner';

interface LoginPageProps {
  onLoginSuccess: (user: FrontendUser) => void;
  onNavigateToRegister: () => void;
  onBack: () => void;
}

export function LoginPage({
  onLoginSuccess,
  onNavigateToRegister,
  onBack,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Заполните email и пароль');
      return;
    }

    try {
      setIsLoading(true);
      const token = await login({ email, password });
      setToken(token);
      const user = await fetchCurrentUser();
      onLoginSuccess(user);
      toast.success('Вы успешно вошли');
      onBack();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ошибка авторизации';
      toast.error(message);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-gray-900 mb-6 text-center">Вход в аккаунт</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Пароль</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Входим...' : 'Войти'}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Нет аккаунта? Зарегистрироваться
          </button>

          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}



