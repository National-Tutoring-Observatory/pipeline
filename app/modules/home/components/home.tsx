import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

interface HomeProps {
  creditBalance: number;
  userName: string;
}

export default function Home({ creditBalance, userName }: HomeProps) {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-semibold">Welcome, {userName}</h1>
      <p className="text-muted-foreground mb-8">
        Get started by uploading your tutoring transcripts or exploring a sample
        dataset.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Your credit balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-1 text-4xl font-bold">${creditBalance.toFixed(2)}</p>
          <p className="text-muted-foreground text-sm">
            Credits are used for AI annotation runs. $1 covers approximately
            50–100 annotation calls depending on the model and prompt length.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button asChild>
          <Link to="/projects">Upload My Data</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/projects">Try with Sample Data</Link>
        </Button>
      </div>
    </div>
  );
}
