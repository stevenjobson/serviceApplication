import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, StyleSheet, Text, View, Button, TextInput, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';

// import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFormik } from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions} from '@react-navigation/native';
import { enableExpoCliLogging } from 'expo/build/logs/Logs';
import uuid from 'react-native-uuid';
import { ScrollView, KeyboardAvoidingView, Image } from 'react-native';
// import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export const FormDataContext = React.createContext();

// import HomeScreen from './HomeScreen'; // Adjust the path as necessary

// Define your HomeScreen component
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

function FormScreen() {

  ////still don't understand the issue here.
  const { formData, setFormData } = React.useContext(FormDataContext);
  const navigation = useNavigation();
  const id = uuid.v4();

  const [image, setImage] = useState(null);
  // const [image, setImage] = useState(null);


  async function pickImage() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
    } else {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4,3],
        quality: 1,
        //multiple: true,
      });
      console.log(result);

      if (!result.canceled) {
        // setImage(result.assets[0].uri);
        setImage(result.uri);
      }
    }
  }

  const formik = useFormik({
    initialValues: {
      id: id,
      companyName: '',
      companyNumber: '', 
      companyEmail: '',
      companyWebsite: '',
      DescriptionOfService: '',
      imageUri: '',
    },
    onSubmit: async values => {
      console.log('FormScreen - values before setting imageUri: ', values);
      console.log('FormScreen - image: ', image);
      // Here you could dispatch the values to your Redux store, post them to a server, etc.

      // console.log('FormScreen - formData: ', formData);
      // console.log('FormScreen - values', values);

      // setFormData([...formData, values]);
      values.imageUri = image;
      console.log('FormScreen - values after setting imageUri: ', values);

      setFormData(prevFormData => [...prevFormData, values]);
      // console.log('FormScreen - [...formData, values]', [...formData, values]);

      fetch('http://192.168.0.14:5000/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data.message);
      })
      .catch((error) => {
        console.error('Error:', error);
      });


      // console.log("Submit Button Pressed");
      // console.log(navigation);
      await storeData(values);
      navigation.navigate('DisplayScreen');
    },
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "android" ? "height" : "padding"}
      style={{ justifyContent: 'center', padding: 20, backgroundColor: '#25292e', flex: 1}}>
      <ScrollView contentContainerStyle={{justifyContent: 'center', padding: 20}}>
        <Text style={{color: 'white'}}>Company Name</Text>
        <TextInput
          label="Company Name"
          name="companyName"
          value={formik.values.companyName}
          onChangeText={text => formik.handleChange('companyName')(text)}
          //onChangeText={formik.handleChange('companyName')}
          style={{height: 40, borderColor: 'gray', borderWidth: 1, color: 'black', backgroundColor: '#fff', paddingLeft: 10, marginTop: 1, marginLeft: 20, marginRight: 20}}
        />

        <Text style={{color: 'white', marginTop: 20}}>Company Number</Text>
        <TextInput
          label="Company Number"
          name="companyNumber"
          value={formik.values.companyNumber}
          onChangeText={text => formik.handleChange('companyNumber')(text)}
          style={{height: 40, borderColor: 'gray', borderWidth: 1, color: 'black', backgroundColor: '#fff', paddingLeft: 10, marginTop: 1, marginLeft: 20, marginRight: 20}}
        />

        <Text style={{color: 'white', marginTop: 20}}>Company Email</Text>
        <TextInput
          label="Company Email"
          name="companyEmail"
          value={formik.values.companyEmail}
          onChangeText={text => formik.handleChange('companyEmail')(text)}
          style={{height: 40, borderColor: 'gray', borderWidth: 1, color: 'black', backgroundColor: '#fff', paddingLeft: 10, marginTop: 1, marginLeft: 20, marginRight: 20}}
        />

        <Text style={{color: 'white', marginTop: 20}}>Company Website</Text>
        <TextInput
          label="Company Website"
          name="companyWebsite"
          value={formik.values.companyWebsite}
          onChangeText={text => formik.handleChange('companyWebsite')(text)} 
          style={{height: 40, borderColor: 'gray', borderWidth: 1, color: 'black', backgroundColor: '#fff', paddingLeft: 10, marginTop: 1, marginLeft: 20, marginRight: 20}}
        />

        <Text style={{color: 'white', marginTop: 20}}>Company Description</Text>
        <TextInput
          label="Description Of Service"
          name="DescriptionOfService"
          value={formik.values.DescriptionOfService}
          onChangeText={text => formik.handleChange('DescriptionOfService')(text)}
          style={{marginBottom: 20, height: 40, borderColor: 'gray', borderWidth: 1, color: 'black', backgroundColor: '#fff', paddingLeft: 10, marginTop: 1, marginLeft: 20, marginRight: 20}}
        />

        <View style={{marginBottom: 20, alignItems: 'center', justifyContent: 'center'}}>
          <Button title="Pick an image from camera roll" onPress={pickImage} />
          <View style={{ width: 200, height: 200, borderColor: 'gray', borderWidth: 1, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
            {image ? <Image source={{uri: image}} style={{width: '100%', height: '100%'}} /> : <Text>Select an Image</Text>}
            {/* {image && image.map((uri, index) => ( */}
              {/* <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} /> */}
            {/* ))} */}
          </View>
        </View>
        
        

        {/* {image && <Image source={{uri: image}} style={{width: 200, height: 200}} />} */}
        
        <View style={{borderWidth: 1}}>
          <Button title="Submit" onPress={formik.handleSubmit}>Submit</Button>
        </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const storeData = async (value) => {
try {
    // Get current array of forms
    const jsonValue = await AsyncStorage.getItem('@storage_Key');
    console.log("storeData - jsonValue: ", jsonValue);
    let forms = jsonValue != null ? JSON.parse(jsonValue) : [];

    console.log("storeData - forms (before appending data): ", forms);
    console.log("storeData - value: ", value);

    console.log("Is forms an array? ", Array.isArray(forms)); // debugging line
    forms.push(value);//"forms.push(value);"
    console.log("storeData - forms: ", forms);//what forms looks like
    // await AsyncStorage.setItem('@storage_Key', jsonValue)
    await AsyncStorage.setItem('@storage_Key', JSON.stringify(forms));

    // Get the updated array from storage
    const updatedJsonValue = await AsyncStorage.getItem('@storage_Key');
    console.log("storeData - Updated forms: ", updatedJsonValue);

  } catch (e) {
    // saving error
    console.log("error in the storeData function: "+e);
  }
}

async function getData() {
  try {
    const jsonValue = await AsyncStorage.getItem('@storage_Key')
    console.log("getData - jsonValue: ", jsonValue);

    return jsonValue != null ? JSON.parse(jsonValue) : []; //I added this: [JSON.parse(jsonValue)] but gpt created a new const variable
  } catch(e) {
    // error reading value
    console.log("error in the getData function");
    return [];
  }
}

async function clearSpecificKey() {
  try {
    await AsyncStorage.removeItem('@storage_Key');
    console.log('Data associated with @storage_Key successfully removed!');
  } catch (e) {
    console.log('Failed to remove the data.');
  }
}


function DisplayScreen() {
  //const [formData, setFormData] = useState([]);
  const { formData } = React.useContext(FormDataContext);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchData() {
      // const data = await getData(); // this is a function you will create to get data from AsyncStorage
      // setFormData(data);
      try {
        const data = await getData(); // this is a function you will create to get data from AsyncStorage
        console.log('DisplayScreen - data: ', data);
        // console.log('DisplayScreen - FormData: ', formData);
        // setFormData(data);

        const updatedJsonValue = await AsyncStorage.getItem('@storage_Key');
        console.log("DisplayScreen - Updated forms: ", updatedJsonValue);
      } catch (error) {
        console.error('DisplayScreen - data: ', error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // This prevents the default behavior of going back

      if (e.data.action.type !== 'POP') {
        return;
      }

      e.preventDefault();

      // This navigates to the HomeScreen
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: 'HomeScreen' }],
      // });
      // navigation.goBack();
      navigation.navigate('HomeScreen');
    });

    return unsubscribe;
  }, [navigation]);

  console.log('DisplayScreen - FormData: ', formData);

  return (
    <ScrollView>
      <View >
        {/* Display the form data here */}
        {formData && formData.map((form) => (
          <View key={form.id} style={styles.displayContainer}>
            <View style={{ flex: 1}}>
              <Text style={{color: 'black'}} >Company Name: {form.companyName}</Text>
              <Text style={{color: 'black'}} >Company Number: {form.companyNumber}</Text>
              <Text style={{color: 'black'}} >Company Email: {form.companyEmail}</Text>
              <Text style={{color: 'black'}} >Company Website: {form.companyWebsite}</Text>
              <Text style={{color: 'black'}} >Desciption of Service: {form.DescriptionOfService}</Text>
            </View>
            {form.imageUri && (
              <Image
                source={{ uri: form.imageUri }}
                style={{ width: 100, height: 100 }}
              />
            )}
          </View>        
        ))}
      </View>
    </ScrollView>
  )
}


