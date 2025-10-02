import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { toggleTask, deleteTask, Task } from "../redux/taskSlice";
import { ThemeContext } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function TaskListScreen() {
  const tasks = useSelector((state: RootState) => state.tasks);
  const dispatch = useDispatch();
  const { theme, isDark, setIsDark } = useContext(ThemeContext);
  const router = useRouter(); // ✅ Hook để điều hướng

  // ✅ Lưu tasks xuống AsyncStorage khi thay đổi
  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>
        Task List ({tasks.filter((t: Task) => t.completed).length}/{tasks.length})
      </Text>

      {/* ✅ Chuyển từ navigation.navigate -> router.push */}
      <Button title="Add Task" onPress={() => router.push("/(tabs)/add-task")} />
      <Button
        title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        onPress={() => setIsDark(!isDark)}
      />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: Task }) => (
          <TouchableOpacity
            onPress={() => dispatch(toggleTask(item.id))}
            onLongPress={() => dispatch(deleteTask(item.id))}
          >
            <Text
              style={{
                color: theme.text,
                textDecorationLine: item.completed ? "line-through" : "none",
                marginVertical: 8,
                fontSize: 16,
              }}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, marginBottom: 10, fontWeight: "bold" },
});
