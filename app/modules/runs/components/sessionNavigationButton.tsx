import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function SessionNavigationButton({
  url,
  children,
}: {
  url: string | null;
  children: React.ReactNode;
}) {
  if (url) {
    return (
      <Button variant="outline" size="icon" asChild>
        <Link to={url}>{children}</Link>
      </Button>
    );
  }
  return (
    <Button variant="outline" size="icon" disabled>
      {children}
    </Button>
  );
}
