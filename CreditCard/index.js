import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS, FONTS, ICONS, IMAGES, SIZES} from '../../utils/themes';
import normalize from '../../utils/normalize';

const CreditCard = ({
  cardId,
  index,
  cardHolder,
  cardNumber,
  cardType,
  expMonth,
  expYear,
  onPress,
  loader,
  selectedCard,
  handleCardSelection,
  screen,
  cvv,
  setCVV,
}) => {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const formatCardNumber = number => {
    return number?.toString()?.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formattedCardNumber = formatCardNumber(cardNumber);

  const cardTypeIcon =
    cardType === 'Visa'
      ? IMAGES.cardType
      : cardType === 'Mastercard'
      ? IMAGES.masterCard
      : cardType === 'American Express'
      ? IMAGES.amex
      : cardType === 'Diners Club'
      ? IMAGES.diners
      : cardType === 'Discover'
      ? IMAGES.discover
      : cardType === 'JCB'
      ? IMAGES.jcb
      : null;

  const flipCard = () => {
    handleCardSelection();
    if (flipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }

    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const animatedStyleFront = {
    transform: [{rotateY: frontInterpolate}],
  };

  const animatedStyleBack = {
    transform: [{rotateY: backInterpolate}],
  };

  useEffect(() => {
    if (selectedCard !== cardId && flipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      setFlipped(false);
      setCVV('');
    }
  }, [selectedCard]);

  if (screen === 'SavedCards') {
    return (
      <View key={index} style={styles.cardWrapper}>
        <View style={[styles.rowView, {marginTop: -normalize(5)}]}>
          <Image source={IMAGES.chip} style={styles.chip} />
          <Image source={cardTypeIcon} style={styles.cardType} />
        </View>
        <Text style={styles.cardNumber}>{formattedCardNumber}</Text>
        <View style={styles.rowView}>
          <Text style={styles.cardHolder} numberOfLines={2}>
            {cardHolder}
          </Text>
          <View style={[styles.rowView, {gap: normalize(10)}]}>
            <Text style={styles.validText}>
              Valid Thru {expMonth} / {expYear}
            </Text>
            <Pressable onPress={onPress}>
              {loader ? (
                <ActivityIndicator size={'small'} color={COLORS.white} />
              ) : (
                <Image source={ICONS.delete} style={styles.deleteIcon} />
              )}
            </Pressable>
          </View>
        </View>
        <View style={styles.overlay} />
      </View>
    );
  }

  return (
    <Pressable key={index} onPress={flipCard} style={styles.cardWrapper}>
      <Animated.View style={[styles.card, animatedStyleFront]}>
        <View style={[styles.rowView, {marginTop: -normalize(5)}]}>
          <Image source={IMAGES.chip} style={styles.chip} />
          <Image source={cardTypeIcon} style={styles.cardType} />
        </View>
        <Text style={styles.cardNumber}>{formattedCardNumber}</Text>
        <View style={styles.rowView}>
          <Text style={styles.cardHolder} numberOfLines={2}>
            {cardHolder}
          </Text>
          <View style={[styles.rowView, {gap: normalize(10)}]}>
            <Text style={styles.validText}>
              Valid Thru {expMonth} / {expYear}
            </Text>

            <Image
              source={
                selectedCard?._id === cardId
                  ? ICONS.tickFilled
                  : ICONS.tickOutlined
              }
              style={styles.selectIcon}
            />
          </View>
        </View>
        <View style={styles.overlay} />
      </Animated.View>

      <Animated.View style={[styles.card, styles.cardBack, animatedStyleBack]}>
        <View style={styles.backCover} />

        <View style={styles.cvvWrapper}>
          <View style={styles.stripWrapper}>
            <View style={styles.blankStrip} />
            <View style={styles.blankStrip} />
            <View style={styles.blankStrip} />
            <View style={styles.blankStrip} />
            <View style={styles.blankStrip} />
          </View>
          <TextInput
            placeholder="CVV"
            placeholderTextColor={COLORS.placeholderTextInput}
            value={cvv}
            onChangeText={text => setCVV(text)}
            maxLength={3}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default CreditCard;

const styles = StyleSheet.create({
  cardWrapper: {
    width: SIZES.width - normalize(70),
    height: normalize(150),
    backgroundColor: '#1A1918',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(18),
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: SIZES.width - normalize(70),
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#1A1918',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(18),
    backfaceVisibility: 'hidden',
    zIndex: 1,
  },
  cardBack: {
    width: SIZES.width - normalize(70),
    backgroundColor: '#333',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: normalize(20),
  },
  backCover: {
    width: SIZES.width - normalize(70),
    height: normalize(30),
    backgroundColor: COLORS.black,
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
  },
  chip: {
    height: normalize(30),
    width: normalize(30),
    resizeMode: 'contain',
  },
  cardType: {
    height: normalize(40),
    width: normalize(40),
    resizeMode: 'contain',
  },
  cardNumber: {
    fontFamily: FONTS.JAKARTA_SANS_MEDIUM,
    fontSize: normalize(15),
    color: COLORS.placeholderTextInput,
    marginTop: normalize(15),
    marginBottom: normalize(25),
    letterSpacing: normalize(1),
  },
  cardHolder: {
    fontFamily: FONTS.JAKARTA_SANS_BOLD,
    fontSize: normalize(14),
    color: COLORS.white,
    width: '50%',
  },
  validText: {
    fontFamily: FONTS.JAKARTA_SANS_REGULAR,
    fontSize: normalize(9),
    color: COLORS.offGray,
  },
  deleteIcon: {
    height: normalize(20),
    width: normalize(20),
  },
  overlay: {
    width: '150%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    transform: [{rotate: '60deg'}],
    position: 'absolute',
    right: -normalize(160),
  },
  selectIcon: {
    height: normalize(12),
    width: normalize(12),
  },
  cvvWrapper: {
    width: '100%',
    height: normalize(30),
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(30),
    paddingRight: normalize(10),
    overflow: 'hidden',
  },
  stripWrapper: {
    width: '85%',
    gap: Platform.OS === 'android' ? normalize(2) : normalize(3),
    overflow: 'hidden',
  },
  blankStrip: {
    width: '100%',
    height: normalize(3),
    backgroundColor: COLORS.lightBlack,
  },
  input: {
    fontFamily: FONTS.JAKARTA_SANS_MEDIUM,
    color: COLORS.white,
    fontSize: normalize(12),
    height: '100%',
    width: '20%',
    paddingTop: Platform.OS === 'android' ? -normalize(5) : normalize(0),
    marginBottom: Platform.OS === 'android' ? -normalize(5) : normalize(0),
    marginLeft: Platform.OS === 'android' ? normalize(3) : normalize(5),
  },
});
