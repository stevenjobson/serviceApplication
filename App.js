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
import { ScrollView, KeyboardAvoidingView, Image, Alert } from 'react-native';
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

      fetch('http://192.168.235.228:5000/forms', {
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
    //console.log("storeData - jsonValue: ", jsonValue);
    let forms = jsonValue != null ? JSON.parse(jsonValue) : [];

    // console.log("storeData - forms (before appending data): ", forms);
    // console.log("storeData - value: ", value);

    // console.log("Is forms an array? ", Array.isArray(forms)); // debugging line
    forms.push(value);//"forms.push(value);"
    console.log("storeData - forms: ", forms);//what forms looks like
    // await AsyncStorage.setItem('@storage_Key', jsonValue)
    await AsyncStorage.setItem('@storage_Key', JSON.stringify(forms));

    // Get the updated array from storage
    const updatedJsonValue = await AsyncStorage.getItem('@storage_Key');
    console.log("storeData - Updated forms: ", updatedJsonValue);

  } catch (e) {
    // saving error
    console.log("error in the storeData function: " + e);
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

  console.log("DISPLAY SCREEN!!");
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
      // This prevents the default behavior of going back to formScreen from 

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

//pre-login
// Define your SettingsScreen component
function SettingsScreen1( {onLogin} ) {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#25292e' }}>

      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Login', { onLogin })}>
        <Text style={styles.settingsButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.settingsButtonText}>Signup</Text>
      </TouchableOpacity>

    </View>
  );
}


//Post login
// Define your SettingsScreen component 
function SettingsScreen2( {onLogout} ) {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#25292e' }}>
      {/* <Text style={{color: '#fff'}}>Settings Screen</Text> */}
      {/* <Button title="User Profile" onPress={() => navigation.navigate('UserProfile')}> </Button> */}
      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('UserProfile')}>
        <Text style={styles.settingsButtonText}>User Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsButton} onPress={() => onLogout()}>
        <Text style={styles.settingsButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.settingsButtonText}>Signup</Text>
      </TouchableOpacity>  */}

    </View>
  );
}

