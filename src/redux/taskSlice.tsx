import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const taskSlice = createSlice({
  name: "tasks",
  initialState: [] as Task[],
  reducers: {
    // Thêm task mới
    addTask: (state, action: PayloadAction<{ title: string; description: string }>) => {
      state.push({
        id: Date.now().toString(),
        title: action.payload.title,
        description: action.payload.description,
        completed: false,
      });
    },
    // Toggle hoàn thành
    toggleTask: (state, action: PayloadAction<string>) => {
      const task = state.find((t) => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    // Xoá task
    deleteTask: (state, action: PayloadAction<string>) => {
      return state.filter((t) => t.id !== action.payload);
    },
    // ✅ Load lại tasks từ AsyncStorage
    setTasks: (state, action: PayloadAction<Task[]>) => {
      return action.payload;
    },
  },
});

export const { addTask, toggleTask, deleteTask, setTasks } = taskSlice.actions;
export default taskSlice.reducer;
