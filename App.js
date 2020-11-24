import React from 'react';
import { Text, View ,Button} from 'react-native';
import * as Location from 'expo-location';
import { BleManager } from 'react-native-ble-plx';
import uuid from 'react-native-uuid';


class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {textgps:"Waiting for position...",
                  bltscanning:false,
                  gotlocation:false,
                  deviceIds:[],
                  wsencounters:[],
                  uniqueId:""}
    this.manager = new BleManager()
  }

  async componentDidMount(){
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      this.setState({text:'Permission to access location was denied'});
    }
    let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High})
    this.setState({textgps:"Here is your position:"});
    this.setState({latitude:location['coords']['latitude']});
    this.setState({longitude:location['coords']['longitude']});
    if (location!=null)
      this.setState({gotlocation:true})
    this.setState({uniqueId:uuid.v1()})
  }

  componentWillUnmount(){
    if (this.state.bltscanning)
      this.manager.stopDeviceScan();
  }

  findDevices(){
    console.log("Starting looking for ble devices")
    if (this.state.bltscanning){
      this.manager.stopDeviceScan();
      this.setState({bltscanning:false}) 
    }
    else
    {
      this.setState({bltscanning:true})
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) { 
            return
        }
        console.log("Device found")
        if (this.state.deviceIds.indexOf(device.id)===-1){
          this.saveInfo(this.state.uniqueId,device.id)
          this.setState({deviceIds: [...this.state.deviceIds, device.id]})
        }
      });
    } 
  }

  saveInfo(uniqueId,deviceId2){
    console.log("Saving encounter to webservice")
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId1: uniqueId , deviceId2: deviceId2 })
    };
    //This is being executed in the phone so we need the address of the server. Change according to your settings
    fetch('http://192.168.2.250:5000/api/encounters', requestOptions)
        .catch( err => {
          err.text().then( errorMessage => {
            console.log(errorMessage)
          })}
        )}

  async loadEncounters(){
    const encodedId = encodeURIComponent(this.state.uniqueId)
    const response = await fetch("http://192.168.2.250:5000/api/encounters/"+encodedId)
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
      </View>
    )
  }
}

export default App
