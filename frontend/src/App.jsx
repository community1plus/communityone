import { Routes, Route } from "react-router-dom";
import AuthGate from "./pages/AuthGate";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<AuthGate />} />
    </Routes>
  );
}

export default App;