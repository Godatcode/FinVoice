import { createContext, useState, useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { profileAPI } from "../services/apiService";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ name: "", phone: "", id: null });
  const [loading, setLoading] = useState(true);
  
  // Debug user state changes
  useEffect(() => {
    console.log('🔍 UserContext: user state changed:', user);
  }, [user]);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        setLoading(true);
        
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedName = await AsyncStorage.getItem("name");
        const storedPhone = await AsyncStorage.getItem("phone");
        
        console.log('🔄 Loading user from storage:', { storedUserId, storedName, storedPhone });
        
        if (storedUserId && storedName && storedPhone) {
          console.log('🔄 Found complete stored credentials, checking if backend refresh is needed...');
          
          // Check if we need to fetch from backend or can use cached data
          const lastRefresh = await AsyncStorage.getItem('lastProfileRefresh');
          const now = Date.now();
          const timeSinceLastRefresh = lastRefresh ? (now - parseInt(lastRefresh)) : Infinity;
          
          // Only fetch from backend if it's been more than 30 minutes since last refresh
          if (timeSinceLastRefresh > 30 * 60 * 1000) {
            console.log('🔄 Fetching profile from backend (30+ minutes since last refresh)');
            
            try {
              const profile = await profileAPI.getProfile();
              console.log('✅ Backend profile loaded successfully:', profile);
              
              setUser({ 
                name: profile.name, 
                phone: profile.phone, 
                id: profile.id,
                language: profile.language || 'en',
                currency: profile.currency || 'INR',
                theme: profile.theme || 'light'
              });
              
              // Update last refresh timestamp
              await AsyncStorage.setItem('lastProfileRefresh', now.toString());
              
              console.log('✅ User context restored from backend');
              
            } catch (backendError) {
              console.warn('⚠️ Backend unavailable, restoring from local storage:', backendError.message);
              
              // Backend is unavailable, but we have local credentials - restore local session
              const localUserId = storedUserId.startsWith('local_') ? storedUserId : `local_${Date.now()}`;
              await AsyncStorage.setItem("userId", localUserId);
              
              setUser({ 
                name: storedName, 
                phone: storedPhone, 
                id: localUserId,
                language: 'en',
                currency: 'INR',
                theme: 'light'
              });
              
              console.log('✅ User context restored from local storage (offline mode)');
            }
          } else {
            console.log('⏰ Using cached profile data (refreshed', Math.round(timeSinceLastRefresh / 60000), 'minutes ago)');
            
            // Use stored data without backend call
            setUser({ 
              name: storedName, 
              phone: storedPhone, 
              id: storedUserId,
              language: 'en',
              currency: 'INR',
              theme: 'light'
            });
            
            console.log('✅ User context restored from cached data');
          }
          
        } else if (storedName && storedPhone) {
          console.log('🔄 Found stored name/phone, attempting to create backend profile...');
          
          try {
            const response = await profileAPI.createProfile({
              name: storedName,
              phone: storedPhone,
              language: 'en',
              currency: 'INR',
              theme: 'light'
            });
            
            console.log('✅ Backend profile created from stored credentials:', response);
            
            // Extract user data from response
            const newProfile = response.user || response;
            
            if (newProfile && newProfile.id) {
              await AsyncStorage.setItem("userId", newProfile.id);
              
              setUser({ 
                name: newProfile.name, 
                phone: newProfile.phone, 
                id: newProfile.id,
                language: newProfile.language || 'en',
                currency: newProfile.currency || 'INR',
                theme: newProfile.theme || 'light'
              });
              
              console.log('✅ User context restored from newly created backend profile');
            } else {
              throw new Error('Invalid profile response from backend');
            }
            
          } catch (createError) {
            console.warn('⚠️ Failed to create backend profile, using local session:', createError.message);
            
            // Create local session as fallback
            const localUserId = `local_${Date.now()}`;
            await AsyncStorage.setItem("userId", localUserId);
            
            setUser({ 
              name: storedName, 
              phone: storedPhone, 
              id: localUserId,
              language: 'en',
              currency: 'INR',
              theme: 'light'
            });
            
            console.log('✅ User context restored from local storage (offline mode)');
          }
          
        } else {
          console.log('🔄 No stored credentials found');
          setUser({ name: "", phone: "", id: null });
        }
        
      } catch (error) {
        console.error('❌ Critical error loading user:', error);
        
        // Try to recover from AsyncStorage as last resort
        try {
          const storedName = await AsyncStorage.getItem("name");
          const storedPhone = await AsyncStorage.getItem("phone");
          
          if (storedName && storedPhone) {
            const localUserId = `local_${Date.now()}`;
            await AsyncStorage.setItem("userId", localUserId);
            
            setUser({ 
              name: storedName, 
              phone: storedPhone, 
              id: localUserId,
              language: 'en',
              currency: 'INR',
              theme: 'light'
            });
            
            console.log('✅ User context recovered from AsyncStorage after error');
          } else {
            setUser({ name: "", phone: "", id: null });
          }
        } catch (recoveryError) {
          console.error('❌ Failed to recover user context:', recoveryError);
          setUser({ name: "", phone: "", id: null });
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Smart profile refresh strategy - only refresh when necessary
  useEffect(() => {
    let refreshTimeout;
    
    const handleAppStateChange = (nextAppState) => {
      console.log('🔄 App state changed:', nextAppState);
      
      if (nextAppState === 'active' && user.id) {
        console.log('🔄 App became active, checking user session...');
        
        // Clear any existing refresh timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }
        
        // Only refresh if user is not a local session and we haven't refreshed recently
        if (user.id && !user.id.startsWith('local_')) {
          // Add a delay to avoid immediate refresh on app activation
          refreshTimeout = setTimeout(async () => {
            try {
              // Check if we need to refresh (e.g., after a long period)
              const lastRefresh = await AsyncStorage.getItem('lastProfileRefresh');
              const now = Date.now();
              const timeSinceLastRefresh = lastRefresh ? (now - parseInt(lastRefresh)) : Infinity;
              
              // Only refresh if it's been more than 10 minutes since last refresh
              if (timeSinceLastRefresh > 10 * 60 * 1000) {
                console.log('🔄 App active for 10+ minutes, refreshing user profile...');
                
                const profile = await profileAPI.getProfile();
                if (profile && profile.id) {
                  console.log('✅ User profile refreshed from backend');
                  setUser(prev => ({
                    ...prev,
                    name: profile.name,
                    phone: profile.phone,
                    language: profile.language || prev.language,
                    currency: profile.currency || prev.currency,
                    theme: profile.theme || prev.theme
                  }));
                  
                  // Update last refresh timestamp
                  await AsyncStorage.setItem('lastProfileRefresh', now.toString());
                }
              } else {
                console.log('⏰ Profile refresh skipped - refreshed recently (', Math.round(timeSinceLastRefresh / 60000), 'minutes ago)');
              }
            } catch (error) {
              console.warn('⚠️ Profile refresh failed, keeping existing data:', error.message);
              // Don't clear user data, just log the warning
            }
          }, 3000); // 3 second delay to avoid immediate refresh
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      subscription?.remove();
    };
  }, [user.id]);

  const createUser = async (name, phone) => {
    // Declare profileData outside try block so it's accessible in catch
    let profileData;
    
    try {
      console.log('🔄 Creating new user profile via backend API...', { name, phone });
      
      // Create profile via backend API
      profileData = {
        name,
        phone,
        language: 'en',
        currency: 'INR',
        theme: 'light'
      };
      
      console.log('📤 Sending profile data to backend:', profileData);
      
      const response = await profileAPI.createProfile(profileData);
      
      console.log('✅ Backend profile response:', response);
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response keys:', Object.keys(response || {}));
      
      // Extract user data from response (backend returns { user: {...} })
      const newProfile = response.user || response;
      
      console.log('✅ Extracted profile data:', newProfile);
      console.log('✅ Profile ID:', newProfile?.id);
      console.log('✅ Profile name:', newProfile?.name);
      console.log('✅ Profile phone:', newProfile?.phone);
      
      // Save user ID to storage for future sessions
      await AsyncStorage.setItem("userId", newProfile.id);
      
      const userData = { 
        name: newProfile.name, 
        phone: newProfile.phone, 
        id: newProfile.id,
        language: newProfile.language,
        currency: newProfile.currency,
        theme: newProfile.theme
      };
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('❌ Error creating user via backend:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Log the profile data that was attempted to be inserted
      if (profileData) {
        console.error('❌ Failed profile data:', profileData);
      }
      
      // Don't fall back to local session - show the actual error
      throw new Error(`Failed to create user profile via backend: ${error.message}`);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (!user.id) {
        throw new Error('No user ID available for profile update');
      }

      console.log('🔄 Updating user profile in backend...', updates);
      
      // Update profile in backend
      const updatedProfile = await profileAPI.updateProfile(updates);
      
      console.log('✅ Backend profile updated successfully:', updatedProfile);
      
      // Update local user state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('❌ Error updating user profile in backend:', error);
      throw error;
    }
  };

  // Manual profile refresh function - for when user actually needs fresh data
  const refreshUserProfile = async () => {
    try {
      if (!user.id || user.id.startsWith('local_')) {
        console.log('⏰ Skipping profile refresh for local user');
        return user;
      }

      console.log('🔄 Manually refreshing user profile...');
      
      const profile = await profileAPI.getProfile();
      if (profile && profile.id) {
        console.log('✅ User profile refreshed manually from backend');
        
        const updatedUser = {
          ...user,
          name: profile.name,
          phone: profile.phone,
          language: profile.language || user.language,
          currency: profile.currency || user.currency,
          theme: profile.theme || user.theme
        };
        
        setUser(updatedUser);
        
        // Update last refresh timestamp
        await AsyncStorage.setItem('lastProfileRefresh', Date.now().toString());
        
        return updatedUser;
      }
      
      return user;
    } catch (error) {
      console.warn('⚠️ Manual profile refresh failed:', error.message);
      // Return existing user data instead of throwing
      return user;
    }
  };

  // Force clear refresh cache - useful for debugging or forcing fresh data
  const clearRefreshCache = async () => {
    try {
      await AsyncStorage.removeItem('lastProfileRefresh');
      console.log('✅ Refresh cache cleared');
    } catch (error) {
      console.error('❌ Error clearing refresh cache:', error);
    }
  };

  // Check if user can perform backend operations
  const canPerformBackendOperations = () => {
    return user && user.id && !user.id.startsWith('local_');
  };

  // Check if user is in local/offline mode
  const isLocalUser = () => {
    return user && user.id && user.id.startsWith('local_');
  };

  const logout = async () => {
    try {
      console.log('🔄 Logging out user...');
      
      // Clear local storage
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("name");
      await AsyncStorage.removeItem("phone");
      await AsyncStorage.removeItem("lastProfileRefresh");
      
      // Clear user state
      setUser({ name: "", phone: "", id: null });
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      createUser, 
      updateUserProfile,
      refreshUserProfile,
      clearRefreshCache,
      canPerformBackendOperations,
      isLocalUser,
      logout,
      loading 
    }}>
      {children}
    </UserContext.Provider>
  );
};
