import React from 'react';
import { Text, View ,Button} from 'react-native';
import * as Location from 'expo-location';
import { BleManager } from 'react-native-ble-plx';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {textgps:"Waiting for position...",
                  bltscanning:false,
                  gotlocation:false,
                  deviceIds:[]}
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
        if (this.state.deviceIds.indexOf(device.id)==-1)
          this.setState({deviceIds: [...this.state.deviceIds, device.id]})
      });
    }

  }

  render(){
    return(
      <View>
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
      </View>
    )
  }
}

export default App
