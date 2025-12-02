import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ChatScreen from "../(tabs)/chat";

// API keys
const GEMINI_API_KEY = "AIzaSyDxiArQ86FDJ90O0j0c8URIbK2xyemYscM";
const OPENWEATHER_KEY = "e616641ff2bafc2ab87c58aad11d3f6e";

// Endpoints
const API_ENDPOINTS = {
  GEMINI: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  DISEASE_PREDICT: "https://agri-disease-api.onrender.com/predict",
  MEDICINE_SEARCH: "https://plant-ai-finder-med.onrender.com/search",
};

// Crop types that the model was trained on
const CROP_TYPES = [
  { id: 'apple', name: 'Apple', icon: '🍎' },
  { id: 'blueberry', name: 'Blueberry', icon: '🫐' },
  { id: 'cherry', name: 'Cherry (including sour)', icon: '🍒' },
  { id: 'corn', name: 'Corn (maize)', icon: '🌽' },
  { id: 'grape', name: 'Grape', icon: '🍇' },
  { id: 'orange', name: 'Orange', icon: '🍊' },
  { id: 'peach', name: 'Peach', icon: '🍑' },
  { id: 'pepper', name: 'Pepper_bell', icon: '🫑' },
  { id: 'potato', name: 'Potato', icon: '🥔' },
  { id: 'raspberry', name: 'Raspberry', icon: '🫐' },
  { id: 'soybean', name: 'Soybean', icon: '🌱' },
  { id: 'squash', name: 'Squash', icon: '🎃' },
  { id: 'strawberry', name: 'Strawberry', icon: '🍓' },
  { id: 'tomato', name: 'Tomato', icon: '🍅' }
];

const { width, height } = Dimensions.get('window');

