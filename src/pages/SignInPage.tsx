// filepath: /src/pages/SignInPage.tsx

import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';


const signInSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

console.log('SignInPage rendered');
export function SignInPage() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInFormValues) => {
        const { email, password } = data;

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            toast.error('Sign-in failed!', { description: error.message });
        } else {
            toast.success('Welcome back!', { description: 'Redirecting to your profile...' });
            setTimeout(() => navigate('/profile'), 2000);
        }
    };

    return (
        <div className="w-full lg:grid lg:min-h-[calc(100vh-80px)] lg:grid-cols-2 xl:min-h-[calc(100vh-80px)]">
            <div className="hidden bg-gray-100 lg:block dark:bg-gray-800">
                <ImageWithFallback
                    src="https://www.kenyasafari.com/images/great-migration-masai-mara-kenya-590x390.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                    alt="Safari"
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="flex items-center justify-center py-12 px-4">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Welcome Back</h1>
                        <p className="text-balance text-gray-600 dark:text-gray-300">
                            Sign in to your SafariSwap account.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="jelani@example.com" {...register('email')} />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full">Sign In</Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Don’t have an account?{" "}
                        <Link to="/signup" className="underline">
                            Create one
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