// Define your ChatScreen component
function ChatScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25292e' }}>
      {/* <Text style={{color: '#fff'}}>Settings Screen</Text> */}
      
    </View>
  );
}


// Define your SettingsScreen component
function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25292e' }}>
      {/* <Text style={{color: '#fff'}}>Settings Screen</Text> */}
      
    </View>
  );
}

// Create the Stack Navigator
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="HomeScreen" component={HomeScreen} /> 
      <Stack.Screen name="Form" component={FormScreen} />
      <Stack.Screen name="DisplayScreen" component={DisplayScreen} />
    </Stack.Navigator>
  );
}


const Tab = createBottomTabNavigator();

function MyTabs() {
    return (
        <Tab.Navigator >
          <Tab.Screen  name="Home" component={HomeStack} options={{ headerShown: false}}/>
          <Tab.Screen name="Chat" component={ChatScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}



export default function App() {

  const [formData, setFormData] = useState([]); 

  useEffect(() => {
    clearSpecificKey(); // or clearSpecificKey();
  }, []);

  return (

    <View style={styles.container}>
      <FormDataContext.Provider value = {{formData, setFormData}}>
        <NavigationContainer>
          <MyTabs />
        </NavigationContainer>
      </FormDataContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  container2: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 100,
    backgroundColor: '#007BFF', // feel free to change the color
    borderRadius: 20,
    width: 300, 
    height: 10,
  },
  buttonText: {
    fontSize: 20, 
    color: '#FFFFFF',
  },
  displayContainer: {
    backgroundColor: "#808080",
    margin: 10, // Margin around the container
    padding: 10, // Padding within the container
    borderRadius: 5, // Round corners
    borderWidth: 2, // Border width
    borderColor: '#000', // Border color
    // height: 200,
    margin: 5,
    flexDirection: 'row',
  }
});