export default function PredictScreen() {
  // Workflow state
  const [currentStep, setCurrentStep] = useState('crop-selection'); // 'crop-selection' or 'prediction'
  const [selectedCrop, setSelectedCrop] = useState(null);
  
  // Prediction states
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [isNotLeaf, setIsNotLeaf] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Track if message is success or error
  const scrollViewRef = useRef();

  // Medicine states
  const [medicines, setMedicines] = useState([]);
  const [medicinesLoading, setMedicinesLoading] = useState(false);
  const [showMedicinesModal, setShowMedicinesModal] = useState(false);

  // Chat screen states
  const [showChatScreen, setShowChatScreen] = useState(false);
  const chatSlideAnim = useRef(new Animated.Value(height)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && gestureState.vy > 0.2;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          chatSlideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > height * 0.3 || gestureState.vy > 0.5) {
          closeChatScreen();
        } else {
          Animated.spring(chatSlideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const progressAnim = useRef(new Animated.Value(0)).current;
  const zigzagAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 5000, // Changed to 5 seconds
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Zigzag animation for progress bar
  useEffect(() => {
    const zigzagLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(zigzagAnim, {
          toValue: 10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(zigzagAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    zigzagLoop.start();
    return () => zigzagLoop.stop();
  }, []);

  // Button press animation
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Simulate loading progress with 5-second default
  const simulateLoadingProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 0.9) {
          clearInterval(interval);
          return 0.9;
        }
        return prev + 0.02; // Slower increment for 5-second duration
      });
    }, 100); // Update every 100ms
    return interval;
  };

  // Crop selection handlers
  const handleCropSelect = (crop) => {
    animateButtonPress();
    setSelectedCrop(crop);
  };

  const handleContinue = () => {
    animateButtonPress();
    if (selectedCrop) {
      setCurrentStep('prediction');
    } else {
      showErrorModal("Selection Required", "Please select a crop type to continue.", false);
    }
  };

  const handleBackToCropSelection = () => {
    animateButtonPress();
    // Reset prediction states when going back
    resetResults();
    setCurrentStep('crop-selection');
  };

  // Show error modal with custom message
  const showErrorModal = (title, message, success = false) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setIsSuccess(success);
    setErrorModalVisible(true);
  };

  // Prediction handlers
  const resetResults = () => {
    setPrediction(null);
    setSuggestion(null);
    setWeather(null);
    setSelectedImage(null);
    setModalVisible(false);
    setContentHeight(0);
    setIsNotLeaf(false);
    setPredictionError(null);
    setShowChatScreen(false);
    setMedicines([]);
    setShowMedicinesModal(false);
  };

  const pickImage = async () => {
    animateButtonPress();
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showErrorModal("Permission required", "We need access to your gallery.", false);
        return;
      }

      const mediaType =
        ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions.Images;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setIsNotLeaf(false);
        setPredictionError(null);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showErrorModal("Error", "Failed to pick image from gallery.", false);
    }
  };

  const takePhoto = async () => {
    animateButtonPress();
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showErrorModal("Permission required", "We need access to your camera.", false);
        return;
      }

      const mediaType =
        ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions.Images;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: mediaType,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setIsNotLeaf(false);
        setPredictionError(null);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      showErrorModal("Error", "Failed to take photo with camera.", false);
    }
  };

  const checkIfLeaf = async (base64Image) => {
    try {
      console.log("Checking if image is a leaf...");
      const prompt = `You are a plant expert. Analyze this image and determine if it shows a plant leaf.

Focus on these characteristics:
- Green coloration (various shades typical of leaves)
- Flat, thin structure with visible veins
- Typical leaf shapes (oval, lanceolate, cordate, etc.)
- Smooth or slightly textured surface
- Smooth or serrated edges

Respond with ONLY "LEAF" if it's clearly a plant leaf, or "NOT_LEAF" if it's not.
If you're unsure or confidence is low, respond with "NOT_LEAF".`;

      const body = {
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            ],
          },
        ],
      };

      const res = await fetch(API_ENDPOINTS.GEMINI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const json = await res.json();
      const responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
      console.log("Leaf check response:", responseText);
      
      return responseText === "LEAF";
    } catch (err) {
      console.warn("Leaf check failed:", err);
      return false;
    }
  };

  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return null;
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_KEY}&units=metric`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Weather API error");
      return {
        temp: data.main.temp,
        humidity: data.main.humidity,
        condition: data.weather?.[0]?.description || "",
        location: data.name || "",
      };
    } catch (err) {
      console.warn("Weather fetch failed:", err);
      return null;
    }
  };

  const predictDisease = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      console.log("Sending request to disease prediction API...");
      const res = await fetch(API_ENDPOINTS.DISEASE_PREDICT, {
        method: "POST",
        body: formData,
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error (${res.status}): ${errorText || "Unknown error"}`);
      }
      
      const data = await res.json();
      console.log("API Response Data:", data);
      return data;
    } catch (err) {
      console.error("Disease prediction error:", err);
      throw err;
    }
  };

  const fetchSuggestionFromGemini = async (diseaseName, weatherData) => {
    try {
      const isHealthy = String(diseaseName || "").toLowerCase().includes("healthy");
      
      let prompt;
      if (isHealthy) {
        prompt = weatherData
          ? `The crop is healthy. Current weather in ${weatherData.location}: ${weatherData.condition}, temperature ${weatherData.temp}°C, humidity ${weatherData.humidity}%. 
          
          Provide weather-based precautions in this specific format:
          • [Main precaution based on current weather]
          1. [First specific action]
          2. [Second specific action]
          3. [Third specific action]
          
          Keep it simple and easy to understand for farmers.`
          : `The crop is healthy. Provide general precautions in this specific format:
          • [Main general precaution]
          1. [First specific action]
          2. [Second specific action]
          3. [Third specific action]
          
          Keep it simple and easy to understand for farmers.`;
      } else {
        prompt = `Detected disease: ${diseaseName}. Provide treatment recommendations in this specific format:
        • [Main treatment approach]
        1. [First specific treatment step]
        2. [Second specific treatment step]
        3. [Third specific treatment step]
        
        Keep it simple and easy to understand for farmers.`;
      }

      const body = { contents: [{ parts: [{ text: prompt }] }] };
      const res = await fetch(API_ENDPOINTS.GEMINI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      return (
        json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "No suggestion available."
      );
    } catch (err) {
      console.warn("Gemini suggestion error:", err);
      return "Failed to fetch suggestion.";
    }
  };

  // Function to fetch medicines based on disease name
  const fetchMedicinesByDisease = async (diseaseName) => {
    if (!diseaseName) return;
    
    animateButtonPress();
    setMedicinesLoading(true);
    const progressInterval = simulateLoadingProgress();
    
    try {
      // Extract disease name without crop prefix
      // First, split by "___" to separate crop from disease
      const parts = diseaseName.split('___');
      let cleanDiseaseName = '';
      
      if (parts.length > 1) {
        // Take the second part (disease name) and replace underscores with spaces
        cleanDiseaseName = parts[1].replace(/_/g, " ");
      } else {
        // If the format is different, try the old method
        cleanDiseaseName = diseaseName.replace(/^[^_]+___/, "").replace(/_/g, " ");
      }
      
      console.log("Original disease name:", diseaseName);
      console.log("Cleaned disease name:", cleanDiseaseName);
      
      const response = await fetch(`${API_ENDPOINTS.MEDICINE_SEARCH}?query=${encodeURIComponent(cleanDiseaseName)}`);
      const data = await response.json();
      
      console.log("Medicines API response:", data);
      
      if (data.results && data.results.length > 0) {
        setMedicines(data.results);
        setShowMedicinesModal(true);
      } else {
        // Try with just the first word of the disease name
        const firstWord = cleanDiseaseName.split(' ')[0];
        console.log("Trying with first word:", firstWord);
        
        const fallbackResponse = await fetch(`${API_ENDPOINTS.MEDICINE_SEARCH}?query=${encodeURIComponent(firstWord)}`);
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.results && fallbackData.results.length > 0) {
          setMedicines(fallbackData.results);
          setShowMedicinesModal(true);
        } else {
          showErrorModal("No Medicines Found", `No medicines found for "${cleanDiseaseName}". Try searching for a more general term.`, false);
        }
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      showErrorModal("Error", "Failed to fetch medicines. Please try again.", false);
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(1);
      setTimeout(() => {
        setMedicinesLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  // Improved validation function to handle cases like "Pepper,_bell___healthy"
  const validatePrediction = (prediction, confidence) => {
    // Check if confidence is less than 70%
    if (parseFloat(confidence) < 70) {
      return {
        isValid: false,
        error: "Low confidence",
        message: "We're not confident enough to identify disease. Please try again with a clearer image."
      };
    }

    // Extract crop name from prediction
    const predictionLower = prediction.toLowerCase();
    const selectedCropId = selectedCrop.id;
    const selectedCropName = selectedCrop.name.toLowerCase();
    
    // Check if the selected crop ID is in the prediction string
    // This handles cases like "Pepper,_bell___healthy" where the crop ID is embedded
    const containsCropId = predictionLower.includes(selectedCropId);
    
    // Also check if the crop name is in the prediction
    const containsCropName = predictionLower.includes(selectedCropName);
    
    // If neither the crop ID nor the crop name is found, it's a mismatch
    if (!containsCropId && !containsCropName) {
      return {
        isValid: false,
        error: "Crop mismatch",
        message: `The detected disease doesn't match the selected crop (${selectedCrop.name}). Please select the correct crop type or try again with a different image.`
      };
    }

    return { isValid: true };
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      showErrorModal("No Image", "Please select or capture an image first.", false);
      return;
    }
    
    animateButtonPress();
    setLoading(true);
    setIsNotLeaf(false);
    setPredictionError(null);
    const progressInterval = simulateLoadingProgress();
    
    try {
      console.log("Starting image upload process...");
      
      const isLeaf = await checkIfLeaf(selectedImage.base64);
      console.log("Leaf check result:", isLeaf);
      
      if (!isLeaf) {
        console.log("Image is not a leaf, showing message...");
        clearInterval(progressInterval);
        setLoadingProgress(1);
        setTimeout(() => {
          setLoading(false);
          setLoadingProgress(0);
        }, 500);
        setIsNotLeaf(true);
        
        showErrorModal(
          "Invalid Image", 
          "This doesn't appear to be a plant leaf. Please upload a valid crop leaf image.",
          false
        );
        return;
      }

      console.log("Image is a leaf, proceeding with disease prediction...");
      
      const weatherData = await fetchWeather();
      setWeather(weatherData);

      const manipResult = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      let file;
      if (Platform.OS === "web") {
        try {
          const response = await fetch(manipResult.uri);
          const blob = await response.blob();
          file = new File([blob], "plant.jpg", { type: "image/jpeg" });
        } catch (error) {
          console.error("Error creating file object for web:", error);
          throw new Error("Failed to process image for web");
        }
      } else {
        file = {
          uri: manipResult.uri,
          name: "plant.jpg",
          type: "image/jpeg",
        };
      }

      const data = await predictDisease(file);

      if (data && (data.prediction || data.disease)) {
        const diseaseName = data.prediction || data.disease;
        const confidenceValue = data.confidence || 0;
        
        // Validate the prediction
        const validation = validatePrediction(diseaseName, confidenceValue);
        
        if (!validation.isValid) {
          setPredictionError(validation);
          clearInterval(progressInterval);
          setLoadingProgress(1);
          setTimeout(() => {
            setLoading(false);
            setLoadingProgress(0);
          }, 500);
          showErrorModal(
            validation.error,
            validation.message,
            false
          );
          return;
        }
        
        setPrediction(diseaseName);
        setModalVisible(true);
        setSuggestion(null);
        clearInterval(progressInterval);
        setLoadingProgress(1);
        setTimeout(() => {
          setLoading(false);
          setLoadingProgress(0);
        }, 500);
        showErrorModal("Success", "Prediction ready. Tap 'Get Suggestion' for guidance.", true);
      } else {
        console.error("Invalid prediction data:", data);
        throw new Error("Invalid prediction data received from server");
      }
    } catch (err) {
      console.error("Upload error:", err);
      clearInterval(progressInterval);
      setLoadingProgress(1);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
      showErrorModal("Error", err.message || "Something went wrong during prediction.", false);
    }
  };

  const onGetSuggestionPressed = async () => {
    if (!prediction) return;
    animateButtonPress();
    setLoading(true);
    const progressInterval = simulateLoadingProgress();
    
    try {
      const aiText = await fetchSuggestionFromGemini(prediction, weather);
      setSuggestion(aiText);
      clearInterval(progressInterval);
      setLoadingProgress(1);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
      showErrorModal("Suggestions Ready", "Guidance loaded successfully.", true);
    } catch (err) {
      console.error("Suggestion error:", err);
      clearInterval(progressInterval);
      setLoadingProgress(1);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
      showErrorModal("Error", "Failed to fetch suggestions.", false);
    }
  };

  // Chat screen functions
  const openChatWithExpert = () => {
    animateButtonPress();
    // Animate the chat screen sliding up
    Animated.spring(chatSlideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
    
    setShowChatScreen(true);
  };

  const closeChatScreen = () => {
    animateButtonPress();
    // Animate the chat screen sliding down
    Animated.spring(chatSlideAnim, {
      toValue: height,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start(() => {
      setShowChatScreen(false);
    });
  };

  // Parse suggestion text to format it properly
  const parseSuggestion = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n').filter(line => line.trim());
    const result = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('•')) {
        result.push({ type: 'bullet', text: trimmedLine.substring(1).trim() });
      } else if (/^\d+\./.test(trimmedLine)) {
        result.push({ type: 'number', text: trimmedLine.replace(/^\d+\.\s*/, '') });
      } else {
        result.push({ type: 'text', text: trimmedLine });
      }
    });
    
    return result;
  };

  // Render medicine item
  const renderMedicineItem = ({ item }) => (
    <View style={styles.medicineCard}>
      <View style={styles.medicineContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.medicineImage} />
        </View>
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineTitle}>{item.title}</Text>
          <Text style={styles.medicineSubtitle}>{item.subtitle}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
          </View>
          <Text style={styles.medicineDescription} numberOfLines={3}>{item.description}</Text>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => {
              // Open the store URL in a browser
              if (item.storeUrl) {
                Linking.openURL(item.storeUrl).catch(err => {
                  console.error("Failed to open URL:", err);
                  showErrorModal("Error", "Could not open store link", false);
                });
              } else {
                showErrorModal("Error", "Store link not available", false);
              }
            }}
          >
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render crop selection cards
  const renderCropItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.cropItem,
        selectedCrop?.id === item.id && styles.selectedCropItem
      ]}
      onPress={() => handleCropSelect(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.cropIcon}>{item.icon}</Text>
      <Text style={styles.cropName}>{item.name}</Text>
      {selectedCrop?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  // Render crop selection screen
  const renderCropSelectionScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Select Crop Type</Text>
        <Text style={styles.subtitle}>Choose the crop you want to analyze for disease detection</Text>
      </View>

      <View style={styles.selectionContainer}>
        <FlatList
          data={CROP_TYPES}
          renderItem={renderCropItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.cropList}
        />
      </View>

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedCrop && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedCrop}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // Render prediction screen
  const renderPredictionScreen = () => (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>🌱 Plant Disease Detector</Text>
          <Text style={styles.subtitle}>Upload a clear image of your {selectedCrop?.name || ""} leaf for AI-powered disease detection</Text>
        </View>

        {/* Selected Crop Display */}
        {selectedCrop && (
          <View style={styles.selectedCropContainer}>
            <Text style={styles.selectedCropLabel}>Selected Crop:</Text>
            <View style={styles.selectedCropInfo}>
              <Text style={styles.selectedCropIcon}>{selectedCrop.icon}</Text>
              <Text style={styles.selectedCropName}>{selectedCrop.name}</Text>
            </View>
            <TouchableOpacity 
              style={styles.changeCropButton} 
              onPress={handleBackToCropSelection}
              activeOpacity={0.8}
            >
              <Text style={styles.changeCropText}>Change Crop</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions Card */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>How to Take a Good Photo</Text>
          <View style={styles.instructionList}>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.instructionText}>Ensure good lighting conditions</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.instructionText}>Focus on a single leaf with visible symptoms</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.instructionText}>Avoid shadows and blurry images</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.instructionText}>Include both top and bottom of the leaf if possible</Text>
            </View>
          </View>
        </View>

        {/* Image Selection Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Select Image</Text>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage} activeOpacity={0.8}>
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto} activeOpacity={0.8}>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.changeImageButton} 
                onPress={() => {
                  setSelectedImage(null);
                  setIsNotLeaf(false);
                  setPredictionError(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Prediction Button */}
        {selectedImage && (
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={[styles.predictButton, loading && styles.disabledButton]} 
              onPress={uploadImage} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.predictButtonText}>Analyze Image</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Loading Progress Bar with Zigzag Animation */}
        {loading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${loadingProgress * 100}%`,
                    transform: [{ translateX: zigzagAnim }]
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>Processing... {Math.round(loadingProgress * 100)}%</Text>
          </View>
        )}

        {/* Error Message */}
        {isNotLeaf && (
          <View style={styles.notLeafMessage}>
            <Text style={styles.notLeafEmoji}>👎</Text>
            <Text style={styles.notLeafText}>This doesn't appear to be a plant leaf. Please upload a valid crop leaf image.</Text>
          </View>
        )}

        {/* Prediction Error Message */}
        {predictionError && (
          <View style={styles.errorMessage}>
            <Text style={styles.errorEmoji}>👎</Text>
            <Text style={styles.errorText}>{predictionError.message}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        )}

        {/* Results Section - Displayed inline instead of in a modal */}
        {prediction && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>📊 Prediction Results</Text>
            
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Crop Type:</Text>
              <Text style={styles.resultText}>{selectedCrop.name}</Text>
              
              <Text style={styles.resultLabel}>Disease:</Text>
              <Text style={styles.resultText}>{prediction}</Text>
            </View>

            {selectedImage && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.resultImage} />
              </View>
            )}

            {weather && (
              <View style={styles.weatherBox}>
                <Text style={styles.weatherTitle}>🌤 Current Weather</Text>
                <Text>Location: {weather.location || "Unknown"}</Text>
                <Text>Temp: {weather.temp ?? "N/A"}°C</Text>
                <Text>Humidity: {weather.humidity ?? "N/A"}%</Text>
                <Text>Condition: {weather.condition || "Unknown"}</Text>
              </View>
            )}

            {!suggestion && (
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity style={styles.suggestionButton} onPress={onGetSuggestionPressed} activeOpacity={0.8}>
                  <Text style={styles.suggestionButtonText}>
                    {String(prediction || "").toLowerCase().includes("healthy") ? "Get Precautions" : "Get Treatment"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {suggestion && (
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionTitle}>
                  {String(prediction || "").toLowerCase().includes("healthy") ? "Farmer Precautions" : "Farmer Treatments"}
                </Text>
                
                {parseSuggestion(suggestion).map((item, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    {item.type === 'bullet' && (
                      <View style={styles.bulletItem}>
                        <Text style={styles.bulletSymbol}>•</Text>
                        <Text style={styles.bulletText}>{item.text}</Text>
                      </View>
                    )}
                    {item.type === 'number' && (
                      <View style={styles.numberItem}>
                        <Text style={styles.numberSymbol}>{index}</Text>
                        <Text style={styles.numberText}>{item.text}</Text>
                      </View>
                    )}
                    {item.type === 'text' && (
                      <Text style={styles.suggestionText}>{item.text}</Text>
                    )}
                  </View>
                ))}

                <View style={styles.actionButtons}>
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity style={styles.chatButton} onPress={openChatWithExpert} activeOpacity={0.8}>
                      <Ionicons name="people" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Chat with Expert</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            )}

            {/* Related Medicines Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.medicinesButton} 
                onPress={() => fetchMedicinesByDisease(prediction)}
                disabled={medicinesLoading}
                activeOpacity={0.8}
              >
                {medicinesLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="medkit" size={20} color="#fff" />
                    <Text style={styles.medicinesButtonText}>Related Medicines</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Loading Progress Bar for Medicines with Zigzag Animation */}
            {medicinesLoading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${loadingProgress * 100}%`,
                        transform: [{ translateX: zigzagAnim }]
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>Fetching medicines... {Math.round(loadingProgress * 100)}%</Text>
              </View>
            )}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity style={styles.resetButton} onPress={resetResults} activeOpacity={0.8}>
                <Text style={styles.resetButtonText}>Start New Analysis</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </ScrollView>

      {/* Chat Screen Component with Animation */}
      {showChatScreen && (
        <Animated.View 
          style={[
            styles.chatScreenContainer,
            {
              transform: [{ translateY: chatSlideAnim }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.chatScreenHeader}>
            <TouchableOpacity style={styles.closeChatButton} onPress={closeChatScreen} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.chatScreenTitle}>👨‍🌾 Expert Consultation</Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* Disease Info Card */}
          <View style={styles.diseaseInfoCard}>
            <View style={styles.diseaseInfoHeader}>
              <Text style={styles.diseaseInfoTitle}>Disease Information</Text>
            </View>
            <View style={styles.diseaseInfoContent}>
              <View style={styles.diseaseInfoRow}>
                <Text style={styles.diseaseInfoLabel}>Crop:</Text>
                <Text style={styles.diseaseInfoValue}>{selectedCrop?.name || "Unknown"}</Text>
              </View>
              <View style={styles.diseaseInfoRow}>
                <Text style={styles.diseaseInfoLabel}>Disease:</Text>
                <Text style={styles.diseaseInfoValue}>{prediction}</Text>
              </View>
              {weather && (
                <View style={styles.diseaseInfoRow}>
                  <Text style={styles.diseaseInfoLabel}>Weather:</Text>
                  <Text style={styles.diseaseInfoValue}>{weather.condition}, {weather.temp}°C</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Chat Screen Component */}
          <ChatScreen 
            disease={prediction} 
            weather={weather}
            image={selectedImage}
            onClose={closeChatScreen}
          />
        </Animated.View>
      )}

      {/* Medicines Modal */}
      <Modal
        visible={showMedicinesModal}
        animationType="slide"
        onRequestClose={() => setShowMedicinesModal(false)}
      >
        <View style={styles.medicinesModalContainer}>
          <View style={styles.medicinesModalHeader}>
            <TouchableOpacity 
              style={styles.closeMedicinesButton} 
              onPress={() => setShowMedicinesModal(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.medicinesModalTitle}>Related Medicines</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.medicinesModalContent}>
            {medicinesLoading ? (
              <View style={styles.medicinesLoadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.medicinesLoadingText}>Loading medicines...</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${loadingProgress * 100}%`,
                          transform: [{ translateX: zigzagAnim }]
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>Fetching... {Math.round(loadingProgress * 100)}%</Text>
                </View>
              </View>
            ) : (
              <FlatList
                data={medicines}
                renderItem={renderMedicineItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.medicinesList}
                ListEmptyComponent={
                  <View style={styles.medicinesEmptyContainer}>
                    <Text style={styles.medicinesEmptyText}>No medicines found</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal transparent visible={errorModalVisible} animationType="fade" onRequestClose={() => setErrorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.errorModalContent}>
            <View style={styles.errorModalHeader}>
              <Text style={styles.errorModalEmoji}>{isSuccess ? "👍" : "👎"}</Text>
              <Text style={styles.errorModalTitle}>{errorTitle}</Text>
            </View>
            <Text style={styles.errorModalMessage}>{errorMessage}</Text>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.errorModalButton} 
                onPress={() => setErrorModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.errorModalButtonText}>OK</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );

  // Render the appropriate screen based on current step
  return currentStep === 'crop-selection' 
    ? renderCropSelectionScreen() 
    : renderPredictionScreen();
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F7FA"
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40
  },
  
  // Header
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#2C3E50",
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: "#7F8C8D", 
    textAlign: "center" 
  },
  
  // Crop Selection Screen
  selectionContainer: {
    flex: 1,
    marginVertical: 20,
  },
  cropList: {
    paddingBottom: 20,
  },
  cropItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    width: "45%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCropItem: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  cropIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cropName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  
  // Selected Crop Display
  selectedCropContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCropLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  selectedCropInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  selectedCropIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  selectedCropName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  changeCropButton: {
    alignSelf: "flex-start",
  },
  changeCropText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  
  // Instruction Card
  instructionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  instructionList: {
    gap: 8,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructionText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  
  // Image Section
  imageSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  imageButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  imagePreview: { 
    width: 250, 
    height: 250, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  changeImageButton: {
    marginTop: 12,
  },
  changeImageText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  
  // Predict Button
  predictButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  predictButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  
  // Progress Bar with Zigzag Animation
  progressContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  
  // Error Messages
  notLeafMessage: {
    backgroundColor: "#FFEBEE",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  notLeafEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  notLeafText: {
    color: "#C62828",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  errorMessage: {
    backgroundColor: "#FFEBEE",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  
  // Loading
  loadingContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },
  
  // Results Section (inline instead of modal)
  resultsSection: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  resultText: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12
  },
  imageContainer: { 
    alignItems: "center", 
    marginVertical: 16 
  },
  resultImage: { 
    width: 200, 
    height: 200, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  weatherBox: { 
    backgroundColor: "#F0F9FF",
    padding: 16, 
    borderRadius: 8,
    marginBottom: 16 
  },
  weatherTitle: { 
    fontWeight: "bold", 
    marginBottom: 8,
    color: "#1F2937"
  },
  suggestionButton: {
    backgroundColor: "#FF9800",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  suggestionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  suggestionBox: { 
    backgroundColor: "#FFF8E1", 
    padding: 16, 
    borderRadius: 8,
    marginBottom: 16 
  },
  suggestionTitle: { 
    fontWeight: "bold", 
    marginBottom: 12,
    color: "#1F2937",
    fontSize: 16
  },
  suggestionItem: {
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletSymbol: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9800",
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  numberItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  numberSymbol: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF9800",
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 24,
    marginRight: 8,
    marginTop: 2,
  },
  numberText: {
    flex: 1,
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  suggestionText: { 
    fontSize: 14, 
    marginVertical: 4,
    color: "#4B5563"
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  chatButton: {
    backgroundColor: "#3F51B5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    width: "100%",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  
  // Medicines Button
  medicinesButton: {
    backgroundColor: "#9C27B0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  medicinesButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  
  // Medicines Modal
  medicinesModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  medicinesModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#9C27B0",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  closeMedicinesButton: {
    padding: 8,
    borderRadius: 20,
  },
  medicinesModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  medicinesModalContent: {
    flex: 1,
    padding: 16,
  },
  medicinesLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  medicinesLoadingText: {
    marginTop: 12,
    color: "#6B7280",
  },
  medicinesList: {
    paddingBottom: 20,
  },
  medicinesEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  medicinesEmptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  
  // Medicine Card
  medicineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    overflow: "hidden",
  },
  medicineContent: {
    flexDirection: "row",
    padding: 15,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 15,
  },
  medicineImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  medicineInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  medicineTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  medicineSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f39c12",
  },
  reviewsText: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  medicineDescription: {
    fontSize: 13,
    color: "#34495e",
    marginBottom: 10,
    lineHeight: 18,
  },
  buyButton: {
    backgroundColor: "#3498db",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  
  resetButton: {
    backgroundColor: "#F44336",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  
  // Chat Screen Container with Animation
  chatScreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 1000,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  chatScreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#27AE60",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeChatButton: {
    padding: 8,
    borderRadius: 20,
  },
  chatScreenTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  
  // Disease Info Card in Chat
  diseaseInfoCard: {
    backgroundColor: "#F8F9FA",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  diseaseInfoHeader: {
    backgroundColor: "#27AE60",
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  diseaseInfoTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  diseaseInfoContent: {
    padding: 12,
  },
  diseaseInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  diseaseInfoLabel: {
    fontWeight: "bold",
    color: "#2C3E50",
    flex: 1,
  },
  diseaseInfoValue: {
    color: "#2C3E50",
    flex: 2,
    textAlign: "right",
  },
  
  // Error Modal
  modalOverlay: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },
  errorModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: "85%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  errorModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  errorModalEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  errorModalMessage: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  errorModalButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  errorModalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});