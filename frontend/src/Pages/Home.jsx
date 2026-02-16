import { About } from "../components/About";
import { HowItWorks } from "../components/HowItWorks";

export default function Home() {
  return (
    <div className="size-full">
      <main>
        <About />
        <HowItWorks />
      </main>
    </div>
  );
}
