import Home from "../components/home";

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function HomeRoute() {
  return <Home />;
}
