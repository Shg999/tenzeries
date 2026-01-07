import { useEffect, useState } from 'react';
import mobileAds from 'react-native-google-mobile-ads';
import { Provider } from 'react-redux';
import AppNavigator from '../../navigation/AppNavigator';
import { SplashScreen } from '../../screens/SplashScreen';
import { store } from '../../store/index';
import { loadBestScore } from '../../store/tenziesSlice';

function LoadScore() {
  const [showSplash, setShowSplash] = useState(true);
   useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => console.log('AdMob Initialized'));
  }, []);

  useEffect(() => {
    store.dispatch(loadBestScore());
    const timer = setTimeout(()=> {
      setShowSplash(false);
    }, 3000)
    return () => clearTimeout(timer);
  }, []);
  
   if(showSplash) {
    return <SplashScreen />
   }

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <LoadScore />
    </Provider>
  );
}
