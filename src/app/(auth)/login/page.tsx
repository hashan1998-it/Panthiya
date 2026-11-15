import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SignInForm from "../components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in · Panthiya",
};

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm gap-6 py-8">
        <CardHeader className="gap-2 px-6 text-center">
          <CardTitle className="text-display-sm">Panthiya</CardTitle>
          <CardDescription className="text-body-sm">
            Sign in to manage classes, attendance and fees.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <SignInForm />
        </CardContent>
      </Card>
    </main>
  );
}
