import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
export default function Die({value, isHeld, onPress}){
   return(
     <TouchableOpacity onPress={onPress} style={[{backgroundColor: isHeld ? "#0B2434" : "#FFFFFF"}, styles.die]}>
       <Text style={[styles.text, { color: isHeld ? "white" : "#000"}]}>{value}</Text>
     </TouchableOpacity>
   )
}

const styles=StyleSheet.create({
  die: {
    width: 35,
    height:35,
    borderRadius: 8,
    justifyContent:'center',
    alignItems:'center',
    elevation:3
  },
  text: {
    fontSize:20,
    fontWeight:700
  }

})