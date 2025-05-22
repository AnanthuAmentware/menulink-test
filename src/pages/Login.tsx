
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword, auth } from '../lib/firebase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof formSchema>;

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Navigation is handled by the auth state change in AuthContext
      // If admin, will redirect to /admin, otherwise to /dashboard
      
    } catch (err: any) {
      setIsLoading(false);
      let errorMessage = "Failed to log in. Please try again.";
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      setError(errorMessage);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate(isAdmin ? '/admin' : '/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-restaurant-cream/20 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-display text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to your MenuBuilder account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@example.com" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-restaurant-burgundy hover:bg-restaurant-burgundy/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-restaurant-burgundy font-medium hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
