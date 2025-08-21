import React, { useCallback} from 'react';
import { StyleSheet, View, Alert, Linking , ImageBackground , Text} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const PayScreen = () => {
  useFocusEffect(
    useCallback(() => {
      const upiUrl = 'upi://pay';

      Linking.openURL(upiUrl).catch(() => {
        Alert.alert(
          'Error',
          'Unable to open UPI apps. Please ensure you have one installed.'
        );
      });
    }, [])
  );

  return (
    <ImageBackground
      source={require('../../assets/payScreenBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
});


export default PayScreen;
