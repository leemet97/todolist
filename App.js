import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  Image,
  Platform,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const scale = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(1)).current;
  const [text, setText] = useState("");
  const [todos, setTodos] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [photo, setPhoto] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setText(item.title);
    setDate(new Date(item.date));
    setPhoto(item.photos || null);
    setIsEditing(true);
    scale.setValue(0);
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
    flash.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(flash, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(flash, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const saveEdit = () => {
    flash.stopAnimation();
    flash.setValue(1);
    setTodos(
      todos.map((todo) =>
        todo.id === editingId
          ? { ...todo, title: text, date: formatDate(date), photos: photo }
          : todo
      )
    );
    setEditingId(null);
    setIsEditing(false);
    setText("");
    setPhoto(null);
  };

  const getPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("카메라 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const getGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("갤러리 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const addTodo = () => {
    flash.stopAnimation();
    flash.setValue(1);
    if (!text.trim()) return;

    const newTodo = {
      id: Date.now().toString(),
      title: text.trim(),
      date: formatDate(date),
      photos: photo,
    };
    setTodos([newTodo, ...todos]);
    setText("");
    setPhoto(null);
  };

  const removetodo = (id) => {
    setTodos(todos.filter((item) => item.id !== id));
  };

  const changeDate = (e, chDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (chDate) setDate(chDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>

      {/* 날짜 */}
      <Pressable onPress={() => setShowPicker(true)} style={styles.dateBox}>
        <Text style={styles.dateText}>{formatDate(date)}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={changeDate}
        />
      )}

      {/* 입력 */}
      <TextInput
        style={styles.input}
        placeholder="할 일을 입력하세요"
        value={text}
        onChangeText={setText}
      />

      {/* 사진 선택 */}
      <View style={styles.photoRow}>
        <Text style={styles.photoLabel}>사진 선택하기:</Text>

        <Pressable style={styles.photoButton} onPress={getPhoto}>
          <Text style={styles.photoButtonText}>카메라</Text>
        </Pressable>

        <Pressable style={styles.photoButton} onPress={getGallery}>
          <Text style={styles.photoButtonText}>갤러리</Text>
        </Pressable>
      </View>

      {/* 미리보기 */}
      <View style={styles.previewBox}>
        {photo && (
          <Animated.View style={{ opacity: flash }}>
            <Image
              source={{ uri: photo }}
              style={{ width: 120, height: 120, borderRadius: 10 }}
            />
          </Animated.View>
        )}
      </View>

      {/* 추가 버튼 */}
      <Animated.View
        style={{
          opacity: flash,
          width: "90%",
          alignItems: "center",
        }}
      >
        <Pressable
          style={styles.addBtn}
          onPress={isEditing ? saveEdit : addTodo}
        >
          <Text style={styles.addBtnText}>
            {isEditing ? "수정 후 저장하기 " : "추가하기"}
          </Text>
        </Pressable>
      </Animated.View>

      {/* 리스트 */}
      <View style={styles.listBox}>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>할 일이 없습니다.</Text>
          }
          renderItem={({ item, index }) => (
            <View style={styles.todoCard}>
              {/* 번호 + 제목 */}
              <View style={styles.titleRow}>
                <Text style={styles.todoIndex}>{index + 1}.</Text>
                <Text style={styles.todoText}>{item.title}</Text>
              </View>

              {/* 날짜 + 수정 삭제 */}
              <View style={styles.todoTopRow}>
                <Text style={styles.todoDate}>{item.date}</Text>

                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => startEdit(item)}
                    style={styles.editBtn}
                  >
                    <Text style={styles.editText}>수정</Text>
                  </Pressable>

                  <Pressable onPress={() => removetodo(item.id)}>
                    <Text style={styles.deleteText}>삭제</Text>
                  </Pressable>
                </View>
              </View>

              {/* 사진 */}
              {item.photos && (
                <Image
                  source={{ uri: item.photos }}
                  style={{
                    width: "100%",
                    height: 90,
                    borderRadius: 10,
                    marginTop: 10,
                  }}
                />
              )}
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#dcf0faff",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  dateBox: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 10,
  },

  dateText: {
    fontSize: 18,
  },

  input: {
    width: "90%",
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "70%",
    justifyContent: "space-between",
    marginTop: 1,
    marginBottom: 1,
  },

  photoLabel: {
    fontSize: 16,
  },

  photoButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 0,
  },

  photoButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff",
  },

  photoButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  previewBox: {
    marginVertical: 5,
  },

  addBtn: {
    backgroundColor: "#4da6ff",
    paddingVertical: 14,
    width: "90%",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 5,
  },

  addBtnText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

  listBox: {
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 40,
  },

  todoCard: {
    width: "100%",
    backgroundColor: "#e8f4d9",
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  todoIndex: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 6,
  },

  todoText: {
    fontSize: 18,
  },

  todoDate: {
    fontSize: 16,
    color: "#555",
  },

  todoTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  editBtn: {
    marginRight: 15,
  },

  editText: {
    color: "blue",
    fontSize: 18,
  },

  deleteText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
  },

  emptyText: {
    marginTop: 30,
    fontSize: 20,
    color: "#666",
    textAlign: "center",
  },
});
