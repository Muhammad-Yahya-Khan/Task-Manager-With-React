import SignUp from "./pages/SignUp";
import NoPage from "./pages/NoPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Login from "./pages/Login";
import { Toaster } from "@/components/ui/sonner";
import Home from "./pages/Home";

const App = () => {
	return (
		<>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Login />} />
						<Route path="Login" element={<Login />} />
						<Route path="Register" element={<SignUp />} />
						<Route path="Signup" element={<SignUp />} />
						<Route path="Home" element={<Home />} />

						<Route path="*" element={<NoPage />} />
					</Routes>
				</BrowserRouter>
			</ThemeProvider>
			<Toaster />
		</>
	);
};

export default App;
