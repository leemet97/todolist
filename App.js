import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  Image,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
//설치해야함:npx expo install expo-image-picker

export default function App() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState([]);
  const [date, setDate] = useState(new Date()); //현재날씨 기초값
  const [showPicker, setShowPicker] = useState(false); //날짜 피커보여주기
  const [photo, setPhoto] = useState(null);

  //날짜 형식 만들기
  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // 카메라 촬영
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

    if (result.canceled) return;

    const uri = result.assets[0].uri;

    setPhoto(uri);
  };

  // 갤러리에서 선택
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

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setPhoto(uri);
  };

  // Todo 추가
  const addTodo = () => {
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
  // Todo 삭제
  const removetodo = (id) => {
    setTodos(todos.filter((item) => item.id !== id));
  };
  //날짜 변경
  const changeDate = (e, chDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (chDate) {
      setDate(chDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>

      {/* 날짜 선택 */}
      <Pressable onPress={() => setShowPicker(true)}>
        <Text style={styles.dateDisplay}>{formatDate(date)}</Text>
      </Pressable>

      {/* 입력 + 추가 버튼 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="할 일을 입력하세요"
          value={text}
          onChangeText={setText}
        />

        <Pressable style={styles.addBtn} onPress={addTodo}>
          <Text style={styles.addBtnText}>추가</Text>
        </Pressable>
      </View>

      {/* 날짜 선택 박스 */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={changeDate}
        />
      )}

      {/* 카메라/갤러리 버튼 */}
      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>사진 선택하기</Text>

        <View style={styles.photoButtonRow}>
          <Pressable style={styles.cameraButton} onPress={getPhoto}>
            <Text style={styles.photoButtonText}> 카메라</Text>
          </Pressable>

          <Pressable style={styles.photoButton} onPress={getGallery}>
            <Text style={styles.photoButtonText}> 갤러리</Text>
          </Pressable>
        </View>
      </View>

      {/* 사진 미리보기 */}
      <View style={styles.previewBox}>
        {photo && (
          <Image
            source={{ uri: photo }}
            style={{ width: 120, height: 120, marginTop: 10, borderRadius: 10 }}
          />
        )}
      </View>

      {/* Todo 리스트 */}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>할 일이 없습니다.</Text>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onLongPress={() => removetodo(item.id)}
            style={styles.todoItem}
          >
            <Text style={styles.todoIndex}>{index + 1}.</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.todoText}>{item.title}</Text>
              <Text style={styles.todoDate}>{item.date}</Text>
            </View>

            {item.photos && (
              <Image
                source={{ uri: item.photos }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  marginLeft: 10,
                }}
              />
            )}

            <Text style={styles.deleteHint}>삭제</Text>
          </Pressable>
        )}
      />
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
    marginBottom: 30,
    color: "#333",
  },

  dateDisplay: {
    fontSize: 18,
    marginBottom: 15,
    left: 0,
  },

  inputRow: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  input: {
    width: 250,
    padding: 12,
    borderWidth: 1,
    borderColor: "#383737ff",
    borderRadius: 10,
    backgroundColor: "#fcf5f5ff",
    marginRight: 10,
  },

  addBtn: {
    backgroundColor: "#4da6ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  addBtnText: {
    color: "white",
    fontWeight: "bold",
  },
  photoButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 10,
  },
  cameraButton: {
    backgroundColor: "#c4e8f7ff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  photoButton: {
    backgroundColor: "#fdeaeaff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyText: {
    marginTop: 40,
    color: "#757272ff",
    fontSize: 19,
  },

  todoItem: {
    width: 300,
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "#e2f1d5ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  todoIndex: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },

  todoText: {
    flex: 1,
    fontSize: 16,
  },
  todoDate: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#d4e49dff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteHint: {
    fontSize: 12,
    color: "#302d2dff",
  },
});
