import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { toggleTask, deleteTask, Task } from "../redux/taskSlice";
import { ThemeContext } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function TaskListScreen() {
  const tasks = useSelector((state: RootState) => state.tasks);
  const dispatch = useDispatch();
  const { theme, isDark, setIsDark } = useContext(ThemeContext);
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  // ✅ Lưu tasks xuống AsyncStorage khi thay đổi
  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const filteredTasks = tasks.filter((task: Task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  const completedCount = tasks.filter((t: Task) => t.completed).length;
  const totalCount = tasks.length;

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteTask(taskId)),
        },
      ]
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <Animated.View
      style={[
        styles.taskItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: fadeAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => dispatch(toggleTask(item.id))}
        activeOpacity={0.7}
      >
        <View style={styles.taskLeft}>
          <View
            style={[
              styles.checkbox,
              item.completed && styles.checkboxCompleted,
            ]}
          >
            {item.completed && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
          <View style={styles.taskTextContainer}>
            <Text
              style={[
                styles.taskTitle,
                item.completed && styles.taskTitleCompleted,
              ]}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.taskDescription,
                  item.completed && styles.taskDescriptionCompleted,
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <Ionicons name="checkmark-circle-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No tasks yet</Text>
      <Text style={styles.emptySubtitle}>
        {filter === "completed"
          ? "No completed tasks"
          : filter === "pending"
          ? "No pending tasks"
          : "Tap the + button to add your first task"}
      </Text>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2", "#f093fb"]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>My Tasks</Text>
              <Text style={styles.headerSubtitle}>
                {completedCount} of {totalCount} completed
              </Text>
            </View>
            <TouchableOpacity
              style={styles.themeButton}
              onPress={() => setIsDark(!isDark)}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      totalCount > 0
                        ? `${(completedCount / totalCount) * 100}%`
                        : "0%",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0}
              %
            </Text>
          </View>
        </View>

        {/* Filter */}
        <View style={styles.filterContainer}>
          {(["all", "pending", "completed"] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterButton,
                filter === filterType && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterType && styles.filterButtonTextActive,
                ]}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <View style={styles.taskListContainer}>
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id} // ✅ id là string
            renderItem={renderTaskItem}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              filteredTasks.length === 0
                ? styles.emptyContainer
                : styles.listContainer
            }
          />
        </View>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(tabs)/add-task")}
        >
          <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.fabGradient}>
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  headerSection: { marginBottom: 25 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: "rgba(255,255,255,0.8)" },
  themeButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    marginRight: 15,
  },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 4 },
  progressText: { fontSize: 14, fontWeight: "600", color: "#fff", minWidth: 40 },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  filterButtonActive: { backgroundColor: "#fff" },
  filterButtonText: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  filterButtonTextActive: { color: "#667eea" },
  taskListContainer: { flex: 1 },
  listContainer: { paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  taskItem: { marginBottom: 12 },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e1e5e9",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: { backgroundColor: "#667eea", borderColor: "#667eea" },
  taskTextContainer: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 2 },
  taskTitleCompleted: { textDecorationLine: "line-through", color: "#999" },
  taskDescription: { fontSize: 14, color: "#666", lineHeight: 18 },
  taskDescriptionCompleted: { color: "#ccc" },
  deleteButton: { padding: 8, marginLeft: 12 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", marginTop: 20, marginBottom: 8 },
  emptySubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
