import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index.tsx";
import BlogIndex from "./pages/BlogIndex.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Uses from "./pages/Uses.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/uses" element={<Uses />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
