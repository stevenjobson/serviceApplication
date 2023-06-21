import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles'; // Assuming you have a separate styles.js file for your styles

function HomeScreen() {
    const navigation = useNavigation();
  
    const handleButtonPress = () => {
      console.log("Button1 Pressed");
      console.log(navigation);
      navigation.navigate('Form');
    }
  
    const handleButtonPress2 = () => {
      console.log("Button2 pressed");
      console.log(navigation);
      navigation.navigate('DisplayScreen');
    }
  
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25292e' }}>
        
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={styles.buttonText} onPress={handleButtonPress}>Offering a service!... </Text>
        </TouchableOpacity>
  
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={styles.buttonText} onPress={handleButtonPress2}>Finding a service!...</Text> 
        </TouchableOpacity>
      </View>
    );
  }

  export default HomeScreen;

  