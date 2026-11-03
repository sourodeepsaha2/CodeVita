import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import BackToTop from "./components/BackToTop";
import ScrollProgress from "./components/ScrollProgress";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";
import CommandPalette from "./components/CommandPalette";
import ReviewPage from "./pages/ReviewPage";

function App() {
  return (
    <>
      <ScrollProgress />
      <CommandPalette />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <BackToTop />
    </>
  );
}

export default App;
