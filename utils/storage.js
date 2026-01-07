import AsyncStorage from '@react-native-async-storage/async-storage';

const BEST_SCORE_KEY = "BEST_SCORE";

export const saveBestScore = async(score) => {
    try{
        await AsyncStorage.setItem(BEST_SCORE_KEY, score.toString())
    }
    catch(error){
        console.log("Error saving best score", error)
    }
}

export const getBestScore = async() => {
    try {
        const value = await AsyncStorage.getItem(BEST_SCORE_KEY)
        return value ? Number(value) : 0;
    } catch (error) {
        console.log("Error reading best score",error)
        return 0;
    }
}