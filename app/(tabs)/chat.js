// ChatScreen.js
import { useEffect, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";

const expertId = "2b700556-7992-4001-9f00-3d5aaa84cd8f";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(null); // Automatically set from session

  // Get logged-in user ID from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) console.log("Error getting user:", error);
        else if (user) setUserId(user.id); // Set userId automatically
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  // Fetch messages for this user
  const fetchMessages = async () => {
    if (!userId) return; // Wait until userId is available

    try {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: true });

      if (error) console.log("Error fetching messages:", error);
      else setMessages(data);
    } catch (err) {
      console.log(err);
    }
  };

  // Poll messages every 2 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    try {
      const { data, error } = await supabase.from("chats").insert([
        {
          sender_id: userId,
          receiver_id: expertId,
          message: newMessage.trim(),
        },
      ]);

      if (error) console.log("Error sending message:", error);
      else setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  // Render individual messages
  const renderMessage = ({ item }) => {
    const isExpert = item.sender_id === expertId;
    return (
      <View
        style={[
          styles.messageContainer,
          isExpert ? styles.expertMsg : styles.userMsg,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  chatContainer: { padding: 10 },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  userMsg: { backgroundColor: "#D0E6FF", alignSelf: "flex-end" },
  expertMsg: { backgroundColor: "#C6F6D5", alignSelf: "flex-start" },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 10, color: "#555", marginTop: 2, textAlign: "right" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007BFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
});
