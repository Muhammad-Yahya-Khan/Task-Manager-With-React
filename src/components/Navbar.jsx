import { Button } from "@/components/ui/button";
import { auth, signOut } from "../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
            navigate("/Login");
        } catch (error) {
            toast.error("Error logging out: " + error.message);
        }
    };

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4 container mx-auto">
                <div className="mr-4 font-semibold">Dashboard</div>
                <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
                    <Link
                        to="/register"
                        className="text-sm font-medium hover:underline"
                    >
                        Register
                    </Link>
                </nav>
                <div className="ml-auto flex items-center space-x-4">
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="font-semibold"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}
