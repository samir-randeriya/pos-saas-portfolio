import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import ImpersonationBanner from "./components/ImpersonationBanner";

function App() {
  const isImpersonating = localStorage.getItem("impersonating") === "true";

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className={isImpersonating ? "pt-12" : ""}>
          {/* Global impersonation banner */}
          {isImpersonating && <ImpersonationBanner />}

          {/* Application routes */}
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
