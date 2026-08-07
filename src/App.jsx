import { Routes, Route } from "react-router-dom";
import CodeEntryPage from "./pages/CodeEntryPage";
import NotFoundPage from "./pages/NotFoundPage";
import BoardPage from "./pages/BoardPage";
import ResultPage from "./pages/ResultPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminCodesPage from "./pages/AdminCodesPage";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CodeEntryPage />} />
      <Route path="/board/:code" element={<BoardPage />} />
      <Route path="/board/:code/result" element={<ResultPage />} />

      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/signup" element={<SignupPage />} />
      <Route
        path="/admin/menus"
        element={
          <AdminRoute>
            <AdminMenuPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/codes"
        element={
          <AdminRoute>
            <AdminCodesPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
