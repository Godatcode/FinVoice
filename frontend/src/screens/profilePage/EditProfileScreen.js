import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput ,TouchableOpacity} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeColor } from "../../context/ThemeProvider";
import { Card } from "../../components/Card";
import { UserContext } from "../../context/UserContext";

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
    const getUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        const storedGender  = await AsyncStorage.getItem('gender')

        if (storedEmail) setEmail(storedEmail);
        if(storedGender) setGender(storedGender);
      } catch (error) {
        console.log('Error retrieving user data from AsyncStorage', error);
      }
      
    };

    getUserData();
  }, []);

  const handleNameBlur = async () => {
    setUser({...user, name:name})
    await AsyncStorage.setItem('name' , name)
  };

  const handleEmailBlur = async () => {
    setIsEditingEmail(false);
    await AsyncStorage.setItem('email', email);
  };

  const handleGenderSelect = async (selectedGender) => {
    setGender(selectedGender);
    setIsDropdownOpen(false);
  
    try {
      await AsyncStorage.setItem('gender', selectedGender);
    } catch (error) {
      console.log('Error saving gender to AsyncStorage', error);
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