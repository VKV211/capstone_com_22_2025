import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Auto-dismiss error message after 2 seconds
  useEffect(() => {
    if (showError) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowError(false));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showError, fadeAnim]);

  // Email validation function
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Password validation function
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    // Reset error state
    setShowError(false);
    setErrorMessage("");

    // Validate inputs
    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      setShowError(true);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      setShowError(true);
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage("Password must be at least 6 characters.");
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Incorrect email or password. Please check your credentials and try again.");
          setShowError(true);
        } else {
          setErrorMessage(error.message);
          setShowError(true);
        }
        throw error;
      }

      router.replace("/(tabs)/");
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/wf.jpg")}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={2}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Back Link */}
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.replace("/StartPage")}
          >
            <Ionicons name="chevron-back" size={16} color="#fff" />
            <Text style={styles.backLinkText}>back</Text>
          </TouchableOpacity>

          {/* Main Login Container with Glass Effect */}
          <View style={styles.loginContainer}>
            {/* Glass Effect Overlay */}
            <View style={styles.glassOverlay} />

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Logo/Icon Area */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="person" size={40} color="#333" />
                </View>
              </View>

              {/* Welcome Text */}
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>Sign in to continue</Text>

              {/* Error Message */}
              {showError && (
                <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
                  <Ionicons name="warning" size={20} color="#fff" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </Animated.View>
              )}

              {/* Form Container */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color="#555" 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    placeholder="Email address"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#666"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color="#555" 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    placeholder="Password"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#666"
                  />
                </View>

                {/* Login Button */}
                <TouchableOpacity 
                  style={[styles.loginButton, isLoading && styles.buttonDisabled]} 
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Sign Up Link */}
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                    <Text style={styles.signupLink}>Create one</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  backLink: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backLinkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 2,
  },
  loginContainer: {
    borderRadius: 25,
    marginHorizontal: 20,
    maxWidth: 400,
    width: width - 40,
    alignSelf: "center",
    overflow: "hidden",
    position: "relative",
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  contentContainer: {
    padding: 30,
    position: "relative",
    zIndex: 1,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  loginButton: {
    backgroundColor: "rgba(0, 122, 255, 0.85)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.3)",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "rgba(160, 196, 255, 0.7)",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  dividerText: {
    paddingHorizontal: 15,
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
  },
  signupLink: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});