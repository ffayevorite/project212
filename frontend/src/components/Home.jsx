import { Header } from './Header';
import { About } from './About';
import { HowItWorks } from './HowItWorks';
import { Footer } from './Footer';

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