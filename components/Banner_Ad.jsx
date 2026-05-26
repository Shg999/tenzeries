import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-9034824011965003/1044550909';

export default function BannerAdComponent() {
  const [adError, setAdError] = useState(null);
  const [adLoaded, setAdLoaded] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.adWrapper}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            console.log('Ad loaded successfully');
            setAdLoaded(true);
          }}
          onAdFailedToLoad={(error) => {
            console.log('Ad failed to load:', error);
            setAdError(error.message);
          }}
        />
      </View>
      {__DEV__ && adError && (
        <Text style={styles.errorText}>Ad Error: {adError}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adWrapper: {
    overflow: 'hidden',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 10,
    marginTop: 4,
  },
});
