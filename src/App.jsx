import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import MapsSection from './components/MapsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <MenuSection />
      <MapsSection />
      <ContactSection />
      <Footer />
    </>
  );
}

export default App;
