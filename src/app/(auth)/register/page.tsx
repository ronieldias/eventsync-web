import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <Card className="w-full max-w-md my-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Crie sua conta</CardTitle>
          <CardDescription className="text-center">
            Comece a usar o EventSync hoje mesmo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}