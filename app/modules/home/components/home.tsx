import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-primary mb-8 text-center text-3xl font-semibold">
        Welcome to Sandpiper!
      </h1>
      <Card className="gap-4 border-2">
        <CardHeader>
          <CardTitle className="text-center text-lg">
            <p className="text-primary text-4xl font-bold">$10.00</p>
            <p className="text-muted-foreground mt-1 text-sm">
              in free credits added to your account
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm font-medium">That&apos;s enough to:</p>
          <ul className="text-muted-foreground space-y-1 px-4 text-sm">
            <li>✓ Annotate 25 sessions ~12 times</li>
            <li>✓ Try 3 different prompts on the full sample</li>
            <li>✓ Run orchestration with quality check</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
