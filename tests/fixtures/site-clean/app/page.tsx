import { Hero } from "../components/hero";

export default function Home() {
  const dsn = process.env.DATABASE_URL;
  return <Hero configured={Boolean(dsn)} />;
}
