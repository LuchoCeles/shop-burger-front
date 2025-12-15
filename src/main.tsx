import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConfiguracionProvider } from './context/ConfiguracionContext.jsx';

createRoot(document.getElementById("root")!).render(
    <ConfiguracionProvider>
        <App />
    </ConfiguracionProvider>
);
