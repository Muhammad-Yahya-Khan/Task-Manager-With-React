import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, signInWithEmailAndPassword, sendPasswordResetEmail } from "../firebaseConfig";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const loginUsers = async (email, password) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
		console.log(user);
		return true;
	} catch (error) {
		console.log("Error: ", error.code, error.message);
		throw error;
	}
};

const Login = () => {
	const navigate = useNavigate();
	const [isResetting, setIsResetting] = useState(false);
	const [resetDialogOpen, setResetDialogOpen] = useState(false);
	const [resetEmail, setResetEmail] = useState("");

	const handleForgotPassword = async () => {
		if (!resetEmail) {
			toast.error("Please enter your email address");
			return;
		}

		try {
			setIsResetting(true);
			// Try to send reset email
			await sendPasswordResetEmail(auth, resetEmail);
			toast.success("Password reset email sent! Please check your inbox.");
			setResetDialogOpen(false);
			setResetEmail("");
		} catch (error) {
			// Check if error is about user not found
			if (error.code === "auth/user-not-found") {
				toast.error("No account found with this email address");
			} else {
				toast.error("Error: " + error.message);
			}
		} finally {
			setIsResetting(false);
		}
	};

	const initialValues = {
		email: "",
		password: "",
	};

	const loginSchema = Yup.object().shape({
		email: Yup.string().email("Invalid email").required("Email is required"),
		password: Yup.string().required("Password is required"),
	});

	const formik = useFormik({
		initialValues,
		validationSchema: loginSchema,
		onSubmit: async (values) => {
			try {
				await loginUsers(values.email, values.password);
				toast("Successfully logged in");
				navigate("/Home");
				formik.resetForm();
			} catch (error) {
				toast("Login Error: " + error.message);
			}
		},
	});

	return (
		<>
			<div className="flex justify-center items-center h-screen">
				<Card className="w-full max-w-sm">
					<CardHeader>
						<CardTitle>Login to your account</CardTitle>
						<CardDescription>Enter your email below to login to your account</CardDescription>
					</CardHeader>
					<CardContent>
						<form>
							<div className="flex flex-col gap-6">
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input name="email" id="email" type="email" placeholder="Enter Your Email" value={formik.values.email} onChange={formik.handleChange} required />
								</div>
								{formik.errors.email && formik.touched.email && <span className="text-red-500 text-[12px]">{formik.errors.email}</span>}

								<div className="grid gap-2">
									<Label htmlFor="password">Password</Label>
									<Input name="password" id="password" type="password" placeholder="Enter Your Password" value={formik.values.password} onChange={formik.handleChange} required />
								</div>
								{formik.errors.password && formik.touched.password && <span className="text-red-500 text-[12px]">{formik.errors.password}</span>}
							</div>
						</form>
					</CardContent>
					<CardFooter className="flex-col gap-2">
						<div className="w-full text-right">
							<button type="button" className="text-sm text-muted-foreground hover:text-primary mb-2" onClick={() => setResetDialogOpen(true)}>
								Forgot Password?
							</button>
						</div>
						<Button type="submit" className="w-full font-bold" onClick={formik.submitForm}>
							Login
						</Button>
						<Button variant="outline" className="w-full">
							Login with Google
						</Button>
					</CardFooter>
				</Card>

				<Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Reset Password</DialogTitle>
							<DialogDescription>Enter your email address and we'll send you a password reset link.</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="resetEmail">Email address</Label>
								<Input id="resetEmail" placeholder="Enter your email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
							</div>
						</div>
						<DialogFooter>
							<Button onClick={handleForgotPassword} disabled={isResetting}>
								{isResetting ? "Sending..." : "Send Reset Link"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
};

export default Login;
