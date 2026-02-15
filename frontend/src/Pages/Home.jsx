import { About } from "../components/About";
import { HowItWorks } from "../components/HowItWorks";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export default function Home() {
  return (
    <div className="size-full">
      <Header />
      <main>
        <About />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
