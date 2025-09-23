import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-linear-to-bl from-violet-300 to-fuchsia-300">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>National Tutoring Observatory</CardTitle>
          <CardDescription>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-2">
          <Button variant="outline" className="w-full">
            Login with ORCID
          </Button>
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}