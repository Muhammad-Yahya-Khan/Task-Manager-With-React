import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { toast } from "sonner";
import { collection, addDoc } from "firebase/firestore";
import { db, auth, signOut } from "../firebaseConfig";
import { useState } from "react";
import TaskList from "../components/taskList";
import { ChevronDownIcon, Check, LogOut } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

const Home = () => {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	// eslint-disable-next-line no-unused-vars
	const [date, setDate] = useState();
	const [loading, setLoading] = useState(false);

	const handleLogout = async () => {
		try {
			await signOut(auth);
			toast.success("Logged out successfully");
			navigate("/login");
		} catch (error) {
			toast.error("Error logging out: " + error.message);
		}
	};

	const initialValues = {
		title: "",
		description: "",
		deadline: null,
	};

	const formik = useFormik({
		initialValues: initialValues,
		onSubmit: async (values) => {
			setLoading(true);
			try {
				const collectionRef = collection(db, "Tasks");
				const document = {
					title: values.title,
					description: values.description,
					deadline: values.deadline ? values.deadline.toISOString() : null,
					status: "pending", // Add default status
				};

				const docRef = await addDoc(collectionRef, document);
				if (docRef) {
					formik.resetForm();
					setDate(null);
					toast("Task Has Been Added!");
				}
			} catch (error) {
				toast(error?.message);
			} finally {
				setLoading(false);
			}
		},
	});

	return (
		<>
			<div className="p-4">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-semibold">Task Manager</h2>
						<p className="text-sm text-gray-500">Manage and track your tasks efficiently</p>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="destructive" size="sm" className="gap-2" onClick={handleLogout}>
							<LogOut size={16} />
							Logout
						</Button>
						<Dialog>
							<DialogTrigger asChild>
								<Button size="sm" className="gap-2">
									Add Task
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<DialogHeader>
									<DialogTitle>Add Task</DialogTitle>
									<DialogDescription>Add a Task. Click save when you're done.</DialogDescription>
								</DialogHeader>
								<form className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="title">Title</Label>
										<Input id="title" name="title" value={formik.values.title} onChange={formik.handleChange} placeholder="Enter task title" required />
									</div>
									<div className="space-y-2">
										<Label htmlFor="description">Description</Label>
										<Input id="description" name="description" value={formik.values.description} onChange={formik.handleChange} placeholder="Enter task description" required />
									</div>
									<div className="space-y-2">
										<Label htmlFor="deadline">Deadline</Label>
										<Popover open={open} onOpenChange={setOpen}>
											<PopoverTrigger asChild>
												<Button variant="outline" id="deadline" className="w-full justify-between">
													{formik.values.deadline ? formik.values.deadline.toLocaleDateString() : "Select deadline"}
													<ChevronDownIcon className="h-4 w-4 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={formik.values.deadline}
													onSelect={(date) => {
														formik.setFieldValue("deadline", date);
														setOpen(false);
													}}
												/>
											</PopoverContent>
										</Popover>
									</div>
								</form>
								<DialogFooter className="mt-6">
									<DialogClose asChild>
										<Button variant="outline" size="sm">
											Cancel
										</Button>
									</DialogClose>
									<Button type="submit" size="sm" onClick={formik.submitForm} disabled={loading}>
										{loading ? "Saving..." : "Save"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>
				<div className="mt-4">
					<TaskList />
				</div>
			</div>
		</>
	);
};

export default Home;
