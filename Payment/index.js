import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Header from '../../../components/Header';
import {COLORS, FONTS, ICONS} from '../../../utils/themes';
import normalize from '../../../utils/normalize';
import {PaymentMethods} from '../../../DummyData';
import CreditCard from '../../../components/CreditCard';
import CustomTextInput from '../../../components/CustomTextInput';
import CustomButton from '../../../components/CustomButton';
import {
  cardDeleteRequest,
  getCardListRequest,
} from '../../../redux/reducers/UserReducer';
import connectionrequest from '../../../utils/netInfo';
import showErrorAlert from '../../../utils/toast';
import Skeleton from '../../../components/Skeleton';

let status = '';

const Payment = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const UserReducer = useSelector(state => state?.UserReducer);

  const CarSpec = route?.params?.CarSpec;
  const CarName = route?.params?.CarName;
  const CarModel = route?.params?.CarModel;
  const screen = route?.params?.screen;

  const BookingPrice = CarSpec?.booking_price;
  const DashCamPrice = CarSpec?.dashcam_price ? CarSpec?.dashcam_price : 0;
  const InsurancePrice = CarSpec?.excess_insurance_price
    ? CarSpec?.excess_insurance_price
    : 0;
  const FullTankPrice = CarSpec?.full_tank_price ? CarSpec?.full_tank_price : 0;
  const TotalPrice =
    BookingPrice + DashCamPrice + InsurancePrice + FullTankPrice;

  const [creditCardList, setCreditCardList] = useState([]);
  const [filteredCardList, setFilteredCardList] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(
    PaymentMethods?.[0]?.value,
  );
  const [promoCode, setPromoCode] = useState('');
  const [cvv, setCVV] = useState('');
  const [listLoader, setListLoader] = useState(true);
  const [delLoader, setDelLoader] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const unSub = navigation.addListener('focus', () => {
      connectionrequest()
        .then(() => {
          dispatch(getCardListRequest());
        })
        .catch(() => {
          showErrorAlert('Please check your internet connection!');
        });
    });
    return unSub;
  }, []);

  useEffect(() => {
    setFilteredCardList(
      creditCardList.filter(card => card.card_type === paymentMethod),
    );
  }, [creditCardList, paymentMethod]);

  const RenderPaymentMethods = ({item, index}) => {
    return (
      <Pressable
        key={index}
        onPress={() => setPaymentMethod(item?.value)}
        style={[
          styles.paymentWrapper,
          {
            backgroundColor:
              paymentMethod === item?.value ? COLORS.black : COLORS.white,
            borderWidth:
              paymentMethod === item?.value ? normalize(0) : normalize(1),
            borderColor:
              paymentMethod === item?.value
                ? 'transparent'
                : COLORS.placeholderTextInput,
          },
        ]}>
        <Text
          style={[
            styles.paymentLabel,
            {
              color:
                paymentMethod === item?.value
                  ? COLORS.white
                  : COLORS.placeholderTextInput,
            },
          ]}>
          {item?.title}
        </Text>
      </Pressable>
    );
  };

  const handleCardSelection = item => {
    setSelectedCard(item);
  };

  const RenderCards = ({item, index}) => {
    return (
      <CreditCard
        cardId={item?._id}
        index={index}
        cardHolder={item?.card_holder_name}
        cardNumber={item?.card_number}
        cardType={item?.card_scheme}
        expMonth={item?.card_expiry_month}
        expYear={item?.card_expiry_year}
        loader={delLoader}
        selectedCard={selectedCard}
        cvv={cvv}
        setCVV={setCVV}
        handleCardSelection={() => handleCardSelection(item)}
        onPress={() => handleCardDelete(item?._id)}
      />
    );
  };

  const handleCardDelete = ID => {
    connectionrequest()
      .then(() => {
        dispatch(cardDeleteRequest({_id: ID}));
      })
      .catch(() => {
        showErrorAlert('Please check your internet connection!');
      });
  };

  const handlePayment = () => {
    if (!selectedCard) {
      showErrorAlert('Please select a card!');
      return;
    }
    if (!cvv) {
      showErrorAlert('Please enter CVV!');
      return;
    }

    navigation.navigate('TripBooked', {
      tripID: CarSpec?._id,
      tripDate: CarSpec?.pickup_date_time,
      returnDate: CarSpec?.return_date_time,
      pickupPlace: CarSpec?.pickup_place,
      returnPlace: CarSpec?.return_place,
      screen: screen,
    });
  };

  useEffect(() => {
    if (status == '' || UserReducer.status != status) {
      switch (UserReducer.status) {
        case 'User/getCardListRequest':
          status = UserReducer.status;
          setListLoader(true);
          break;
        case 'User/getCardListSuccess':
          status = UserReducer.status;
          setListLoader(false);
          setCreditCardList(UserReducer?.getCardListResponse?.data);
          break;
        case 'User/getCardListFailure':
          status = UserReducer.status;
          setListLoader(false);
          break;

        case 'User/cardDeleteRequest':
          status = UserReducer.status;
          setDelLoader(true);
          break;
        case 'User/cardDeleteSuccess':
          status = UserReducer.status;
          setDelLoader(false);
          dispatch(getCardListRequest());
          break;
        case 'User/cardDeleteFailure':
          status = UserReducer.status;
          setDelLoader(false);
          break;
      }
    }
  }, [UserReducer.status]);

  return (
    <SafeAreaView style={styles.parentWrapper}>
      {isFocused && <StatusBar barStyle={'dark-content'} />}

      <View style={styles.bodyWrapper}>
        <Header backIcon={true} headerTitle={'Payment'} />

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bottomGap}
          style={styles.scrollView}>
          <Text style={styles.headerTitle}>Saved Cards</Text>
          <FlatList
            bounces={false}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={PaymentMethods}
            keyExtractor={(_, index) => index.toString()}
            renderItem={RenderPaymentMethods}
            contentContainerStyle={styles.contentGap}
          />

          {listLoader ? (
            <Skeleton card={true} />
          ) : (
            <FlatList
              bounces={false}
              showsHorizontalScrollIndicator={false}
              horizontal
              data={filteredCardList}
              keyExtractor={(_, index) => index.toString()}
              renderItem={RenderCards}
              contentContainerStyle={[styles.contentGap, {gap: normalize(10)}]}
              style={styles.cardList}
              ListEmptyComponent={() => {
                return (
                  <Text style={styles.emptyText}>
                    No saved cards available!
                  </Text>
                );
              }}
            />
          )}

          <CustomTextInput
            placeholder={'Enter promo code'}
            value={promoCode}
            onChangeText={text => setPromoCode(text)}
            leftIcon={ICONS.promo}
            wrapperStyle={{
              backgroundColor: COLORS.offWhiteBG,
            }}
          />

          <Text style={styles.priceWrapper}>Total Price</Text>
          <View style={[styles.rowView, {marginBottom: normalize(10)}]}>
            <Text style={styles.label}>Car Info</Text>
            <Text style={styles.label}>Price</Text>
          </View>
          <View style={[styles.rowView, {marginBottom: normalize(20)}]}>
            <View style={styles.contentGap}>
              <Text style={styles.carTitle}>
                {CarSpec?.name ? CarSpec?.name : CarName}
              </Text>

              <View
                style={[
                  styles.rowView,
                  {justifyContent: 'flex-start', gap: normalize(5)},
                ]}>
                <Text style={[styles.label, {fontSize: normalize(11)}]}>
                  Model no.
                </Text>
                <Text style={[styles.carTitle, {fontSize: normalize(12)}]}>
                  {CarSpec?.model ? CarSpec?.model : CarModel}
                </Text>
              </View>
            </View>
            <Text style={styles.carTitle}>
              {TotalPrice ? `$${TotalPrice}.00` : `$00.00`}
            </Text>
          </View>

          <CustomButton
            onPress={handlePayment}
            title={'Pay Now'}
            color={COLORS.black}
            backgroundColor={COLORS.lightGreen}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  parentWrapper: {
    flex: 1,
    backgroundColor: COLORS.offwhite,
  },
  bodyWrapper: {
    paddingHorizontal: normalize(15),
    paddingTop: normalize(5),
  },
  bottomGap: {
    paddingBottom: Platform.OS === 'android' ? normalize(120) : normalize(50),
  },
  scrollView: {
    marginTop: normalize(20),
  },
  headerTitle: {
    fontSize: normalize(14),
    color: COLORS.black,
    fontFamily: FONTS.JAKARTA_SANS_BOLD,
    marginBottom: normalize(15),
  },
  contentGap: {
    gap: normalize(5),
  },
  paymentWrapper: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(7),
    borderRadius: normalize(20),
  },
  paymentLabel: {
    fontFamily: FONTS.JAKARTA_SANS_MEDIUM,
    fontSize: normalize(11),
    marginTop: Platform.OS === 'android' ? -normalize(2) : normalize(0),
  },
  cardList: {
    marginVertical: normalize(20),
  },
  priceWrapper: {
    fontSize: normalize(14),
    color: COLORS.black,
    fontFamily: FONTS.JAKARTA_SANS_BOLD,
    marginVertical: normalize(20),
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: FONTS.JAKARTA_SANS_MEDIUM,
    fontSize: normalize(13),
    color: COLORS.placeholderTextInput,
  },
  carTitle: {
    fontFamily: FONTS.JAKARTA_SANS_BOLD,
    fontSize: normalize(14),
    color: COLORS.black,
  },
  emptyText: {
    fontSize: normalize(12),
    color: COLORS.placeholderTextInput,
    fontFamily: FONTS.JAKARTA_SANS_MEDIUM,
    alignSelf: 'center',
  },
  loader: {
    marginVertical: normalize(20),
  },
});
