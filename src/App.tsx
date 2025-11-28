import { Hero } from "./components/Hero";
import { Header } from "./components/Header";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
    </div>
  );
}

export default App;
