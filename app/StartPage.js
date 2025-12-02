import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

export default function StartPage() {
  const router = useRouter();
  const scrollRef = useRef();
  const [sectionPositions, setSectionPositions] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (section) => {
    const y = sectionPositions[section];
    if (y !== undefined) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  };

  const handleLayout = (event, sectionName) => {
    const { y } = event.nativeEvent.layout;
    setSectionPositions((prev) => ({ ...prev, [sectionName]: y }));
  };

  const handleTryNow = () => {
    router.push("/auth/signup");
  };

  const handleWatchDemo = () => {
    Alert.alert("Demo", "This would open a demo video");
  };

  const handleContactSubmit = () => {
    Alert.alert("Success", "Thank you for your message! We will get back to you soon.");
  };

  const features = [
    { 
      icon: "camera", 
      title: "Image Analysis", 
      desc: "Upload crop images and get instant disease identification with our advanced computer vision algorithms" 
    },
    { 
      icon: "cloud-sun", 
      title: "Weather Integration", 
      desc: "Real-time weather data analysis to predict disease outbreaks based on environmental conditions" 
    },
    { 
      icon: "brain", 
      title: "AI Recommendations", 
      desc: "Personalized treatment and prevention suggestions powered by advanced AI models" 
    },
    { 
      icon: "mobile-alt", 
      title: "Mobile Access", 
      desc: "Use our system anywhere with our mobile-friendly application for on-the-go disease detection" 
    },
    { 
      icon: "history", 
      title: "Disease History", 
      desc: "Track disease patterns and treatment effectiveness over time for better crop management" 
    },
    { 
      icon: "users", 
      title: "Expert Network", 
      desc: "Connect with agricultural experts for additional advice and consultation when needed" 
    },
  ];

  const workflow = [
    { step: 1, title: "Upload Image", desc: "Take a photo or upload an image of your crop" },
    { step: 2, title: "AI Analysis", desc: "Our system analyzes the image and weather data" },
    { step: 3, title: "Get Diagnosis", desc: "Receive disease identification and confidence level" },
    { step: 4, title: "Treatment Plan", desc: "Follow AI-recommended treatment steps" },
  ];

  return (
    <>
      {/* Navigation */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="seedling" size={24} color="#2cd46aff" />
          <Text style={styles.logoText}>AgriAI</Text>
        </View>
        
        {/* Desktop Navigation */}
        {width > 768 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navItems}>
            {["home", "features", "workflow", "about", "contact"].map((s) => (
              <TouchableOpacity key={s} onPress={() => scrollTo(s)}>
                <Text style={styles.navItem}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        {/* Right-aligned Login/Signup Buttons */}
        <View style={styles.navButtonsContainer}>
          {width > 768 ? (
            <>
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={() => router.push("/auth/login")}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.signupButton} 
                onPress={() => router.push("/auth/signup")}
              >
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
              <FontAwesome name={isMenuOpen ? "times" : "bars"} size={24} color="#16a34a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Menu */}
      {width <= 768 && isMenuOpen && (
        <View style={styles.mobileMenu}>
          {["home", "features", "workflow", "about", "contact"].map((s) => (
            <TouchableOpacity key={s} onPress={() => { scrollTo(s); setIsMenuOpen(false); }}>
              <Text style={styles.mobileMenuItem}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.mobileLoginButton} 
            onPress={() => { router.push("/auth/login"); setIsMenuOpen(false); }}
          >
            <Text style={styles.mobileLoginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mobileSignupButton} 
            onPress={() => { router.push("/auth/signup"); setIsMenuOpen(false); }}
          >
            <Text style={styles.mobileSignupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView ref={scrollRef} style={styles.container}>

        {/* Hero Section */}
        <LinearGradient
          colors={['#4ade80', '#22c55e']}
          style={styles.hero}
        >
          <View onLayout={(e) => handleLayout(e, "home")} style={styles.heroContent}>
            <Text style={styles.heroTitle}>AI-Powered Crop Disease Detection</Text>
            <Text style={styles.heroSubtitle}>Protect your crops with early disease detection and AI-driven treatment recommendations</Text>
            
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.tryNowButton} onPress={handleTryNow}>
                <Text style={styles.tryNowButtonText}>Try Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.watchDemoButton} onPress={handleWatchDemo}>
                <Text style={styles.watchDemoButtonText}>Watch Demo</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.heroImageContainer}>
              <Image
                source={require("./assets/far.jpg")}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.accuracyBadge}>
                <View style={styles.badgeIconContainer}>
                  <FontAwesome name="check" size={16} color="#16a34a" />
                </View>
                <View>
                  <Text style={styles.badgeTitle}>99% Accuracy</Text>
                  <Text style={styles.badgeSubtitle}>Disease Detection</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View onLayout={(e) => handleLayout(e, "features")} style={styles.section}>
          <Text style={styles.sectionTitle}>Powerful Features</Text>
          <Text style={styles.sectionSubtitle}>Our AI-driven system provides comprehensive tools for crop disease management</Text>
          
          <View style={styles.featuresGrid}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  {f.icon === "cloud-sun" || f.icon === "brain" || f.icon === "mobile-alt" ? (
                    <FontAwesome5 name={f.icon} size={24} color="#16a34a" />
                  ) : (
                    <FontAwesome name={f.icon} size={24} color="#16a34a" />
                  )}
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Workflow Section */}
        <View onLayout={(e) => handleLayout(e, "workflow")} style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <Text style={styles.sectionSubtitle}>Our simple 4-step process to protect your crops</Text>
          
          <View style={styles.workflowContainer}>
            {workflow.map((w, i) => (
              <View key={i} style={styles.workflowStep}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{w.step}</Text>
                </View>
                <Text style={styles.workflowTitle}>{w.title}</Text>
                <Text style={styles.workflowDesc}>{w.desc}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.techContainer}>
            <View style={styles.techTextContainer}>
              <Text style={styles.techTitle}>Advanced Technology Behind the Scenes</Text>
              <Text style={styles.techDescription}>Our system combines cutting-edge technologies to provide accurate disease detection and treatment recommendations:</Text>
              
              <View style={styles.techList}>
                <Text style={styles.techItem}>• Computer Vision for image analysis</Text>
                <Text style={styles.techItem}>• Machine Learning models for disease prediction</Text>
                <Text style={styles.techItem}>• Real-time weather data integration</Text>
                <Text style={styles.techItem}>• AI-powered recommendation engine</Text>
              </View>
            </View>
            
            <Image 
              source={require("./assets/wf.jpg")} 
              style={styles.techImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* About Section */}
        <View onLayout={(e) => handleLayout(e, "about")} style={styles.section}>
          <Text style={styles.sectionTitle}>About AgriAI</Text>
          
          <View style={styles.aboutContent}>
            <View style={styles.aboutTextContainer}>
              <Text style={styles.aboutText}>
                Crop diseases can devastate yields, leading to significant financial losses for farmers worldwide.
                Early detection and timely intervention are crucial for effective disease management.
              </Text>
              <Text style={styles.aboutText}>
                AgriAI was developed to address this challenge by leveraging artificial intelligence and machine learning
                to create a comprehensive crop disease prediction and management system.
              </Text>
              <Text style={styles.aboutText}>
                Our mission is to empower farmers with technology that helps them protect their crops, increase yields,
                and promote sustainable agricultural practices.
              </Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>99%</Text>
                <Text style={styles.statLabel}>Detection Accuracy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Availability</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50+</Text>
                <Text style={styles.statLabel}>Diseases Detected</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.techStackContainer}>
            <Text style={styles.techStackTitle}>Our Technology Stack</Text>
            
            <View style={styles.progressBarContainer}>
              <View>
                <View style={styles.progressBarHeader}>
                  <Text style={styles.progressBarLabel}>Computer Vision</Text>
                  <Text style={styles.progressBarValue}>98%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '98%' }]} />
                </View>
              </View>
              
              <View>
                <View style={styles.progressBarHeader}>
                  <Text style={styles.progressBarLabel}>Machine Learning</Text>
                  <Text style={styles.progressBarValue}>96%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '96%' }]} />
                </View>
              </View>
              
              <View>
                <View style={styles.progressBarHeader}>
                  <Text style={styles.progressBarLabel}>Weather Analysis</Text>
                  <Text style={styles.progressBarValue}>94%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '94%' }]} />
                </View>
              </View>
              
              <View>
                <View style={styles.progressBarHeader}>
                  <Text style={styles.progressBarLabel}>Recommendation Engine</Text>
                  <Text style={styles.progressBarValue}>92%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '92%' }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={['#16a34a', '#15803d']}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaTitle}>Ready to Protect Your Crops?</Text>
          <Text style={styles.ctaSubtitle}>Join thousands of farmers using AgriAI to increase yields and prevent crop losses</Text>
          
          <View style={styles.ctaButtons}>
            <TouchableOpacity style={styles.ctaPrimaryButton} onPress={handleTryNow}>
              <Text style={styles.ctaPrimaryButtonText}>Get Started for Free</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaSecondaryButton} onPress={handleWatchDemo}>
              <Text style={styles.ctaSecondaryButtonText}>Schedule a Demo</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Contact Section */}
        <View onLayout={(e) => handleLayout(e, "contact")} style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionSubtitle}>Have questions or need support? Reach out to our team</Text>
          
          <View style={styles.contactContainer}>
            <View style={styles.contactForm}>
              <Text style={styles.contactFormTitle}>Send us a message</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name</Text>
                <View style={styles.formInput}>
                  <Text style={styles.inputPlaceholder}>Your name</Text>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <View style={styles.formInput}>
                  <Text style={styles.inputPlaceholder}>Your email</Text>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Subject</Text>
                <View style={styles.formInput}>
                  <Text style={styles.inputPlaceholder}>Subject</Text>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Message</Text>
                <View style={[styles.formInput, styles.formTextarea]}>
                  <Text style={styles.inputPlaceholder}>Your message</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.submitButton} onPress={handleContactSubmit}>
                <Text style={styles.submitButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoTitle}>Contact Information</Text>
              
              <View style={styles.contactInfoItem}>
                <FontAwesome5 name="map-marker-alt" size={20} color="#16a34a" />
                <View>
                  <Text style={styles.contactInfoLabel}>Our Location</Text>
                  <Text style={styles.contactInfoText}>123 AgriTech Park, Farmville, CA 90210</Text>
                </View>
              </View>
              
              <View style={styles.contactInfoItem}>
                <FontAwesome name="phone" size={20} color="#16a34a" />
                <View>
                  <Text style={styles.contactInfoLabel}>Phone</Text>
                  <Text style={styles.contactInfoText}>+1 (555) 123-4567</Text>
                </View>
              </View>
              
              <View style={styles.contactInfoItem}>
                <FontAwesome name="envelope" size={20} color="#16a34a" />
                <View>
                  <Text style={styles.contactInfoLabel}>Email</Text>
                  <Text style={styles.contactInfoText}>support@agriai.com</Text>
                </View>
              </View>
              
              <View style={styles.contactInfoItem}>
                <FontAwesome5 name="clock" size={20} color="#16a34a" />
                <View>
                  <Text style={styles.contactInfoLabel}>Working Hours</Text>
                  <Text style={styles.contactInfoText}>Mon-Fri: 9am - 5pm{'\n'}Sat-Sun: Closed</Text>
                </View>
              </View>
              
              <View style={styles.socialContainer}>
                <Text style={styles.socialTitle}>Follow Us</Text>
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="facebook-f" size={16} color="#16a34a" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="twitter" size={16} color="#16a34a" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="instagram" size={16} color="#16a34a" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome5 name="linkedin-in" size={16} color="#16a34a" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="youtube" size={16} color="#16a34a" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerSection}>
              <View style={styles.footerLogo}>
                <FontAwesome5 name="seedling" size={24} color="#4ade80" />
                <Text style={styles.footerLogoText}>AgriAI</Text>
              </View>
              <Text style={styles.footerDescription}>
                AI-powered crop disease detection and management system for modern farmers.
              </Text>
            </View>
            
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Quick Links</Text>
              <Text style={styles.footerLink}>Home</Text>
              <Text style={styles.footerLink}>Features</Text>
              <Text style={styles.footerLink}>How It Works</Text>
              <Text style={styles.footerLink}>About</Text>
            </View>
            
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Resources</Text>
              <Text style={styles.footerLink}>Blog</Text>
              <Text style={styles.footerLink}>Help Center</Text>
              <Text style={styles.footerLink}>Farmers Guide</Text>
              <Text style={styles.footerLink}>Research Papers</Text>
            </View>
            
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>Newsletter</Text>
              <Text style={styles.footerNewsletterText}>
                Subscribe to get updates on new features and farming tips.
              </Text>
              <View style={styles.newsletterForm}>
                <View style={styles.newsletterInput}>
                  <Text style={styles.newsletterPlaceholder}>Your email</Text>
                </View>
                <TouchableOpacity style={styles.newsletterButton}>
                  <Text style={styles.newsletterButtonText}>Subscribe</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>© 2023 AgriAI. All rights reserved.</Text>
          </View>
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  
  // Navigation
  navbar: { 
    flexDirection: "row", 
    backgroundColor: "#fff", 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 50,
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#15803d",
    marginLeft: 8,
  },
  navItems: {
    alignItems: "center",
  },
  navItem: { 
    marginHorizontal: 10, 
    fontWeight: "500", 
    color: "#16a34a",
    fontSize: 16,
  },
  
  // New styles for right-aligned buttons
  navButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#f0fdf4", // Light green background
    borderWidth: 1,
    borderColor: "#16a34a", // Green border
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  loginButtonText: {
    color: "#16a34a", // Green text
    fontWeight: "bold",
    fontSize: 14,
  },
  signupButton: {
    backgroundColor: "#16a34a", // Vibrant green background
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signupButtonText: {
    color: "#fff", // White text
    fontWeight: "bold",
    fontSize: 14,
  },
  
  // Mobile Menu
  mobileMenu: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  mobileMenuItem: {
    paddingVertical: 8,
    fontSize: 16,
    color: "#16a34a",
  },
  // Mobile buttons with vibrant colors
  mobileLoginButton: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  mobileLoginButtonText: {
    color: "#16a34a",
    fontWeight: "bold",
    fontSize: 14,
  },
  mobileSignupButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  mobileSignupButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Hero Section
  hero: { 
    paddingVertical: 60, 
    paddingHorizontal: 16,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: "#fff", 
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 40,
  },
  heroSubtitle: { 
    fontSize: 18, 
    color: "rgba(255, 255, 255, 0.9)", 
    marginVertical: 10, 
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 28,
  },
  heroButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  tryNowButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 16,
  },
  tryNowButtonText: {
    color: "#16a34a",
    fontWeight: "bold",
    fontSize: 16,
  },
  watchDemoButton: {
    borderWidth: 2,
    borderColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  watchDemoButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  heroImageContainer: {
    position: "relative",
    alignItems: "center",
    width: "100%",
  },
  heroImage: { 
    width: "80%", 
    height: 800, 
    borderRadius: 12,
  },
  accuracyBadge: {
    position: "absolute",
    bottom: -24,
    right: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeIconContainer: {
    backgroundColor: "#dcfce7",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  badgeTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  badgeSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },

  // Section Styles
  section: { 
    paddingVertical: 40, 
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
  },
  sectionTitle: { 
    fontSize: 28, 
    fontWeight: "bold", 
    textAlign: "center",
    marginBottom: 8,
    color: "#1f2937",
  },
  sectionSubtitle: { 
    fontSize: 16, 
    color: "#6b7280", 
    textAlign: "center",
    marginBottom: 40,
    maxWidth: 600,
    alignSelf: "center",
  },

  // Features
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: { 
    backgroundColor: "#fff", 
    padding: 24,
    borderRadius: 12,
    marginVertical: 8,
    width: width > 600 ? "30%" : "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  featureIconContainer: {
    backgroundColor: "#dcfce7",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 8,
    color: "#1f2937",
  },
  featureDesc: { 
    fontSize: 14, 
    color: "#4b5563", 
    textAlign: "center",
    lineHeight: 20,
  },

  // Workflow
  workflowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  workflowStep: { 
    alignItems: "center", 
    marginVertical: 10,
    width: width > 600 ? "22%" : "45%",
  },
  stepNumberContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: "#dcfce7",
    alignItems: "center", 
    justifyContent: "center",
    marginBottom: 16,
  },
  stepNumber: { 
    fontWeight: "bold", 
    color: "#16a34a",
    fontSize: 24,
  },
  workflowTitle: { 
    fontWeight: "bold", 
    fontSize: 18,
    color: "#1f2937",
    marginBottom: 8,
  },
  workflowDesc: { 
    fontSize: 14, 
    color: "#4b5563", 
    textAlign: "center",
    lineHeight: 20,
  },
  
  // Technology Section
  techContainer: {
    backgroundColor: "#f3f4f6",
    padding: 24,
    borderRadius: 12,
    flexDirection: "column",
  },
  techTextContainer: {
    marginBottom: 24,
  },
  techTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  techDescription: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 24,
  },
  techList: {
    marginLeft: 8,
  },
  techItem: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 8,
  },
  techImage: {
    width: "60%",
    height: 500,
    borderRadius: 8,
  },

  // About Section
  aboutContent: {
    marginBottom: 32,
  },
  aboutTextContainer: {
    marginBottom: 24,
  },
  aboutText: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#16a34a",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  
  // Technology Stack
  techStackContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  techStackTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressBarLabel: {
    fontSize: 16,
    color: "#4b5563",
  },
  progressBarValue: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#16a34a",
    borderRadius: 4,
  },

  // CTA Section
  ctaSection: {
    paddingVertical: 60,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  ctaSubtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 32,
    textAlign: "center",
    maxWidth: 600,
  },
  ctaButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  ctaPrimaryButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 16,
  },
  ctaPrimaryButtonText: {
    color: "#16a34a",
    fontWeight: "bold",
    fontSize: 16,
  },
  ctaSecondaryButton: {
    borderWidth: 2,
    borderColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaSecondaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Contact Section
  contactContainer: {
    flexDirection: "column",
  },
  contactForm: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  contactFormTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  formTextarea: {
    height: 100,
    justifyContent: "flex-start",
  },
  inputPlaceholder: {
    color: "#9ca3af",
  },
  submitButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  contactInfo: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
  },
  contactInfoItem: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  contactInfoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  contactInfoText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  socialContainer: {
    marginTop: 24,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  socialButton: {
    backgroundColor: "#dcfce7",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  // Footer
  footer: {
    backgroundColor: "#1f2937",
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  footerContent: {
    flexDirection: "column",
    marginBottom: 32,
  },
  footerSection: {
    marginBottom: 32,
  },
  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  footerLogoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4ade80",
    marginLeft: 8,
  },
  footerDescription: {
    fontSize: 14,
    color: "#d1d5db",
    lineHeight: 20,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 14,
    color: "#d1d5db",
    marginBottom: 8,
  },
  footerNewsletterText: {
    fontSize: 14,
    color: "#d1d5db",
    marginBottom: 16,
    lineHeight: 20,
  },
  newsletterForm: {
    flexDirection: "row",
  },
  newsletterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#374151",
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#111827",
  },
  newsletterPlaceholder: {
    color: "#6b7280",
  },
  newsletterButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  newsletterButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 16,
  },
  footerCopyright: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});