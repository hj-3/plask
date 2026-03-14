import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/authStore';
import { Header } from './components/common';
import { LoginPage } from './pages/LoginPage';
import { CourseListPage } from './pages/CourseListPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { MyEnrollmentsPage } from './pages/MyEnrollmentsPage';
import { MyHistoryPage } from './pages/MyHistoryPage';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => (
  <>
    <Header />
    <main className="main">{children}</main>
  </>
);

const AppRoutes = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/courses" replace /> : <LoginPage />}
      />
      <Route
        path="/courses"
        element={
          <PrivateRoute>
            <Layout><CourseListPage /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <PrivateRoute>
            <Layout><CourseDetailPage /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/my/enrollments"
        element={
          <PrivateRoute>
            <Layout><MyEnrollmentsPage /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/my/history"
        element={
          <PrivateRoute>
            <Layout><MyHistoryPage /></Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
