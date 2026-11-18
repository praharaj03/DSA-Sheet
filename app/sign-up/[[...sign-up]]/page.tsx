import { SignUp } from "@clerk/nextjs";
import AuthLayout from "@/components/AuthLayout";

export default function Page() {
  return (
    <AuthLayout>
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
      />
    </AuthLayout>
  );
}
