import "./index.css";
import "./App.css";

import Workspaces from "./pages/Workspaces/Workspaces.jsx";
import Board from "./pages/Board/Board.jsx";

import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import WorkSpace from "./pages/WorkSpace/Workspace.jsx";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./ProtectedRoute.jsx";

import {  AuthContextProvider } from "./components/context/Auth.jsx";
import Archeives from "./pages/archives/Archeives.jsx";
import ProtectedAdminRoute from "./ProtectedAdminRoute.jsx";
import AllMembers from "./pages/AllMembers/AllMembers.jsx";
import { ImageProvider } from "./components/context/BgImgContext.jsx";

import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>حدث خطأ غير متوقع 😢</h1>
      <p>عذرًا، حدث خطأ أثناء عرض التطبيق.</p>
      <p>
        <strong>التفاصيل:</strong> {error.message}
      </p>
      <button onClick={resetErrorBoundary}>إعادة المحاولة</button>
    </div>
  );
}



const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Workspaces />
      </ProtectedRoute>
    ),
  },
  {
    path: "/board/:workspaceId/:boardId",
    element: (
      <ProtectedRoute>
        <Board />
      </ProtectedRoute>
    ),
  },
  {
    path: "/workspace/:workspaceId",
    element: (
      <ProtectedRoute>
        <WorkSpace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: (
      <ProtectedAdminRoute>
        <Register />
      </ProtectedAdminRoute>
    ),
  },
  {
    path: "/allMembers",
    element: (
      <ProtectedAdminRoute>
        <AllMembers />
      </ProtectedAdminRoute>
    ),
  },
  {
    path: "/archeivedCards/:boardID",
    element: <Archeives />,
  },
]);


createRoot(document.getElementById("root")).render(
 <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // يمكنك إعادة تعيين الحالة أو تنفيذ إجراءات أخرى
      }}
    > <AuthContextProvider>
    
      <ImageProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              padding: "16px 24px",
              backgroundColor: "#fff",
              color: "#374151",
            },
          }}
        />
      </ImageProvider>
  </AuthContextProvider>
    </ErrorBoundary>
);
