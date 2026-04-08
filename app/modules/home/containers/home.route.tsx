import Home from "../components/home";

export function loader() {
  return {};
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function HomeRoute() {
  return <Home />;
}
