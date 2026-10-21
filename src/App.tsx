import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index.tsx";
import BlogIndex from "./pages/BlogIndex.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import ProjectPage from "./pages/ProjectPage.tsx";
import Uses from "./pages/Uses.tsx";
import SyncupPrivacyPolicy from "./pages/SyncupPrivacyPolicy.tsx";
import NullPointerPrivacyPolicy from "./pages/NullPointerPrivacyPolicy.tsx";
import NullPointerSupport from "./pages/NullPointerSupport.tsx";
import NotFound from "./pages/NotFound.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/uses" element={<Uses />} />
        <Route path="/syncup/privacy-policy" element={<SyncupPrivacyPolicy />} />
        <Route path="/null-pointer/privacy-policy" element={<NullPointerPrivacyPolicy />} />
        <Route path="/null-pointer/support" element={<NullPointerSupport />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;
