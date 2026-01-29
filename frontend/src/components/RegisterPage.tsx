import { useState, FormEvent } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { register, setToken, fetchCurrentUser, FrontendUser } from '../api/auth';
import { toast } from 'sonner@2.0.3';

interface RegisterPageProps {
    onRegisterSuccess: (user: FrontendUser) => void;
    onNavigateToLogin: () => void;
    onBack: () => void;
}

export function RegisterPage({
    onRegisterSuccess,
    onNavigateToLogin,
    onBack,
}: RegisterPageProps) {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!username || !email || !password) {
            toast.error('Заполните логин, email и пароль');
            return;
        }

        if (password.length < 6) {
            toast.error('Пароль должен быть минимум 6 символов');
            return;
        }

        try {
            setIsLoading(true);
            const token = await register({
                username,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                email,
                password,
                phone: phone || undefined,
                address: address || undefined,
            });
            setToken(token);
            const user = await fetchCurrentUser();
            onRegisterSuccess(user);
            toast.success('Вы успешно зарегистрировались');
            onBack();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Ошибка регистрации';
            toast.error(message);
            console.error('Register error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-gray-900 mb-6 text-center">Регистрация</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Имя пользователя
                        </label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ваш логин"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Имя
                            </label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Иван"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Фамилия
                            </label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Иванов"
                            />
                        </div>
                    </div>

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

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Телефон
                        </label>
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+7 (___) ___-__-__"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Адрес
                        </label>
                        <Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Город, улица, дом, квартира"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
                    </Button>
                </form>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onNavigateToLogin}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Уже есть аккаунт? Войти
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


