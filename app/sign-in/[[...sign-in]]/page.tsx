import { SignIn } from "@clerk/nextjs";
import AuthLayout from "@/components/AuthLayout";

export default function Page() {
  return (
    <AuthLayout>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
      />
    </AuthLayout>
  );
}
