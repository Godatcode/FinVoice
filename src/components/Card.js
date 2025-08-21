import { StyleSheet, View, ViewProps } from 'react-native';
import { useThemeColor } from '../context/ThemeProvider';

export function Card({ style, children, ...props }) {

  const { card } = useThemeColor();
  
  return (
    <View style={[styles.card, { backgroundColor: card }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
