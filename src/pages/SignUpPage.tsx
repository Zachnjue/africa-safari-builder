import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const signUpSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = (data: SignUpFormValues) => {
    console.log(data);
    toast.success('Account created successfully!', {
      description: 'Redirecting you to your profile...',
    });
    setTimeout(() => navigate('/profile'), 2000);
  };

  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-80px)] lg:grid-cols-2 xl:min-h-[calc(100vh-80px)]">
      <div className="hidden bg-gray-100 lg:block dark:bg-gray-800">
        <img
          src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=1974&auto=format&fit=crop"
          alt="African wildlife"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-balance text-gray-600 dark:text-gray-300">
              Join SafariSwap and start planning your next adventure.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Jelani Maina" {...register('fullName')} />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>
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
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="#" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}