import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Trash, Check, ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    const editFormik = useFormik({
        initialValues: {
            title: "",
            description: "",
            deadline: null,
            status: "pending",
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Title is required"),
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const documentRef = doc(db, "Tasks", editingTask.id);
                await updateDoc(documentRef, {
                    title: values.title,
                    description: values.description,
                    deadline: values.deadline
                        ? values.deadline.toISOString()
                        : null,
                    status: values.status,
                });
                toast("Task Has Been Updated!");
                setIsEditDialogOpen(false);
            } catch (error) {
                toast(error?.message);
            } finally {
                setIsLoading(false);
            }
        },
    });

    const handleEditClick = (task) => {
        setEditingTask(task);
        editFormik.setValues({
            title: task.title,
            description: task.description,
            deadline: task.deadline ? new Date(task.deadline) : null,
            status: task.status || "pending",
        });
        setIsEditDialogOpen(true);
    };

    let unsubscribeTasks = null;
    const subscribeForUser = (uid) => {
        if (unsubscribeTasks) unsubscribeTasks();
        if (!uid) {
            setTasks([]);
            return;
        }
        const collectionRef = collection(db, "Tasks");
        const q = query(collectionRef, where("createdBy", "==", uid));
        unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
            const data = [];
            querySnapshot.forEach((doc) => {
                const combinedDataWithId = { ...doc.data(), id: doc?.id };
                data.push(combinedDataWithId);
            });
            setTasks(data);
        });
    };

    const deleteTask = async (id) => {
        try {
            const documentRef = doc(db, "Tasks", id);
            await deleteDoc(documentRef);
            toast("Task Has Been Deleted");
        } catch (error) {
            toast(error?.message);
        }
    };

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                subscribeForUser(user.uid);
            } else {
                // no user logged in
                if (unsubscribeTasks) unsubscribeTasks();
                setTasks([]);
            }
        });

        return () => {
            if (unsubscribeTasks) unsubscribeTasks();
            unsubAuth();
        };
    }, []);

    return (
        <>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Make changes to your task here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={editFormik.values.title}
                                onChange={editFormik.handleChange}
                                onBlur={editFormik.handleBlur}
                            />
                            {editFormik.errors.title &&
                                editFormik.touched.title && (
                                    <span className="text-red-500 text-xs">
                                        {editFormik.errors.title}
                                    </span>
                                )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                value={editFormik.values.description}
                                onChange={editFormik.handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="deadline">Deadline</Label>
                            <Popover
                                open={calendarOpen}
                                onOpenChange={setCalendarOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        {editFormik.values.deadline
                                            ? editFormik.values.deadline.toLocaleDateString()
                                            : "Pick a date"}
                                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={editFormik.values.deadline}
                                        onSelect={(date) => {
                                            editFormik.setFieldValue(
                                                "deadline",
                                                date,
                                            );
                                            setCalendarOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                name="status"
                                value={editFormik.values.status}
                                onChange={editFormik.handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isLoading}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={editFormik.submitForm}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="mb-4 flex items-center justify-end space-x-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-[180px] justify-between"
                        >
                            <span>
                                {statusFilter === "all"
                                    ? "All Tasks"
                                    : statusFilter === "pending"
                                      ? "Pending Tasks"
                                      : "Completed Tasks"}
                            </span>
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[180px] p-0" align="end">
                        <div className="grid">
                            <Button
                                variant={
                                    statusFilter === "all"
                                        ? "secondary"
                                        : "ghost"
                                }
                                className="justify-start font-normal"
                                onClick={() => setStatusFilter("all")}
                            >
                                All Tasks
                            </Button>
                            <Button
                                variant={
                                    statusFilter === "pending"
                                        ? "secondary"
                                        : "ghost"
                                }
                                className="justify-start font-normal"
                                onClick={() => setStatusFilter("pending")}
                            >
                                Pending Tasks
                            </Button>
                            <Button
                                variant={
                                    statusFilter === "completed"
                                        ? "secondary"
                                        : "ghost"
                                }
                                className="justify-start font-normal"
                                onClick={() => setStatusFilter("completed")}
                            >
                                Completed Tasks
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <Table className="border rounded-lg shadow-sm">
                <TableHeader>
                    <TableRow className="bg-gradient-to-r from-muted/80 to-muted/40">
                        <TableHead className="w-[60px] font-semibold text-sm uppercase text-muted-foreground">
                            #
                        </TableHead>
                        <TableHead className="font-semibold text-sm uppercase text-muted-foreground">
                            Title
                        </TableHead>
                        <TableHead className="font-semibold text-sm uppercase text-muted-foreground">
                            Description
                        </TableHead>
                        <TableHead className="font-semibold text-sm uppercase text-muted-foreground">
                            Deadline
                        </TableHead>
                        <TableHead className="font-semibold text-sm uppercase text-muted-foreground">
                            Status
                        </TableHead>
                        <TableHead className="font-semibold text-sm uppercase text-muted-foreground">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks
                        .filter(
                            (task) =>
                                statusFilter === "all" ||
                                task.status === statusFilter,
                        )
                        .map((task) => {
                            const deadlineDate = task.deadline
                                ? new Date(task.deadline)
                                : null;
                            const isOverdue =
                                deadlineDate && deadlineDate < new Date();

                            return (
                                <TableRow
                                    key={task.id}
                                    className="group hover:bg-muted/50 transition-all duration-200"
                                >
                                    <TableCell className="font-medium text-sm text-muted-foreground/80">
                                        {tasks.indexOf(task) + 1}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm group-hover:text-primary transition-colors">
                                        {task.title}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground/80 max-w-[300px] truncate">
                                        {task.description}
                                    </TableCell>
                                    <TableCell
                                        className={`text-sm ${isOverdue && task.status !== "completed" ? "text-red-500 font-medium" : "text-muted-foreground/80"}`}
                                    >
                                        {deadlineDate
                                            ? new Date(
                                                  task.deadline,
                                              ).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                              })
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-200 
										${task.status === "completed" ? "bg-emerald-400/10 text-emerald-700 ring-1 ring-emerald-500/30 group-hover:bg-emerald-500/20" : "bg-violet-400/10 text-violet-700 ring-1 ring-violet-500/30 group-hover:bg-violet-500/20"}`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full mr-2 ${task.status === "completed" ? "bg-emerald-500" : "bg-violet-500"}`}
                                            ></span>
                                            {task.status || "pending"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() =>
                                                    handleEditClick(task)
                                                }
                                                className="p-1.5 text-green-600 hover:text-white hover:bg-green-500 rounded-md transition-all duration-200 border border-green-500/30 hover:border-green-500 hover:shadow-md hover:shadow-green-500/20"
                                            >
                                                <Check
                                                    size={16}
                                                    className="stroke-[2.5px]"
                                                />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    deleteTask(task.id)
                                                }
                                                className="p-1.5 text-red-600 hover:text-white hover:bg-red-500 rounded-md transition-all duration-200 border border-red-500/30 hover:border-red-500 hover:shadow-md hover:shadow-red-500/20"
                                            >
                                                <Trash
                                                    size={16}
                                                    className="stroke-[2.5px]"
                                                />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </>
    );
}

export default TaskList;
