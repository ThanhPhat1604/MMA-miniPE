import React, { useContext, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { addTask } from "../redux/taskSlice";
import { ThemeContext } from "../context/ThemeContext";
import { useRouter } from "expo-router";
// ❌ Nếu bạn dùng Expo Router thì bỏ hết phần navigation prop
// import { StackNavigationProp } from "@react-navigation/stack";
// import { RootStackParamList } from "../navigation/types";
// type AddTaskScreenNavigationProp = StackNavigationProp<RootStackParamList, "AddTask">;
// type Props = { navigation: AddTaskScreenNavigationProp; };

export default function AddTaskScreen(/* { navigation }: Props */) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
   const router = useRouter();

  const handleSave = () => {
    if (title.trim()) {
      dispatch(addTask({ title, description: desc }));
    router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Add New Task</Text>
      <TextInput
        placeholder="Title"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
        style={[styles.input, { color: theme.text, borderColor: theme.text }]}
      />
      <TextInput
        placeholder="Description"
        placeholderTextColor="#888"
        value={desc}
        onChangeText={setDesc}
        style={[styles.input, { color: theme.text, borderColor: theme.text }]}
      />
      <Button title="Save Task" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, marginBottom: 20, fontWeight: "bold" },
  input: { borderBottomWidth: 1, marginBottom: 15, fontSize: 16, padding: 8 },
});
