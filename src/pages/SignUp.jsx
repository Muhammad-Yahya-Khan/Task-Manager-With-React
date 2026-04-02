import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";

import { auth, createUserWithEmailAndPassword, db } from "../firebaseConfig";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const initialValues = {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    };

    const signupSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        email: Yup.string()
            .email("Invalid email")
            .required("Email is required"),
        password: Yup.string()
            .min(6, "Password Cannot be less than 6 characters")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .required("Confirm password is required")
            .oneOf([Yup.ref("password"), null], "Passwords must match"),
    });

    const navigate = useNavigate();

    const formik = useFormik({
        initialValues,
        validationSchema: signupSchema,
        onSubmit: async (values) => {
            try {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    values.email,
                    values.password,
                );
                // Update display name on the Firebase user
                await updateProfile(userCredential.user, {
                    displayName: values.name,
                });
                // Save basic user profile to Firestore
                try {
                    await setDoc(doc(db, "users", userCredential.user.uid), {
                        name: values.name,
                        email: values.email,
                        createdAt: serverTimestamp(),
                    });
                } catch (e) {
                    console.warn(
                        "Failed to write user profile to Firestore:",
                        e,
                    );
                }
                // No email verification: registration completed
                toast("Successfully Registered");
                navigate("/Login");
                formik.resetForm();
            } catch (error) {
                toast("Sign Up Error: " + error.message);
            }
        },
    });

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Create An Account</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>

                <form
                    onSubmit={formik.handleSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            formik.submitForm();
                        }
                    }}
                >
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    name="name"
                                    id="name"
                                    type="text"
                                    placeholder="Your name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    required
                                />
                            </div>
                            {formik.errors.name && formik.touched.name && (
                                <span className="text-red-500 text-[12px]">
                                    {formik.errors.name}
                                </span>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    name="email"
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    required
                                />
                            </div>
                            {formik.errors.email && formik.touched.email && (
                                <span className="text-red-500 text-[12px]">
                                    {formik.errors.email}
                                </span>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    name="password"
                                    id="password"
                                    type="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    required
                                />
                                {formik.errors.password &&
                                formik.touched.password ? (
                                    <span className="text-red-500 text-[12px]">
                                        {formik.errors.password}
                                    </span>
                                ) : null}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm Password
                                </Label>
                                <Input
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    type="password"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    required
                                />
                                {formik.errors.confirmPassword &&
                                formik.touched.confirmPassword ? (
                                    <span className="text-red-500 text-[12px]">
                                        {formik.errors.confirmPassword}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex-col gap-2 mt-4">
                        <Button type="submit" className="w-full font-bold">
                            Sign Up
                        </Button>
                        <p className="text-sm text-center">
                            Already have an account?{" "}
                            <Link
                                to="/Login"
                                className="underline cursor-pointer"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default SignUp;
