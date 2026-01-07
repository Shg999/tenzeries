import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BannerAdComponent from '../components/Banner_Ad';
import Die from '../components/Die';
import { holdDie, rollDice, tick } from '../store/tenziesSlice';

 const Game = ({navigation})=>{
  const dispatch = useDispatch()
  const {dice, rolls, time, tenzies, bestScore} = useSelector(state => state.tenzies);
  const rollSound = useRef(null);

  useEffect(() => {
    const loadSound = async() => {
      rollSound.current = new Audio.Sound();
      try {
        await rollSound.current.loadAsync(require('../assets/sounds/roll-dice.wav'));
      } catch (error) {
        console.log('Error loading sound:', error);
      }
    };
    loadSound();
    return() => {
      if (rollSound.current) {
        rollSound.current.unloadAsync();
      }
    }
  }, []);

  const handleRoll = async () => {
  try {
    await rollSound.current?.replayAsync();
  } catch (e) {
    console.log('Roll sound error', e);
  }
  dispatch(rollDice());
};

  useEffect(()=> {
      const timer = setInterval(()=> dispatch(tick()), 1000);
      return () => clearInterval(timer);
  }, [])
const score = Math.max(10000 - (rolls*100 + time*10), 0)
 useEffect(() => {
    if (tenzies) {
      navigation.navigate('Result', {
        rolls,
        time,
        score,
      });
    }
  }, [tenzies]);
  
  return(
       <View style={styles.container}>
       <View style={styles.subContainer}>
        <View style={styles.textContainer}>
         <Text style={{fontSize:25.6, fontWeight:700, alignItems:'center', justifyContent:'center', color:'black', marginVertical:20, marginHorizontal:20, textAlign:'center'}}>Roll the dice</Text>
         <Text style={{color:'black', fontSize:13, fontWeight:400, alignItems:'center', textAlign:'center', marginHorizontal:25, marginTop:-9}}>Roll until all dice are the same.Click each dice to freeze at its current value between rolls.</Text>

         <View style={styles.grid}>
         {dice.map(die => (
           <Die key={die.id}
           value={die.value}
           isHeld={die.isHeld}
           onPress={() => dispatch(holdDie(die.id))}
           />
         ))}
         </View>
         <TouchableOpacity style={styles.button} onPress={handleRoll}>
             <Text style={styles.buttonText}>Roll</Text>
         </TouchableOpacity>
        </View>
       </View>
       <BannerAdComponent />
    </View>
  )
}

export default Game;

const styles=StyleSheet.create({
container:{
   flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 3,
},
subContainer: {width:360, 
height:379,marginVertical:70, marginHorizontal:25, backgroundColor:'#0B2434'},
textContainer: {width:320, height:320, marginVertical:20, marginHorizontal:20, borderRadius:10, backgroundColor:'white'},
  grid:{
    flexDirection: 'row',
    justifyContent:'center',
    flexWrap:'wrap',
    backgroundColor:'F5F5F5',
    padding:20,
    gap:10,
    borderRadius:10
  },
  button:{
    marginTop:15,
    borderRadius:10,
    backgroundColor:'#5035FF',
    maxWidth:80,
    maxHeight:80,
    padding:5,
    marginHorizontal:130
  },
  buttonText:{
    color: '#FFFFFF',
    fontSize:18,
    fontWeight:'bold',
    textAlign:'center'
  },
  result:{
    marginTop:20,
    alignItems:'center'
  }
})