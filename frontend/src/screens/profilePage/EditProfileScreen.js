import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput ,TouchableOpacity} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeColor } from "../../context/ThemeProvider";
import { Card } from "../../components/Card";
import { UserContext } from "../../context/UserContext";
import { profileAPI } from "../../services/apiService";

export default function EditProfileScreen() {
  const { primary , background , text, card} = useThemeColor();

  const {user, setUser} = useContext(UserContext);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState('Please set your E-mail');
  const [gender, setGender] = useState("Select Gender");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const getUserDataFromSupabase = async () => {
      try {
        if (user && user.id) {
          const profile = await profileAPI.getProfile();
          if (profile) {
            if (profile.email) setEmail(profile.email);
            if (profile.gender) setGender(profile.gender);
          }
        }
      } catch (error) {
        console.log('Error retrieving user data from Supabase', error);
      }
    };

    getUserDataFromSupabase();
  }, [user]);

  const handleNameBlur = async () => {
    try {
      if (user && user.id) {
        await profileAPI.updateProfile({ name });
        setUser({...user, name: name});
      }
    } catch (error) {
      console.log('Error saving name to Supabase', error);
    }
  };

  const handleEmailBlur = async () => {
    setIsEditingEmail(false);
    try {
      if (user && user.id) {
        await profileAPI.updateProfile({ email });
      }
    } catch (error) {
      console.log('Error saving email to Supabase', error);
    }
  };

  const handleGenderSelect = async (selectedGender) => {
    setGender(selectedGender);
    setIsDropdownOpen(false);
  
    try {
      if (user && user.id) {
        await profileAPI.updateProfile({ gender: selectedGender });
      }
    } catch (error) {
      console.log('Error saving gender to Supabase', error);
    }
  };

  return (
    <View style={[{flex : 1},{backgroundColor: background}]}>
      <View style={{ marginTop: 40 }}>
        <Card style={{margin:20}}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="cellphone" size={24} color={text} />
            <Text style={{color : text}}>+91{user.phone}</Text>
            <View style={{ flex: 1 }} />
            <MaterialCommunityIcons name="check-circle-outline" size={20} color={primary} />
          </View>
        </Card>
  
        <Card style={{margin:20}}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="card-account-details" size={24} color={text} />
            {isEditingName ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoFocus
                onBlur={handleNameBlur}
                placeholder="Enter your name"
                
              />
            ) : (
              <Text style={[styles.text , {color: text}]}>{name}</Text>
            )}
            <View style={{ flex: 1 }} />
            {!isEditingName && (
              <MaterialCommunityIcons name="rename-box" size={24} color={primary} onPress={() => setIsEditingName(true)} />
            )}
          </View>
        </Card>
  
        <Card style={{margin:20}}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="email" size={24} color={text} />
            {isEditingEmail ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoFocus
                onBlur={handleEmailBlur}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            ) : (
              <Text style={[styles.text, { color: text }]}>{email}</Text>
            )}
            <View style={{ flex: 1 }} />
            {!isEditingEmail && (
              <MaterialCommunityIcons name="rename-box" size={24} color={primary} onPress={() => {setEmail(""); setIsEditingEmail(true)}} />
            )}
          </View>
        </Card>
  
        <Card style={{ margin: 20 }}>
          <View style={{ ...styles.row, flexDirection: "column", alignItems: "flex-start" }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 10, width: '100%' }}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <MaterialCommunityIcons name="gender-male-female" size={24} color={text} />
              <Text style={[styles.text, { color: gender === 'Select Gender' ? 'grey' : text }]}>
                {gender}
              </Text>
              <View style={{ flex: 1 }} />
              <MaterialCommunityIcons
                name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                size={24}
                color={text}
              />
            </TouchableOpacity>
        
            {isDropdownOpen && (
              <View style={{ paddingLeft: 34, width: '100%' }}>
                {["Male", "Female", "Prefer not to say", "Others"].map((option) => (
                  <TouchableOpacity key={option} onPress={() => handleGenderSelect(option)} style={{ paddingVertical: 8 }}>
                    <Text style={{ color: text }}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Card>

      </View>
    </View>  
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  text: {
    marginLeft: 20,
    fontSize: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});