import { Component } from 'react'
import { Image, Text, View } from 'react-native'

export class SplashScreen extends Component {
  render() {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#5035FF'}}>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
           <Image source={require('../assets/images/dice.png')} style={{width:100, height:100, marginRight:10}}/>
           <Text style={{fontSize:40, fontWeight:'bold', color:'white', fontFamily:'Italic'}}>Tenzeries</Text>
        </View>
      </View>
    )
  }
}

export default SplashScreen
