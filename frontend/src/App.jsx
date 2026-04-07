import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Portfolio from "./pages/Portfolio";
import Projects from "./pages/Projects";
import Story from "./pages/Story";
import Results from "./pages/Results";
import Ask from "./pages/Ask";
import Inquiry from "./pages/Inquiry";
import MyInquiries from "./pages/MyInquiries";
import Faq from "./pages/Faq";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/story" element={<Story />} />
        <Route path="/results" element={<Results />} />
        <Route path="/ask" element={<Ask />} />
        <Route path="/inquiry/:token" element={<Inquiry />} />
        <Route path="/my-inquiries" element={<MyInquiries />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
