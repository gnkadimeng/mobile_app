import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ImageBackground, 
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

// Modern CHIETA colors matching other screens
const CHIETA_COLORS = {
  primary: '#1A1A2E',
  secondary: '#FF6B6B',
  accent: '#FF8F00',
  purple: '#6A0DAD',
  teal: '#4ECDC4',
  yellow: '#FFD166',
  green: '#06D6A0',
  blue: '#118AB2',
  lightBg: '#F8F9FA',
  darkText: '#1A1A2E',
  lightText: '#FFFFFF',
  gray: '#9CA3AF',
};

export default function SplashScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load for 1 minute (90000 milliseconds)
    const timer = setTimeout(() => {
      setLoading(false);
      // Add your navigation logic here after 1 minute
      // Example: navigation.navigate('Home');
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CHIETA_COLORS.primary} />
      
      {/* Main Background with Gradient Overlay */}
      <ImageBackground
        source={require('../assets/images/home2.png')}
        style={styles.background}
      >
        <LinearGradient
          colors={['rgba(26,26,46,0.9)', 'rgba(15,52,96,0.7)']}
          style={styles.overlay}
        >
          
          {/* Modern Header/Navbar */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.header}
          />
          
          {/* ScrollView for small screens */}
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Main Content with Logo */}
              <Animatable.View 
                animation="bounceIn" 
                duration={1200}
                delay={300}
                style={styles.logoWrapper}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.logoContainer}
                >
                  <Image 
                    source={require('../assets/images/chieta_logo.png')} 
                    style={styles.logo} 
                  />
                </LinearGradient>
              </Animatable.View>

              <Animatable.View 
                animation="fadeInUp" 
                duration={800}
                delay={600}
                style={styles.welcomeContainer}
              >
                <Text style={styles.welcomeTitle}>Welcome to</Text>
                <LinearGradient
                  colors={[CHIETA_COLORS.secondary, CHIETA_COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.titleGradient}
                >
                  <Text style={styles.chietaTitle}>CHIETA PORTAL</Text>
                </LinearGradient>
                <Text style={styles.subtitle}>
                  Transforming Skills Development in the Chemical Industry
                </Text>
              </Animatable.View>

              {/* Animated Loader */}
              <Animatable.View 
                animation="fadeIn" 
                duration={800}
                delay={900}
                style={styles.loaderSection}
              >
                <View style={styles.loaderWrapper}>
                  <LinearGradient
                    colors={[CHIETA_COLORS.secondary, CHIETA_COLORS.accent]}
                    style={styles.loaderBackground}
                  >
                    <ActivityIndicator size="large" color="white" />
                  </LinearGradient>
                  <Text style={styles.loadingText}>
                    {loading ? 'Initializing Systems...' : 'Ready!'}
                  </Text>
                  {loading && (
                    <Text style={styles.timerText}>
                      60 seconds
                    </Text>
                  )}
                </View>
              </Animatable.View>

              {/* Stats/Dots Indicator - Made responsive */}
              <Animatable.View 
                animation="fadeInUp"
                duration={800}
                delay={1200}
                style={styles.statsContainer}
              >
                <View style={styles.stats}>
                  <View style={styles.statItem}>
                    <Ionicons name="people" size={14} color={CHIETA_COLORS.teal} />
                    <Text style={styles.statText}>10K+ Learners</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="business" size={14} color={CHIETA_COLORS.yellow} />
                    <Text style={styles.statText}>500+ Partners</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="trophy" size={14} color={CHIETA_COLORS.green} />
                    <Text style={styles.statText}>25+ Years</Text>
                  </View>
                </View>
              </Animatable.View>
            </View>
          </ScrollView>

          {/* Modern Footer - Fixed position at bottom */}
          <Animatable.View 
            animation="fadeInUp"
            duration={800}
            delay={1500}
            style={styles.footer}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.footerContent}
            >
              <View style={styles.footerColumn}>
                <View style={styles.footerLeft}>
                  <Ionicons name="lock-closed" size={12} color={CHIETA_COLORS.teal} />
                  <Text style={styles.securityText}>Secure</Text>
                </View>
              </View>
              
              <View style={styles.footerColumn}>
                <Text style={styles.footerText}>
                  © {new Date().getFullYear()} CHIETA
                </Text>
              </View>
              
              <View style={styles.footerColumn}>
                <View style={styles.footerRight}>
                  <Text style={styles.versionText}>v2.0.1</Text>
                  <Ionicons name="star" size={10} color={CHIETA_COLORS.yellow} />
                </View>
              </View>
            </LinearGradient>
          </Animatable.View>

          {/* Floating Particles/Decorations */}
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite"
            duration={2000}
            style={styles.floatingCircle1}
          />
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite"
            duration={2200}
            style={styles.floatingCircle2}
          />
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite"
            duration={2400}
            style={styles.floatingCircle3}
          />
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CHIETA_COLORS.primary,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  
  // Header Styles
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  
  // Content Styles
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: height * 0.7, // Minimum height for content area
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoContainer: {
    padding: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: Math.min(width * 0.6, 220), // Responsive width
    height: Math.min(height * 0.1, 90), // Responsive height
    resizeMode: 'contain',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: CHIETA_COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  chietaTitle: {
    fontSize: Math.min(width * 0.08, 32), // Responsive font size
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: Math.min(width * 0.035, 14), // Responsive font size
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  
  // Loader Styles
  loaderSection: {
    marginBottom: 30,
  },
  loaderWrapper: {
    alignItems: 'center',
  },
  loaderBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: CHIETA_COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 4,
  },
  timerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '400',
  },
  
  // Stats Styles - Responsive
  statsContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap', // Wrap items on small screens
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxWidth: width * 0.9, // Responsive max width
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  statText: {
    color: 'white',
    fontSize: Math.min(width * 0.03, 12), // Responsive font size
    fontWeight: '500',
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  
  // Footer Styles - Responsive
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(26,26,46,0.8)', // Add background for better visibility
  },
  footerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    color: CHIETA_COLORS.teal,
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  versionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    marginRight: 3,
  },
  
  // Floating Decorations
  floatingCircle1: {
    position: 'absolute',
    top: '15%',
    left: '5%',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: CHIETA_COLORS.secondary,
    opacity: 0.3,
  },
  floatingCircle2: {
    position: 'absolute',
    bottom: '40%',
    right: '8%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CHIETA_COLORS.teal,
    opacity: 0.3,
  },
  floatingCircle3: {
    position: 'absolute',
    top: '35%',
    right: '5%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CHIETA_COLORS.yellow,
    opacity: 0.3,
  },
});