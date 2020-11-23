import React from 'react';
import { Text, View } from 'react-native';
import * as Location from 'expo-location';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {text:"Waiting for position..."}
  }

  async componentDidMount(){
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      this.setState({text:'Permission to access location was denied'});
    }
    let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High})
    this.setState({text:"Here is your position:"});
    this.setState({latitude:location['coords']['latitude']});
    this.setState({longitude:location['coords']['longitude']});
  }

  render(){
    return(
      <View>
        <Text>{this.state.text}</Text>
        <View>
          <Text>Latitude: {this.state.latitude}</Text>
          <Text>Longitude: {this.state.longitude}</Text>
        </View>
      </View>
    )
  }
}

export default App
