import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/design-system/components/form";
import { Input } from "@/design-system/components/input";
import { Button } from "@/design-system/components/button";
import { Card } from "@/design-system/components/card";
import { registerSchema, type RegisterFormValues } from "../schemas/register.schema";
import piggyMascot from "@/assets/mascot/PesZO_Piggy_Mascot.png";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => void;
  isPending: boolean;
  errorMessage?: string;
}

export function RegisterForm({ onSubmit, isPending, errorMessage }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  // This split layout is exclusive to Login/Register - the only two screens
  // outside the main app shell. Designed live without a Stitch mockup.
  // The left panel intentionally uses a light background as a scoped exception
  // to DESIGN.md's dark-only rule - specifically for the Login/Register hero
  // panel, to create contrast with the mascot and match the split-screen
  // reference. This is not a project-wide change to dark mode; bg-base,
  // bg-surface1, and all other tokens remain untouched.
  return (
    <div className="flex h-screen overflow-hidden bg-base">
      {/* Left panel - brand story + mascot. Hidden on mobile; mobile users
          get the centered card layout via the right panel only. */}
      <div className="hidden min-h-0 w-[50%] flex-col bg-authPanelLight p-8 md:flex">
        <div className="min-h-0">
          <h1 className="font-heading text-2xl font-bold text-base">
            Pes<span className="text-gold">Z</span>O
          </h1>
        </div>

        <div className="mt-8 min-h-0">
          <h2 className="mb-2 font-heading text-2xl font-bold text-base">
            Stop pestering zero.
          </h2>
          <p className="max-w-[260px] font-body text-sm text-textSecondary">
            Practice real financial decisions with fake money, before the stakes
            are real.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 items-end justify-center">
          <img
            src={piggyMascot}
            alt=""
            aria-hidden="true"
            className="h-full max-h-[60vh] w-auto object-contain"
          />
        </div>
      </div>

      {/* Right panel - form card. 100% width on mobile, 50% on desktop. */}
      <div className="flex w-full items-center justify-center p-4 md:w-[50%]">
        <div className="w-full max-w-[420px]">
          {/* Wordmark - mobile only; desktop gets it from the left panel */}
          <h1 className="mb-1 text-center font-heading text-3xl font-bold text-textPrimary md:hidden">
            Pes<span className="text-gold">Z</span>O
          </h1>
          <p className="mb-6 text-center text-sm text-textSecondary">
            Create your account to start simulating
          </p>

          <Card className="gap-5 rounded-md p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
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
                          placeholder="At least 8 characters"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Re-enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {errorMessage && (
                  <p className="text-xs text-danger">{errorMessage}</p>
                )}

                <Button
                  type="submit"
                  className="w-full uppercase font-bold"
                  disabled={isPending}
                >
                  {isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </Card>

          <p className="mt-6 text-center text-sm text-textSecondary">
            Already have an account?{" "}
            <Link to="/login" className="text-gold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
