import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from "react-native";

export default function MedicineSearch() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortOptions, setSortOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("default");
  const [loading, setLoading] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories and sort options on component mount
  useEffect(() => {
    fetchCategoriesAndSorts();
    handleSearch("all"); // Load all medicines initially
  }, []);

  // Fetch medicines when category or sort changes
  useEffect(() => {
    if (selectedCategory !== "all") {
      handleSearch(selectedCategory);
    } else {
      handleSearch("all");
    }
  }, [selectedCategory, selectedSort]);

  const fetchCategoriesAndSorts = async () => {
    try {
      // Since there's no direct endpoint for categories, we'll use a static approach
      // based on the JSON structure provided
      const staticCategories = [
        { id: "all", name: "All", icon: "apps-outline", color: "#059669" },
        { id: "fungal", name: "Fungal", icon: "water-outline", color: "#3b82f6" },
        { id: "bacterial", name: "Bacterial", icon: "bug-outline", color: "#f59e0b" },
        { id: "viral", name: "Viral", icon: "radio-outline", color: "#ec4899" },
        { id: "pest", name: "Pest", icon: "flash-outline", color: "#ef4444" },
        { id: "healthy", name: "Healthy", icon: "checkmark-circle-outline", color: "#10b981" }
      ];

      const staticSorts = [
        { id: "default", name: "Default", icon: "list-outline" },
        { id: "rating", name: "Top Rated", icon: "star-outline" },
        { id: "reviews", name: "Most Reviews", icon: "chatbubble-outline" },
        { id: "name_az", name: "Name: A to Z", icon: "text-outline" },
        { id: "name_za", name: "Name: Z to A", icon: "text-outline" }
      ];

      setCategories(staticCategories);
      setSortOptions(staticSorts);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim() && searchQuery !== "all") return;

    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = "https://plant-ai-finder-med.onrender.com/search";
      const response = await fetch(`${API_BASE_URL}?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.message) {
        setMedicines([]);
      } else {
        let results = data.results || [];
        // Apply sorting if needed
        if (selectedSort !== "default") {
          results = sortMedicines(results, selectedSort);
        }
        setMedicines(results);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      setError("Failed to fetch medicines. Please try again.");
      Alert.alert("Error", "Failed to fetch medicines. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sortMedicines = (medicinesList, sortType) => {
    const sorted = [...medicinesList];
    
    switch (sortType) {
      case "rating":
        return sorted.sort((a, b) => {
          return parseFloat(b.rating) - parseFloat(a.rating);
        });
      case "reviews":
        return sorted.sort((a, b) => {
          return parseInt(b.reviews) - parseInt(a.reviews);
        });
      case "name_az":
        return sorted.sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
      case "name_za":
        return sorted.sort((a, b) => {
          return b.title.localeCompare(a.title);
        });
      default:
        return sorted;
    }
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSortChange = (sortId) => {
    setSelectedSort(sortId);
    setShowSortModal(false);
  };

  const handleBuyNow = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error("Failed to open URL:", err);
        Alert.alert("Error", "Could not open the store link");
      });
    } else {
      Alert.alert("Error", "Store link not available");
    }
  };

  const renderCategoryButton = ({ item }) => {
    const isActive = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          { backgroundColor: isActive ? item.color : "#f0f0f0" }
        ]}
        onPress={() => handleCategoryPress(item.id)}
      >
        <Text style={[styles.categoryButtonText, { color: isActive ? "#fff" : "#333" }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

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
            onPress={() => handleBuyNow(item.storeUrl)}
          >
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={true}
        indicatorStyle="default"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medicine Finder</Text>
          <Text style={styles.headerSubtitle}>Find the right medicine for your plants</Text>
        </View>

        <View style={styles.compactTopView}>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search by disease or medicine..."
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch()}>
              <Text style={styles.searchButtonText}>SEARCH</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesContainer}>
            <FlatList
              data={categories}
              renderItem={renderCategoryButton}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <Text style={styles.sortButtonText}>
                Sort: {sortOptions.find(s => s.id === selectedSort)?.name || "Default"}
              </Text>
              <Text style={styles.sortIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading medicines...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.medicinesListContainer}>
            {medicines.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No medicines found</Text>
              </View>
            ) : (
              medicines.map((item) => renderMedicineItem({ item }))
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => handleSortChange(option.id)}
              >
                <View style={styles.radioButtonContainer}>
                  <View style={[
                    styles.radioButton,
                    selectedSort === option.id && styles.radioButtonSelected
                  ]}>
                    {selectedSort === option.id && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.sortOptionText}>{option.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 3,
  },
  compactTopView: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    maxWidth: "70%",
    borderWidth: 1,
    borderColor: "#e9ecef",
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "#f8f9fa",
  },
  searchButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesList: {
    justifyContent: "center",
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  categoryButtonText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  sortContainer: {
    alignItems: "flex-end",
    paddingVertical: 5,
  },
  sortButton: {
    backgroundColor: "#3498db",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortButtonText: {
    fontWeight: "bold",
    color: "#fff",
    marginRight: 5,
    fontSize: 13,
  },
  sortIcon: {
    color: "#fff",
    fontSize: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#7f8c8d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
  },
  medicinesListContainer: {
    padding: 15,
  },
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2c3e50",
  },
  sortOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: "#3498db",
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#3498db",
  },
  sortOptionText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#3498db",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});