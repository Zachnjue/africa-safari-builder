import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient'; // ✅ ensure this file exports your Supabase client

// 🧩 Validation schema
const signUpSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/profile';

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  // 🧠 Handle form submission
  const onSubmit = async (data: SignUpFormValues) => {
    const { email, password, fullName } = data;
    console.log('Submitting signup data:', data);

    const { data: result, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // ✅ store name in user metadata
        },
      },
    });

    if (error) {
      console.error('Supabase signup error:', error);
      toast.error('Sign-up failed!', { description: error.message });
    } else {
      console.log('Signup success:', result);
      toast.success('Account created successfully!', {
        description: 'Complete your profile to continue...',
      });
      // Always go to profile, but pass along the intended destination
      setTimeout(() => navigate('/profile', { state: { from } }), 2000);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-80px)] lg:grid-cols-2 xl:min-h-[calc(100vh-80px)]">
      {/* Left side image */}
      <div className="hidden bg-gray-100 lg:block dark:bg-gray-800">
        <ImageWithFallback
          src="https://www.tanzaniatourism.com/images/uploads/Serengeti_Gnus_7765.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
          alt="African wildlife"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right side form */}
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-balance text-gray-600 dark:text-gray-300">
              Join SafariSwap and start planning your next adventure.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Jelani Maina" {...register('fullName')} />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jelani@example.com" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">Create Account</Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
