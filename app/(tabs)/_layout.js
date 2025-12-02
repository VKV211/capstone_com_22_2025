import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { supabase } from "../lib/supabase";

export default function TabsLayout() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setUser(data.session.user);
      else router.replace("/StartPage");
    };
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) setUser(session.user);
        else router.replace("/StartPage");
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Logout failed", error.message);
    else router.replace("/StartPage");
  };

  const handleNavigation = (route, tabName) => {
    setActiveTab(tabName);
    router.push(route);
    // Close sidebar after navigation on mobile
    setIsSidebarOpen(false);
  };

  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={toggleSidebar}
          activeOpacity={0.1}
        />
      )}

      {/* Sidebar */}
      <View style={[styles.sidebar, isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed]}>
        {/* Sidebar Content */}
        <Animatable.View animation={isSidebarOpen ? "slideInLeft" : ""} duration={300} style={styles.sidebarContent}>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={[styles.navButton, activeTab === "home" && styles.activeNavButton]}
              onPress={() => handleNavigation("/", "home")}
            >
              <Ionicons
                name="home"
                size={20}
                color="#fff"
              />
              <Text style={[styles.navButtonText, activeTab === "home" && styles.activeNavButtonText]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, activeTab === "chat" && styles.activeNavButton]}
              onPress={() => {
                handleNavigation("/chat", "chat");
                toggleMenu("chat");
              }}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={20}
                color="#fff"
              />
              <Text style={[styles.navButtonText, activeTab === "chat" && styles.activeNavButtonText]}>
                Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, activeTab === "medicine" && styles.activeNavButton]}
              onPress={() => handleNavigation("/ms", "medicine")}
            >
              <Ionicons
                name="cloudy"
                size={20}
                color="#fff"
              />
              <Text style={[styles.navButtonText, activeTab === "medicine" && styles.activeNavButtonText]}>
                treatment
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* User Info Header with Logo and Hamburger */}
        <View style={styles.userHeader}>
          <View style={styles.headerLeft}>
            <Animatable.Text animation="fadeInLeft" duration={800} style={styles.headerLogo}>
              🌱 Smart Farmer
            </Animatable.Text>
            <TouchableOpacity style={styles.headerHamburger} onPress={toggleSidebar}>
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userContainer}>
            <Ionicons name="person-circle" size={24} color="#fff" />
            <Text style={styles.username}>{user?.email?.split("@")[0] || "User"}</Text>
          </View>
        </View>

        {/* Page Content */}
        <ScrollView contentContainerStyle={styles.content}>
          <Stack screenOptions={{ headerShown: false }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebar: {
    backgroundColor: "#10ae4aff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    elevation: 4,
    zIndex: 1000,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  sidebarOpen: {
    width: 250,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  sidebarClosed: {
    width: 0,
    overflow: 'hidden',
  },
  sidebarContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  navButtons: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    width: "100%",
  },
  activeNavButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  navButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    marginLeft: 10,
  },
  activeNavButtonText: {
    fontWeight: "bold",
  },
  submenu: {
    marginLeft: 30,
    marginTop: 5,
    marginBottom: 5,
    width: "100%",
  },
  submenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  submenuText: {
    color: "#fff",
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#10ae4aff", // Added green color to the header
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerLeft: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerHamburger: {
    padding: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  username: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 6,
    fontWeight: "500",
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
});