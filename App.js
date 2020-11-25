import React from 'react';
import { Text, View ,Button} from 'react-native';
import * as Location from 'expo-location';
import { BleManager, ScanMode } from 'react-native-ble-plx';
import DeviceInfo from 'react-native-device-info';

//This is the nodejs rest api address. Change depending on your settings. Make sure it is running
const api = 'http://192.168.2.250:5000/api/encounters'

class App extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {textgps:"Waiting for position...",
                  bltscanning:false, //true if we are scanning for new devices
                  gotlocation:false, //true if we have the location
                  deviceIds:[], //list of detected devices in this session
                  wsencounters:[], //list of detected devices stored in the ws
                  uniqueId:"" //unique id for this device
                }
    this.manager = new BleManager()
  }

  async componentDidMount(){
    //Get a unique ID for the device. We are using this for storing the encounters with other bluetooth devices
    this.setState({uniqueId:DeviceInfo.getUniqueId()})
    //Check that we have permission for the location
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      this.setState({text:'Permission to access location was denied'});
    }
    //Get the location
    let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High})
    if (location!=null){
      this.setState({textgps:"Here is your position:",
                   latitude:location['coords']['latitude'],
                   longitude:location['coords']['longitude'],
                   gotlocation:true});
    }
  }

  componentWillUnmount(){
    if (this.state.bltscanning)
      this.manager.stopDeviceScan();
  }

  //This function will start looking for new devices (or stop the search if it was started)
  findDevices(){
    console.log("Starting looking for ble devices")
    if (this.state.bltscanning){
      this.manager.stopDeviceScan();
      this.setState({bltscanning:false}) 
    }
    else
    {
      this.setState({bltscanning:true})
      let ScanOptions = { scanMode: ScanMode.LowLatency }
      this.manager.startDeviceScan(null, ScanOptions, (error, device) => {
        if (error) { 
            return
        }
        console.log("Device found")
        //Check if the device is not found alread (maybe we want to store multiple connections with the same device... not for this small example)
        if (this.state.deviceIds.indexOf(device.id)===-1){
          this.saveInfo(this.state.uniqueId,device.id)
          this.setState({deviceIds: [...this.state.deviceIds, device.id]})
        }
      });
    } 
  }

  //Sends the info to the WS. Logs an encounter (localid + remote device id)
  saveInfo(uniqueId,deviceId){
    console.log("Saving encounter to webservice")
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId1: uniqueId , deviceId2: deviceId })
    };
    //This is being executed in the phone so we need the address of the server. Change according to your settings
    fetch(api, requestOptions)
        .catch( err => {
          err.text().then( errorMessage => {
            console.log(errorMessage)
          })}
        )}

  //This function loads the encounters alread sent to the WS
  async loadEncounters(){
    const encodedId = encodeURIComponent(this.state.uniqueId)
    //get call here
    const response = await fetch(api+'/'+encodedId)
    const encounters = await response.json();
    this.setState({wsencounters:encounters['encounters']})
  }

  render(){
    return(
      <View>
        <Text>UniqueID: {this.state.uniqueId}</Text>
        <Text>{this.state.textgps}</Text>
        <View>
          <Text>Latitude: {this.state.latitude}</Text>
          <Text>Longitude: {this.state.longitude}</Text>
        </View>
        <View style={{paddingBottom:30}}>
          <Button
            onPress={this.findDevices.bind(this)}
            title={(this.state.bltscanning) ? "STOP SCANNING" : "START SCANNING"}
            disabled={!this.state.gotlocation}
            color="#841584"
          
            accessibilityLabel="Scan BLE devices"
          />
          {this.state.deviceIds.map(deviceId => {
            return (
                <Text key={deviceId}>{deviceId}</Text>
            );
          })}
          {(this.state.deviceIds.length==0 && !this.state.bltscanning) ? <Text>Here should appear blt devices detected</Text> : <Text></Text>}
          {(this.state.deviceIds.length==0 && this.state.bltscanning) ? <Text>Scanning now... make sure some device is near with blt activated</Text> : <Text></Text>}
        </View>
        <Button
          onPress={this.loadEncounters.bind(this)}
          title="LOAD LOGGED ENCOUNTERS FROM WS"
          color="#841584"
        />
        {this.state.wsencounters.map(deviceId => {
          return (
              <Text key={deviceId}>{deviceId}</Text>
          );
        })}
        {(this.state.wsencounters.length==0) ? <Text>Not device encounter logged in the WS</Text> : <Text></Text>}
        
      </View>
    )
  }
}

export default App
