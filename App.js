import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { Provider } from 'react-redux';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from './screens/SplashScreen';
import { store } from './store/index';
import { loadBestScore } from './store/tenziesSlice';

// Suppress harmless warnings
LogBox.ignoreLogs(['Unable to activate keep awake']);

function Main() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => console.log('AdMob Initialized'))
      .catch((err) => console.log('AdMob init error:', err));
  }, []);

  useEffect(() => {
    store.dispatch(loadBestScore());
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}
