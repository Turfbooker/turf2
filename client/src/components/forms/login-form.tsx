import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

interface LoginFormProps {
  defaultRole?: "player" | "owner";
}

const loginFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  role: z.enum(["player", "owner"]),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm({ defaultRole = "player" }: LoginFormProps) {
  const { loginMutation, user } = useAuth();
  const [, navigate] = useLocation();
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate(user.role === "player" ? "/player/dashboard" : "/owner/dashboard");
    }
  }, [user, navigate]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      role: defaultRole,
    },
  });
  
  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate(
      { username: data.username, password: data.password },
      {
        onSuccess: (user) => {
          if (user.role !== data.role) {
            form.setError("role", { 
              type: "manual",
              message: `Your account is registered as a ${user.role}, not as a ${data.role}.`
            });
          } else {
            // Redirect to dashboard based on role
            navigate(user.role === "player" ? "/player/dashboard" : "/owner/dashboard");
          }
        }
      }
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2 mb-4">
            <FormLabel>Select your role:</FormLabel>
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-0 flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="radio"
                        className="form-radio text-primary-600"
                        checked={field.value === "player"}
                        onChange={() => field.onChange("player")}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Player</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-0 flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="radio"
                        className="form-radio text-primary-600"
                        checked={field.value === "owner"}
                        onChange={() => field.onChange("owner")}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Turf Owner</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <FormMessage />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
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
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </a>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </Form>
  );
}
