# BltApp
## Introduction
This project aims to build a sample application in React Native using GPS location and Bluetooth. We will be able to scan for near devices and store this information in a (https://github.com/pglez82/nodejsrestapi)[webservice] for future use.
We are using React Native to test its capabilities and be able to create an app that will work in Android and IOS. Note: this example has only been tested in Android (real device as the emulator doesn't implement bluetooth).

## First considerations
We we develop an application in React Native we have decide if we want to use (https://expo.io/)[Expo] or not. Expo allows as to access sensors without having to write any native code. Unfortunately, bluetooth is not include in expo. Thus we have to make use of an external library for this. We are going into this later.

## Creating a react native application
The easiest way to create a react-native app is to use (https://github.com/expo/create-react-native-app)[create-react-native-app]

```
npx create-react-native-app
```
For running our application we have to execute:
1. `npm start` for running Metro (something for debugging our application and be able to update in on the fly)
2. `npm run android` this compiles the app, builds the apk and sends it to the phone or emulator.

For this to work we need:
1. Android SDK installed
2. We need to set android_sdk_root variable ((https://stackoverflow.com/questions/29391511/where-is-android-sdk-root-and-how-do-i-set-it/30900424)[info])
3. The phone connected to the computer and properly configured for debuggin an application

## Getting the location
Install the location plugin for expo: `expo install expo-location`

The code for getting the location:

```javascript
let { status } = await Location.requestPermissionsAsync();
if (status !== 'granted') {
  return
}

let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High})
```

## Getting bluetooth devices
This get more difficult here. We need a library that uses native code for this, as expo doesn't support it yet. For using a native library we have to first eject expo:
```
expo eject
```
Now, about bluetooth libraries, we have two main options:
* https://github.com/innoveit/react-native-ble-manager
* https://github.com/Polidea/react-native-ble-plx

We will chose the second as the (https://polidea.github.io/react-native-ble-plx/)[documentation] seams better. 
```
npm install react-native-ble-plx --save
npx react-native link react-native-ble-plx
```