function UserProfileScreen() {
  
  const [companyName, setCompanyName] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyBiography, setCompanyBiography] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  const profileData =  {
    companyName, 
    companyNumber, 
    companyEmail, 
    companyBiography
  };

  // Function to load the user's profile data from AsyncStorage
  const loadProfileData = async () => {
    try {
      // const loadedCompanyName = await AsyncStorage.getItem('companyName');
      // const loadedCompanyNumber = await AsyncStorage.getItem('companyNumber');
      // const loadedCompanyEmail = await AsyncStorage.getItem('companyEmail');
      // const loadedCompanyBiography = await AsyncStorage.getItem('companyBiography');

      // if (loadedCompanyName !== null) setCompanyName(loadedCompanyName);
      // if (loadedCompanyNumber !== null) setCompanyNumber(loadedCompanyNumber);
      // if (loadedCompanyEmail !== null) setCompanyEmail(loadedCompanyEmail);
      // if (loadedCompanyBiography !== null) setCompanyBiography(loadedCompanyBiography);

      const jsonValue = await AsyncStorage.getItem('@profile_Storage_Key');
      if (jsonValue !== null) {
        // value previously stored
        const data = JSON.parse(jsonValue);
        setCompanyName(data.companyName);
        setCompanyNumber(data.companyNumber);
        setCompanyEmail(data.companyEmail);
        setCompanyBiography(data.companyBiography);
      }
      
    } catch (error) {
      console.error(error);
    }
  };

  // Function to save the user's profile data to AsyncStorage
  // const saveProfileData = async () => {
  //   try {
  //     await AsyncStorage.setItem('companyName', companyName);
  //     await AsyncStorage.setItem('companyNumber', companyNumber);
  //     await AsyncStorage.setItem('companyEmail', companyEmail);
  //     await AsyncStorage.setItem('companyBiography', companyBiography);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // Load the user's profile data from AsyncStorage when the component mounts
  useEffect(async () => {
    await loadProfileData();
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
      {/* <Text style={{marginBottom: 20}}>User Profile Screen</Text> */}

      <Text style={{alignItems: "flex-start" , marginTop: 20}}>Company name:</Text>
      <TextInput
        style={{ padding: 10, textAlignVertical: 'top', height: 40, width: 300, borderColor: 'gray', borderWidth: 1, marginBottom: 20, }}
        onChangeText={text => setCompanyName(text)}
        value={companyName}
        editable={isEditable}
        multiline
      />

      <Text>Company Email:</Text>
      <TextInput
        style={{padding: 10, textAlignVertical: 'top', height: 40, width: 300, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
        onChangeText={text => setCompanyNumber(text)}
        value={companyNumber}
        editable={isEditable}
        multiline
      />

      <Text>Company Number:</Text>
      <TextInput
        style={{ padding: 10, textAlignVertical: 'top', height: 40, width: 300, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
        onChangeText={text => setCompanyEmail(text)}
        value={companyEmail}
        editable={isEditable}
        multiline
      />

      <Text>Company Biography:</Text>
      <TextInput
        style={{padding: 10, textAlignVertical: 'top', height: 200, width: 300, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
        onChangeText={text => setCompanyBiography(text)}
        value={companyBiography}
        editable={isEditable}
        multiline
      />

      

      <Button title={isEditable ? "Save Profile" : "Edit Profile"} onPress= {async () => { setIsEditable(!isEditable); if (!isEditable) { await storeProfileData(profileData); }} }/>

    </View>
  )
}

//store profile data function.
//original storeData function used as reference
//could be shorter -assuming that setItem overwrites previous Item in memory
//in which case I wouldn't need removeItem.
const storeProfileData = async (value) => {
  try {  
    console.log("storeProfileData - values: ", value);

    // const jsonProfile = await AsyncStorage.getItem('@profile_Storage_key');
    // jsonProfile.removeItem();
    
    // await AsyncStorage.removeItem('@profile_Storage_Key');
    await AsyncStorage.setItem('@profile_Storage_Key', JSON.stringify(value));

    const updatedJsonValue = await AsyncStorage.getItem('@profile_Storage_Key');
    console.log("storeProfileData - Updated JSON (testing purposes): ", updatedJsonValue);

  } catch (e) {
    console.log("error in the storeData function: " + e);
  }
}

async function getProfileData() {
  try {
    const jsonProfileValue = await AsyncStorage.getItem('@profile_Storage_Key');
    console.log("getProfileData - jsonValue: ", jsonProfileValue);

    return jsonValue != null ? JSON.parse(jsonProfileValue) : [];
  }
  catch(e) {
      console.log("error: " + e);
      return [];
  }
}


//sign up screen
function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  // const []

  const navigation = useNavigation();


  const handleRegister = () => {
    // Check that the username is at least 3 characters long
    if (username.length < 6) {
      Alert.alert('Username must be at least 6 characters long');
      return;
    }

    // Check that the password is at least 6 characters long
    if (password.length < 6 && password.includes(" ")) {
      Alert.alert('Password must be at least 6 characters long and should not contain a space');
      return;
    }

    // At least one number, one uppercase letter, one lowercase letter and one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;

    if (!passwordRegex.test(password)) {
      Alert.alert('Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character');
      return;
    }

    // Check if the email is valid
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(email)) {
      // return res.status(400).json({ message: 'Invalid email format' });
      Alert.alert("Email is invalidly formatted.");
    }

    // const existingEmail = users.find(user=> user.email === email);
    // if (existingEmail) {
    //   return res.status(400).json({ message: 'Email already taken.' });
    // }

    // Check that the password and confirmation match
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    fetch('http://192.168.235.228:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        confirmPassword: confirmPassword,
        email: email,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.message === 'User registered successfully.') {
          Alert.alert('Registration successful');
          navigation.navigate('Login');
        } else {
          Alert.alert('Registration failed');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    };

    return (
      <View style={styles.container3}>
        <View style={styles.inputContainer}>
          <Text style={styles.label2}>Username</Text>
          <TextInput
            style={styles.input2}
            placeholder="Enter Username"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label2}>Password</Text>
          <TextInput
            style={styles.input2}
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>  
        
        <View style={styles.inputContainer}>
          <Text style={styles.label2}>Confirm Password</Text>
          <TextInput
            style={styles.input2}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
        />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label2}>Email</Text>
          <TextInput
            style={styles.input2}
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            
          />
        </View>
        
        <View style={{marginTop: 10}}>
          <Button title="Register" onPress={handleRegister} />
        </View>
        
      </View>
    );
    
}

//login screen
function LoginScreen({ onLogin }) {
  // return (
  //   <View style={{flex:1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#25292e'}}>
  //     <TouchableOpacity style={styles.settingsButton} >
  //       <Text style={styles.settingsButtonText}>User Name</Text>
  //     </TouchableOpacity>
  //   </View>
  // )
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Call your login API here
    fetch('http://192.168.235.228:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
    .then(response => response.json())
    .then(data => {
      //handle the response here
      console.log(data);
      if (data.message === 'User logged in successfully.') {
      onLogin();
    } else {
      // Handle login failure
      alert('Invalid username or password');
    }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  return (
    <View style={styles.container3}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          onChangeText={setUsername}
          value={username}
          placeholder="Enter your username"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="Enter your password"
          secureTextEntry
        />
      </View>
      {/* <TouchableOpacity style={styles.settingsButton} onPress={handleLogin}>
        <Text style={styles.settingsButtonText}>Login</Text>
      </TouchableOpacity> */}
      <View style={{marginTop: 10}}>
        <Button title="Login" onPress={handleLogin} />
      </View>
      
    </View>
    
  )
}

const PreLogTab = createBottomTabNavigator();

function PreLoggedInTabs( {onLogin} ) {
  return (
    <PreLogTab.Navigator>
      <PreLogTab.Screen name="PrelogHome" component={HomeStack1} options={{ headerShown: false}} />
      <PreLogTab.Screen name="PrelogSettings'" options={{ headerShown: false}} children={()=><SettingsStackScreen1 onLogin={onLogin} />}/>
    </PreLogTab.Navigator>
  );
}

//this handles the post logged in view of my app
const PostLogTab = createBottomTabNavigator();

function PostLoggedInTabs( {onLogout} ) {
    return (
        <PostLogTab.Navigator >
          <PostLogTab.Screen  name="Home" component={HomeStack2} options={{ headerShown: false}}/>
          <PostLogTab.Screen name="Chat" component={ChatScreen} />
          <PostLogTab.Screen name="Settings'" /*component={SettingsStackScreen2}*/ options={{ headerShown: false}} children={()=><SettingsStackScreen2 onLogout={onLogout} />}/>
        </PostLogTab.Navigator>
    );
}

const HomeStackNavigator1 = createStackNavigator();

function HomeStack1() {
  return (
    <HomeStackNavigator1.Navigator>
      <HomeStackNavigator1.Screen name="DisplayScreen" component={DisplayScreen} />
    </HomeStackNavigator1.Navigator>
  )
}

const HomeStackNavigator2 = createStackNavigator();

function HomeStack2() {
  return (
    <HomeStackNavigator2.Navigator initialRouteName="Home">
      <HomeStackNavigator2.Screen name="HomeScreen" component={HomeScreen} /> 
      <HomeStackNavigator2.Screen name="Form" component={FormScreen} />
      <HomeStackNavigator2.Screen name="DisplayScreen" component={DisplayScreen} />
      {/* <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} /> */}
    </HomeStackNavigator2.Navigator>
  );
}

const SettingsStack1 = createStackNavigator();

function SettingsStackScreen1( {onLogin} ) {
  return (
    <SettingsStack1.Navigator>
      <SettingsStack1.Screen name="Settings" component={SettingsScreen1} />
      {/* <SettingsStack2.Screen name="UserProfile" component={UserProfileScreen} /> */}
      <SettingsStack1.Screen name="Login" /*component={LoginScreen}*/ children={()=><LoginScreen onLogin={onLogin}/> } />
      <SettingsStack1.Screen name="SignUp" component={SignUpScreen} />
    </SettingsStack1.Navigator>
  );
}

// Create a new stack for Settings and                
const SettingsStack2 = createStackNavigator();

function SettingsStackScreen2( {onLogout} ) {
  return (
    <SettingsStack2.Navigator>
      <SettingsStack2.Screen name="Settings" /*component={SettingsScreen2}*/ children={()=><SettingsScreen2 onLogout={onLogout}/> }/>
      <SettingsStack2.Screen name="UserProfile" component={UserProfileScreen}/>
      {/* <SettingsStack.Screen name="Login" component={LoginScreen} />
      <SettingsStack.Screen name="SignUp" component={SignUpScreen} /> */}
    </SettingsStack2.Navigator>
  );
}

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState([]); 

  useEffect(() => {
    clearSpecificKey(); // or clearSpecificKey();
  }, []);

  const handleLogin2 = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (

    <View style={styles.container}>
      {/* <FormDataContext.Provider value = {{formData, setFormData}}>
        <NavigationContainer>
          <PostLogTab />
        </NavigationContainer>
      </FormDataContext.Provider> */}
      <FormDataContext.Provider value={{ formData, setFormData }}>
        <NavigationContainer>
          {isLoggedIn ? (
            <PostLoggedInTabs onLogout={handleLogout} />
          ) : (
            <PreLoggedInTabs onLogin={handleLogin2}/>
          )}
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
  },
  settingsButton: {
    width: '100%', // Take up the full width
    padding: 15, // Padding for the text inside
    alignItems: 'flex-start', // Center the text horizontally
    justifyContent: 'center', // Center the text vertically
    borderBottomWidth: 2, // Add a border at the bottom
    borderBottomColor: '#808080', // Make the border grey
    justifyContent: 'flex-start',
  },  
  settingsButtonText: {
    color: '#FFFFFF', // White text
    fontSize: 18, // Larger font size
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  input: {
    height: 40,
    width: '70%',
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },  
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  container3: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#25292e',
    paddingTop: 20,
  },
  // inputContainer2: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: 15,
  // },
  label2: {
    color: '#FFFFFF',
    width: 100,
  },
  input2: {
    height: 40,
    width: '70%',
    justifyContent: 'flex-start',
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  
});
