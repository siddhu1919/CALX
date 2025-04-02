import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/assets/leaf.png";

import { useForm, SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";

type SignUpInputTypes = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInputTypes>();

  // Submit handler Function
  const submit: SubmitHandler<SignUpInputTypes> = (data) => {
    console.log("im called");
    console.log("data", data);
    console.log("errors", errors);
    console.log(watch("email")); // watch input value by passing the name of it
    console.log(watch("password")); // watch input value by passing the name of it
  };

  const validateConfirmPassword = (value: string) => {
    return value === watch("password") || "Passwords do not match";
  };

  return (
    <div className={cn("flex flex-col gap-6 m-2 ", className)} {...props}>
      <div className="m-auto size-20 flex items-center justify-center p-3 rounded-full  ">
        <img src={Logo} alt="Logo" width="100" />
        <div className="font-bold text-4xl tracking-wide">CALX</div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register </CardTitle>
          <CardDescription>
            Enter your credentials below to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={handleSubmit(submit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="calx@mail.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email format",
                    },
                  })}
                  required
                />
                {errors.email && (
                  <div className="text-red-500 text-sm">
                    {errors.email.message}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password && (
                  <div className="text-red-500 text-sm">
                    {errors.password.message}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Confirm Password</Label>
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  {...register("confirmPassword", {
                    required: "Password is required",
                    validate: validateConfirmPassword,
                  })}
                />
                {errors.confirmPassword && (
                  <div className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full active:scale-95">
                Register
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
