import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";

export type LangCode = "en" | "ar" | "fr" | "de";

export interface Translation {
  home: string; menu: string; cart: string; orders: string; profile: string;
  account: string; preferences: string; support: string;
  personalInformation: string; savedAddresses: string; favorites: string;
  orderHistory: string; paymentMethods: string; promoCodes: string;
  darkMode: string; language: string; notifications: string;
  helpCenter: string; contactUs: string; aboutSeaGull: string;
  signOut: string; signInRegister: string; deleteAccount: string;
  loyaltyPoints: string; worth: string;
  bestSellers: string; allCategories: string; viewAll: string;
  addToCart: string; orderNow: string; addedToCart: string;
  myCart: string; emptyCart: string; browseMenu: string; checkout: string;
  subtotal: string; deliveryFee: string; total: string; placeOrder: string;
  myOrders: string; noOrders: string; trackOrder: string; orderDetails: string;
  myFavorites: string; noFavorites: string;
  selectLanguage: string; languageUpdated: string; restartRequired: string;
  deleteAccountTitle: string; deleteAccountMsg: string; deleteAccountConfirm: string;
  cancel: string; confirm: string; save: string; back: string; loading: string;
  searchMenu: string; searchPlaceholder: string;
  today: string; thisWeek: string; all: string;
  pending: string; confirmed: string; preparing: string; onTheWay: string; delivered: string; cancelled: string;
  address: string; notes: string; optional: string;
  version: string;
  exploreMenu: string;
  limitedOffer: string; featured: string; clearAll: string;
  orderSummary: string; serviceFee: string; taxLabel: string;
  proceedToCheckout: string; ourMenu: string;
  signInToSeeOrders: string; signIn: string; keepTrack: string;
  applyPromo: string; specialInstructions: string;
  reorder: string; track: string; moreItems: string;
  paymentPending: string; paymentConfirmed: string;
  readyForPickup: string; deliveryFailed: string; refundPending: string;
  orderPlaced: string; accepted: string; packed: string;
  waitingRider: string; riderAssigned: string; pickedUp: string;
  nearCustomer: string; arrived: string; completed: string; refunded: string;
  // Checkout
  orderType: string; delivery: string; pickup: string; deliveryAddress: string;
  enterDeliveryAddressPlaceholder: string; deliveryNotesPlaceholder: string;
  contactlessDelivery: string; kitchenRequestsPlaceholder: string;
  promoCode: string; enterPromoCodePlaceholder: string; apply: string;
  tipForRider: string; noTip: string; paymentMethod: string; discount: string; tip: string;
  // Confirmation dialogs
  areYouSureSignOut: string; cancelOrderConfirm: string; yesCancelOrder: string;
  removeCardConfirm: string; removeCard: string;
  deleteAddressConfirm: string; deleteAddress: string;
  turnOffAllMsg: string; turnOffAll: string; turnOff: string;
  // Order detail
  yourRider: string; orderProgress: string; itemsOrdered: string;
  cancelOrder: string; rate: string; noteLabel: string; orderNotFound: string;
  // Status labels and descriptions
  statusPaymentPendingLabel: string; statusPaymentPendingDesc: string;
  statusOrderAcceptedLabel: string; statusOrderAcceptedDesc: string;
  statusBeingPreparedLabel: string; statusBeingPreparedDesc: string;
  statusReadyForPickupLabel: string; statusReadyForPickupDesc: string;
  statusOnTheWayLabel: string; statusOnTheWayDesc: string;
  statusAlmostThereLabel: string; statusAlmostThereDesc: string;
  statusDeliveredLabel: string; statusDeliveredDesc: string;
  statusCancelledLabel: string; statusCancelledDesc: string;
  // Settings screens
  myAddresses: string; addNewAddress: string; setDefault: string;
  deleteLabel: string; remove: string; addCard: string;
  savedCards: string; cardHolder: string; expiryLabel: string; defaultLabel: string;
  homeAddress: string; workAddress: string; otherAddress: string;
  enterPromoCodeLabel: string; appliedCodes: string; availableOffers: string;
  use: string; appliedLabel: string; errorMsg: string;
  addressRequired: string; enterDeliveryAddressMsg: string;
  fullName: string; emailAddress: string; phoneNumber: string; saveChanges: string;
  enterYourName: string; enterYourEmail: string; profileUpdated: string;
  branch: string;
  // Contact screen
  selectTopicError: string; messageTooShort: string; messageSent: string;
  sendMessage: string; topicLabel: string; messageLabel: string;
  topicGeneralInquiry: string; topicOrderIssue: string; topicPaymentProblem: string;
  topicFeedback: string; topicPartnership: string; topicOther: string;
  contactCallUs: string; contactWhatsApp: string; contactEmail: string;
  ourBranches: string; contactHeaderSub: string; supportHoursLabel: string;
  // Greeting
  welcome: string; cairoEgypt: string;
  // Language screen
  applyingLanguage: string; rtlRestartNote: string;
  // Notifications
  notifOrderUpdates: string; notifOrderUpdatesDesc: string;
  notifRiderTracking: string; notifRiderTrackingDesc: string;
  notifLoyaltyRewards: string; notifLoyaltyRewardsDesc: string;
  notifPromotions: string; notifPromotionsDesc: string;
  notifNewsletter: string; notifNewsletterDesc: string;
  // Auth screen
  enterPhoneTitle: string; enterNameTitle: string;
  phoneSubtitle: string; nameSubtitle: string;
  continueBtn: string; changePhoneNumber: string;
  freshSeafoodTagline: string; yourFullName: string;
  benefitLoyalty: string; benefitTrackOrders: string; benefitSaveFavorites: string;
  termsAgreement: string; termsOfServiceLink: string; privacyPolicyLink: string;
  invalidPhoneMsg: string; nameRequiredMsg: string; signInErrorMsg: string;
  // Product detail – spice
  spiceNone: string; spiceMild: string; spiceMedium: string; spiceHot: string; spiceExtraHot: string;
  preparationStyle: string; addOnsLabel: string; ingredientsLabel: string; allergensLabel: string;
  badgeNew: string; loadingMenu: string;
  // Menu filters
  filterVegetarian: string; filterHealthy: string;
  // Hero promos
  promo1Title: string; promo1Sub: string;
  promo2Title: string; promo2Sub: string;
  promo3Title: string; promo3Sub: string;
  // About screen
  aboutTagline: string; ourStory: string; ourValues: string;
  awardsRecognition: string; followUs: string;
  aboutBodyText1: string; aboutBodyText2: string;
  valueFreshnessTitle: string; valueFreshnessDesc: string;
  valueSustainTitle: string; valueSustainDesc: string;
  valueFamilyTitle: string; valueFamilyDesc: string;
  valueSafetyTitle: string; valueSafetyDesc: string;
  award1Label: string; award1Org: string;
  award2Label: string; award2Org: string;
  award3Label: string; award3Org: string;
  statYears: string; statCustomers: string; statBranches: string; statRating: string;
  versionCopyright: string;
  // Help screen
  faqCatOrders: string; faqCatPayment: string; faqCatLoyalty: string; faqCatAccount: string;
  faqQ1: string; faqA1: string; faqQ2: string; faqA2: string;
  faqQ3: string; faqA3: string; faqQ4: string; faqA4: string;
  faqQ5: string; faqA5: string; faqQ6: string; faqA6: string;
  faqQ7: string; faqA7: string; faqQ8: string; faqA8: string;
  faqQ9: string; faqA9: string; faqQ10: string; faqA10: string;
  helpTitle: string; helpSubtitle: string;
  cantFindAnswer: string; stillNeedHelp: string; supportAvailable: string;
  faqQ11: string; faqA11: string; faqQ12: string; faqA12: string;
}

const translations: Record<LangCode, Translation> = {
  en: {
    home: "Home", menu: "Menu", cart: "Cart", orders: "Orders", profile: "Profile",
    account: "ACCOUNT", preferences: "PREFERENCES", support: "SUPPORT",
    personalInformation: "Personal Information", savedAddresses: "Saved Addresses",
    favorites: "Favorites", orderHistory: "Order History", paymentMethods: "Payment Methods",
    promoCodes: "Promo Codes", darkMode: "Dark Mode", language: "Language",
    notifications: "Notifications", helpCenter: "Help Center", contactUs: "Contact Us",
    aboutSeaGull: "About Sea Gull", signOut: "Sign Out", signInRegister: "Sign In / Register",
    deleteAccount: "Delete Account", loyaltyPoints: "Loyalty Points", worth: "Worth EGP",
    bestSellers: "Best Sellers", allCategories: "All Categories", viewAll: "View All",
    addToCart: "Add to Cart", orderNow: "Order Now", addedToCart: "Added to cart",
    myCart: "My Cart", emptyCart: "Your cart is empty", browseMenu: "Browse Menu",
    checkout: "Checkout", subtotal: "Subtotal", deliveryFee: "Delivery Fee",
    total: "Total", placeOrder: "Place Order",
    myOrders: "My Orders", noOrders: "No orders yet", trackOrder: "Track Order",
    orderDetails: "Order Details", myFavorites: "My Favorites", noFavorites: "No favorites yet",
    selectLanguage: "Select your preferred language. All 4 languages are now supported.",
    languageUpdated: "Language Updated", restartRequired: "Please restart the app to apply changes.",
    deleteAccountTitle: "Delete Account", deleteAccountMsg: "This will permanently delete your account and all your data. This action cannot be undone.",
    deleteAccountConfirm: "Yes, Delete", cancel: "Cancel", confirm: "Confirm",
    save: "Save", back: "Back", loading: "Loading...",
    searchMenu: "Search Menu", searchPlaceholder: "Search dishes, categories…",
    today: "Today", thisWeek: "This Week", all: "All",
    pending: "Pending", confirmed: "Confirmed", preparing: "Preparing",
    onTheWay: "On the Way", delivered: "Delivered", cancelled: "Cancelled",
    address: "Address", notes: "Notes", optional: "Optional",
    version: "Sea Gull Restaurants v1.0",
    exploreMenu: "Explore our seafood menu and add your favorites",
    limitedOffer: "LIMITED OFFER", featured: "Featured", clearAll: "Clear all",
    orderSummary: "Order Summary", serviceFee: "Service fee", taxLabel: "Tax (14%)",
    proceedToCheckout: "Proceed to Checkout", ourMenu: "Our Menu",
    signInToSeeOrders: "Sign in to see your orders", signIn: "Sign In",
    keepTrack: "Keep track of your orders and deliveries",
    applyPromo: "Apply coupon / promo code",
    specialInstructions: "Special instructions (optional)...",
    reorder: "Reorder", track: "Track", moreItems: "more items",
    paymentPending: "Payment Pending", paymentConfirmed: "Payment Confirmed",
    readyForPickup: "Ready for Pickup", deliveryFailed: "Delivery Failed",
    refundPending: "Refund Pending", orderPlaced: "Order Placed",
    accepted: "Accepted", packed: "Packed", waitingRider: "Waiting for Rider",
    riderAssigned: "Rider Assigned", pickedUp: "Picked Up",
    nearCustomer: "Almost There", arrived: "Arrived",
    completed: "Completed", refunded: "Refunded",
    // Checkout
    orderType: "Order Type", delivery: "Delivery", pickup: "Pickup",
    deliveryAddress: "Delivery Address",
    enterDeliveryAddressPlaceholder: "Enter your delivery address...",
    deliveryNotesPlaceholder: "Delivery notes (floor, landmark...)",
    contactlessDelivery: "Contactless delivery",
    kitchenRequestsPlaceholder: "Any special requests for the kitchen...",
    promoCode: "Promo Code", enterPromoCodePlaceholder: "Enter promo code...", apply: "Apply",
    tipForRider: "Tip for Rider", noTip: "No tip", paymentMethod: "Payment Method",
    discount: "Discount", tip: "Tip",
    // Confirmations
    areYouSureSignOut: "Are you sure you want to sign out?",
    cancelOrderConfirm: "Are you sure you want to cancel this order?",
    yesCancelOrder: "Yes, Cancel",
    removeCardConfirm: "Remove this payment card?",
    removeCard: "Remove Card",
    deleteAddressConfirm: "Are you sure you want to delete this address?",
    deleteAddress: "Delete Address",
    turnOffAllMsg: "This will disable all notifications",
    turnOffAll: "Turn Off All", turnOff: "Turn Off",
    // Order detail
    yourRider: "Your Rider", orderProgress: "Order Progress", itemsOrdered: "Items Ordered",
    cancelOrder: "Cancel Order", rate: "Rate", noteLabel: "Note:", orderNotFound: "Order not found",
    // Status labels
    statusPaymentPendingLabel: "Payment Pending",
    statusPaymentPendingDesc: "Waiting for payment confirmation",
    statusOrderAcceptedLabel: "Order Accepted",
    statusOrderAcceptedDesc: "Restaurant has accepted your order",
    statusBeingPreparedLabel: "Being Prepared",
    statusBeingPreparedDesc: "The kitchen is working on your order",
    statusReadyForPickupLabel: "Ready for Pickup",
    statusReadyForPickupDesc: "Your order is ready and waiting for pickup",
    statusOnTheWayLabel: "On The Way",
    statusOnTheWayDesc: "Your rider is heading to you",
    statusAlmostThereLabel: "Almost There!",
    statusAlmostThereDesc: "Your rider is very close",
    statusDeliveredLabel: "Delivered!",
    statusDeliveredDesc: "Your order has been delivered. Enjoy!",
    statusCancelledLabel: "Cancelled",
    statusCancelledDesc: "This order was cancelled",
    // Settings
    myAddresses: "My Addresses", addNewAddress: "Add New Address", setDefault: "Set Default",
    deleteLabel: "Delete", remove: "Remove", addCard: "Add Card",
    savedCards: "SAVED CARDS", cardHolder: "Card Holder", expiryLabel: "Expires",
    defaultLabel: "Default", homeAddress: "Home", workAddress: "Work", otherAddress: "Other",
    enterPromoCodeLabel: "Enter a promo code", appliedCodes: "APPLIED CODES",
    availableOffers: "AVAILABLE OFFERS", use: "Use", appliedLabel: "Applied",
    errorMsg: "Error", addressRequired: "Address Required",
    enterDeliveryAddressMsg: "Please enter a delivery address.",
    fullName: "Full Name", emailAddress: "Email Address", phoneNumber: "Phone Number",
    saveChanges: "Save Changes", enterYourName: "Enter your name",
    enterYourEmail: "Enter your email", profileUpdated: "Profile updated successfully",
    branch: "Branch",
    selectTopicError: "Please select a topic for your message",
    messageTooShort: "Please describe your issue in at least 20 characters",
    messageSent: "Message sent! We'll reply within 2–4 hours.",
    sendMessage: "Send Message", topicLabel: "Topic", messageLabel: "Message",
    topicGeneralInquiry: "General Inquiry", topicOrderIssue: "Order Issue",
    topicPaymentProblem: "Payment Problem", topicFeedback: "Feedback",
    topicPartnership: "Partnership", topicOther: "Other",
    contactCallUs: "Call Us", contactWhatsApp: "WhatsApp", contactEmail: "Email",
    ourBranches: "Our Branches", contactHeaderSub: "We usually reply within 2 hours",
    supportHoursLabel: "Support hours: Sunday – Thursday, 10 AM – 10 PM",
    welcome: "Welcome", cairoEgypt: "Cairo, Egypt",
    applyingLanguage: "Applying language…",
    rtlRestartNote: "Arabic text direction (RTL) requires an app restart to take full effect.",
    notifOrderUpdates: "Order Updates", notifOrderUpdatesDesc: "Get notified when your order status changes",
    notifRiderTracking: "Rider Tracking", notifRiderTrackingDesc: "Real-time updates when your rider is on the way",
    notifLoyaltyRewards: "Loyalty Rewards", notifLoyaltyRewardsDesc: "Earn points and unlock exclusive rewards",
    notifPromotions: "Promotions & Offers", notifPromotionsDesc: "Exclusive deals, discounts and special offers",
    notifNewsletter: "Newsletter", notifNewsletterDesc: "Weekly menu updates and restaurant news",
    enterPhoneTitle: "Enter your phone number", enterNameTitle: "What's your name?",
    phoneSubtitle: "We'll use this to find or create your account",
    nameSubtitle: "So we can personalize your experience",
    continueBtn: "Continue", changePhoneNumber: "Change phone number",
    freshSeafoodTagline: "Fresh Seafood, Delivered to You",
    yourFullName: "Your full name",
    benefitLoyalty: "Earn loyalty points with every order",
    benefitTrackOrders: "Track your orders in real time",
    benefitSaveFavorites: "Save your favorite dishes",
    termsAgreement: "By continuing, you agree to our",
    termsOfServiceLink: "Terms of Service", privacyPolicyLink: "Privacy Policy",
    invalidPhoneMsg: "Please enter a valid phone number.",
    nameRequiredMsg: "Please enter your name.", signInErrorMsg: "Failed to sign in. Please try again.",
    preparationStyle: "Preparation Style", addOnsLabel: "Add-ons",
    ingredientsLabel: "Ingredients", allergensLabel: "Allergens",
    badgeNew: "NEW", loadingMenu: "Loading delicious food…",
    spiceNone: "Not Spicy", spiceMild: "Mild", spiceMedium: "Medium",
    spiceHot: "Hot", spiceExtraHot: "Extra Hot",
    filterVegetarian: "Vegetarian", filterHealthy: "Healthy",
    promo1Title: "20% OFF First Order", promo1Sub: "Use code WELCOME20",
    promo2Title: "Free Delivery", promo2Sub: "Orders above EGP 150",
    promo3Title: "Family Feast Deal", promo3Sub: "Serves 4–6 people",
    aboutTagline: "Egypt's Premier Seafood Experience",
    ourStory: "Our Story", ourValues: "Our Values",
    awardsRecognition: "Awards & Recognition", followUs: "Follow Us",
    aboutBodyText1: "Founded in 1999, Sea Gull Restaurant has been serving Cairo's finest seafood for over 25 years. What started as a small family restaurant in Zamalek has grown into one of Egypt's most celebrated seafood destinations.",
    aboutBodyText2: "Our chefs source the freshest daily catch directly from Egyptian fishermen in the Mediterranean and Red Sea, ensuring every dish reflects the authentic flavors of the sea.",
    valueFreshnessTitle: "Freshness First", valueFreshnessDesc: "Every ingredient is sourced daily from trusted suppliers and Egyptian fishermen.",
    valueSustainTitle: "Sustainability", valueSustainDesc: "We partner with sustainable fishing cooperatives to protect Egypt's marine ecosystem.",
    valueFamilyTitle: "Family Heritage", valueFamilyDesc: "Three generations of culinary tradition, passed down with love and precision.",
    valueSafetyTitle: "Food Safety", valueSafetyDesc: "We maintain the highest standards of food safety, certified by Egyptian health authorities.",
    award1Label: "Best Seafood Restaurant 2024", award1Org: "Egypt Food Awards",
    award2Label: "5-Star Food Safety Rating", award2Org: "Ministry of Health",
    award3Label: "Most Loved Restaurant", award3Org: "Cairo Foodies 2023",
    statYears: "Years of Excellence", statCustomers: "Happy Customers",
    statBranches: "Premium Branches", statRating: "Average Rating",
    versionCopyright: "© 2024 Sea Gull Restaurant. All rights reserved.",
    faqCatOrders: "Orders", faqCatPayment: "Payment",
    faqCatLoyalty: "Loyalty Points", faqCatAccount: "Account",
    faqQ1: "How do I track my order?", faqA1: "Once your order is confirmed and a rider is assigned, go to the Orders tab → tap your order → you'll see a live map with your rider's location and real-time ETA.",
    faqQ2: "Can I cancel my order?", faqA2: "You can cancel your order within 2 minutes of placing it, as long as the restaurant hasn't started preparing it. Go to your order details and tap 'Cancel Order'.",
    faqQ3: "What if I receive the wrong item?", faqA3: "Contact us immediately via the 'Contact Us' page or call us. We'll send the correct item or issue a full refund within 24 hours.",
    faqQ4: "How long does delivery take?", faqA4: "Average delivery time is 30–45 minutes depending on your location and current kitchen load. Estimated time is shown at checkout.",
    faqQ5: "What payment methods do you accept?", faqA5: "We accept Cash on Delivery, Visa/Mastercard, Meeza cards, Fawry, Vodafone Cash, and InstaPay.",
    faqQ6: "Is my card information secure?", faqA6: "Absolutely. We use 256-bit SSL encryption. Your card data is never stored on our servers — we use PCI-compliant payment processors.",
    faqQ7: "Can I get a refund?", faqA7: "Refunds are processed within 3–5 business days for card payments. Cash refunds are handled by our support team directly.",
    faqQ8: "How do I earn loyalty points?", faqA8: "You earn 10 points for every EGP 100 spent. Points are credited automatically after your order is delivered.",
    faqQ9: "How do I redeem points?", faqA9: "At checkout, you'll see an option to use your points. 100 points = EGP 10 discount. Minimum redemption is 50 points.",
    faqQ10: "Do points expire?", faqA10: "Points are valid for 12 months from the date they were earned. You'll receive a reminder before they expire.",
    helpTitle: "Help Center", helpSubtitle: "How can we help you today?",
    cantFindAnswer: "Can't find what you're looking for?",
    stillNeedHelp: "Still need help?",
    supportAvailable: "Our support team is available 10 AM – 10 PM daily",
    faqQ11: "How do I change my phone number?",
    faqA11: "For security reasons, phone number changes require identity verification. Please contact our support team to initiate this process.",
    faqQ12: "How do I delete my account?",
    faqA12: "You can request account deletion from Settings → Delete Account. This action is irreversible and all your data and points will be permanently deleted.",
  },
  ar: {
    home: "الرئيسية", menu: "القائمة", cart: "السلة", orders: "الطلبات", profile: "الملف",
    account: "الحساب", preferences: "التفضيلات", support: "الدعم",
    personalInformation: "المعلومات الشخصية", savedAddresses: "العناوين المحفوظة",
    favorites: "المفضلة", orderHistory: "سجل الطلبات", paymentMethods: "طرق الدفع",
    promoCodes: "كوبونات الخصم", darkMode: "الوضع الليلي", language: "اللغة",
    notifications: "الإشعارات", helpCenter: "مركز المساعدة", contactUs: "اتصل بنا",
    aboutSeaGull: "عن سي جال", signOut: "تسجيل الخروج", signInRegister: "تسجيل الدخول / التسجيل",
    deleteAccount: "حذف الحساب", loyaltyPoints: "نقاط الولاء", worth: "تساوي جنيه",
    bestSellers: "الأكثر مبيعاً", allCategories: "كل الأصناف", viewAll: "عرض الكل",
    addToCart: "أضف للسلة", orderNow: "اطلب الآن", addedToCart: "تمت الإضافة للسلة",
    myCart: "سلتي", emptyCart: "سلتك فارغة", browseMenu: "تصفح القائمة",
    checkout: "إتمام الطلب", subtotal: "المجموع الجزئي", deliveryFee: "رسوم التوصيل",
    total: "الإجمالي", placeOrder: "تأكيد الطلب",
    myOrders: "طلباتي", noOrders: "لا توجد طلبات بعد", trackOrder: "تتبع الطلب",
    orderDetails: "تفاصيل الطلب", myFavorites: "مفضلتي", noFavorites: "لا توجد مفضلات بعد",
    selectLanguage: "اختر لغتك المفضلة. جميع اللغات الأربعة مدعومة الآن.",
    languageUpdated: "تم تحديث اللغة", restartRequired: "الرجاء إعادة تشغيل التطبيق لتطبيق التغييرات.",
    deleteAccountTitle: "حذف الحساب", deleteAccountMsg: "سيؤدي هذا إلى حذف حسابك وجميع بياناتك نهائياً. لا يمكن التراجع عن هذا الإجراء.",
    deleteAccountConfirm: "نعم، احذف", cancel: "إلغاء", confirm: "تأكيد",
    save: "حفظ", back: "رجوع", loading: "جاري التحميل...",
    searchMenu: "بحث في القائمة", searchPlaceholder: "ابحث عن أطباق، أصناف...",
    today: "اليوم", thisWeek: "هذا الأسبوع", all: "الكل",
    pending: "قيد الانتظار", confirmed: "مؤكد", preparing: "قيد التحضير",
    onTheWay: "في الطريق", delivered: "تم التسليم", cancelled: "ملغي",
    address: "العنوان", notes: "ملاحظات", optional: "اختياري",
    version: "مطاعم سي جال v1.0",
    exploreMenu: "استكشف قائمتنا البحرية وأضف المفضلات",
    limitedOffer: "عرض محدود", featured: "مميزة", clearAll: "حذف الكل",
    orderSummary: "ملخص الطلب", serviceFee: "رسوم الخدمة", taxLabel: "ضريبة (14%)",
    proceedToCheckout: "إتمام الدفع", ourMenu: "قائمتنا",
    signInToSeeOrders: "سجّل دخولك لرؤية طلباتك", signIn: "تسجيل الدخول",
    keepTrack: "تابع طلباتك وعمليات التوصيل",
    applyPromo: "تطبيق كوبون / كود خصم",
    specialInstructions: "تعليمات خاصة (اختياري)...",
    reorder: "إعادة الطلب", track: "تتبع", moreItems: "عنصر آخر",
    paymentPending: "في انتظار الدفع", paymentConfirmed: "تم تأكيد الدفع",
    readyForPickup: "جاهز للاستلام", deliveryFailed: "فشل التوصيل",
    refundPending: "في انتظار الاسترداد", orderPlaced: "تم تقديم الطلب",
    accepted: "مقبول", packed: "تم التعبئة", waitingRider: "في انتظار المندوب",
    riderAssigned: "تم تعيين المندوب", pickedUp: "تم الاستلام",
    nearCustomer: "على وشك الوصول", arrived: "وصل",
    completed: "مكتمل", refunded: "تم الاسترداد",
    // Checkout
    orderType: "نوع الطلب", delivery: "توصيل", pickup: "استلام",
    deliveryAddress: "عنوان التوصيل",
    enterDeliveryAddressPlaceholder: "أدخل عنوان التوصيل...",
    deliveryNotesPlaceholder: "ملاحظات التوصيل (الطابق، معلم...)",
    contactlessDelivery: "توصيل بدون تلامس",
    kitchenRequestsPlaceholder: "أي طلبات خاصة للمطبخ...",
    promoCode: "كوبون الخصم", enterPromoCodePlaceholder: "أدخل كوبون الخصم...", apply: "تطبيق",
    tipForRider: "إكرامية للمندوب", noTip: "بدون إكرامية", paymentMethod: "طريقة الدفع",
    discount: "خصم", tip: "إكرامية",
    // Confirmations
    areYouSureSignOut: "هل أنت متأكد من تسجيل الخروج؟",
    cancelOrderConfirm: "هل أنت متأكد من إلغاء هذا الطلب؟",
    yesCancelOrder: "نعم، ألغِ",
    removeCardConfirm: "هل تريد حذف بطاقة الدفع هذه؟",
    removeCard: "حذف البطاقة",
    deleteAddressConfirm: "هل أنت متأكد من حذف هذا العنوان؟",
    deleteAddress: "حذف العنوان",
    turnOffAllMsg: "سيؤدي هذا إلى تعطيل جميع الإشعارات",
    turnOffAll: "إيقاف الكل", turnOff: "إيقاف",
    // Order detail
    yourRider: "المندوب", orderProgress: "تقدم الطلب", itemsOrdered: "العناصر المطلوبة",
    cancelOrder: "إلغاء الطلب", rate: "تقييم", noteLabel: "ملاحظة:", orderNotFound: "الطلب غير موجود",
    // Status labels
    statusPaymentPendingLabel: "في انتظار الدفع",
    statusPaymentPendingDesc: "في انتظار تأكيد الدفع",
    statusOrderAcceptedLabel: "تم قبول الطلب",
    statusOrderAcceptedDesc: "قبل المطعم طلبك",
    statusBeingPreparedLabel: "قيد التحضير",
    statusBeingPreparedDesc: "المطبخ يعمل على طلبك",
    statusReadyForPickupLabel: "جاهز للاستلام",
    statusReadyForPickupDesc: "طلبك جاهز في انتظار الاستلام",
    statusOnTheWayLabel: "في الطريق",
    statusOnTheWayDesc: "المندوب في طريقه إليك",
    statusAlmostThereLabel: "على وشك الوصول!",
    statusAlmostThereDesc: "المندوب قريب جداً",
    statusDeliveredLabel: "تم التسليم!",
    statusDeliveredDesc: "تم تسليم طلبك. بالعافية!",
    statusCancelledLabel: "ملغي",
    statusCancelledDesc: "تم إلغاء هذا الطلب",
    // Settings
    myAddresses: "عناوين التوصيل", addNewAddress: "إضافة عنوان جديد", setDefault: "تعيين كافتراضي",
    deleteLabel: "حذف", remove: "إزالة", addCard: "إضافة بطاقة",
    savedCards: "البطاقات المحفوظة", cardHolder: "اسم حامل البطاقة", expiryLabel: "تاريخ الانتهاء",
    defaultLabel: "افتراضي", homeAddress: "المنزل", workAddress: "العمل", otherAddress: "أخرى",
    enterPromoCodeLabel: "أدخل كوبون خصم", appliedCodes: "الكوبونات المطبقة",
    availableOffers: "العروض المتاحة", use: "استخدام", appliedLabel: "مطبق",
    errorMsg: "خطأ", addressRequired: "العنوان مطلوب",
    enterDeliveryAddressMsg: "الرجاء إدخال عنوان التوصيل.",
    fullName: "الاسم الكامل", emailAddress: "البريد الإلكتروني", phoneNumber: "رقم الهاتف",
    saveChanges: "حفظ التغييرات", enterYourName: "أدخل اسمك",
    enterYourEmail: "أدخل بريدك الإلكتروني", profileUpdated: "تم تحديث الملف الشخصي بنجاح",
    branch: "الفرع",
    selectTopicError: "الرجاء اختيار موضوع رسالتك",
    messageTooShort: "الرجاء وصف مشكلتك في 20 حرفاً على الأقل",
    messageSent: "تم إرسال رسالتك! سنرد خلال 2–4 ساعات.",
    sendMessage: "إرسال الرسالة", topicLabel: "الموضوع", messageLabel: "الرسالة",
    topicGeneralInquiry: "استفسار عام", topicOrderIssue: "مشكلة في الطلب",
    topicPaymentProblem: "مشكلة في الدفع", topicFeedback: "تعليق",
    topicPartnership: "شراكة", topicOther: "أخرى",
    contactCallUs: "اتصل بنا", contactWhatsApp: "واتساب", contactEmail: "البريد الإلكتروني",
    ourBranches: "فروعنا", contactHeaderSub: "نرد عادةً خلال ساعتين",
    supportHoursLabel: "ساعات الدعم: الأحد – الخميس، 10 صباحاً – 10 مساءً",
    welcome: "مرحباً", cairoEgypt: "القاهرة، مصر",
    applyingLanguage: "جاري تطبيق اللغة…",
    rtlRestartNote: "اتجاه النص العربي (من اليمين لليسار) يتطلب إعادة تشغيل التطبيق.",
    notifOrderUpdates: "تحديثات الطلبات", notifOrderUpdatesDesc: "احصل على إشعار عند تغيير حالة طلبك",
    notifRiderTracking: "تتبع المندوب", notifRiderTrackingDesc: "تحديثات فورية عندما يكون مندوبك في الطريق",
    notifLoyaltyRewards: "نقاط الولاء", notifLoyaltyRewardsDesc: "اكسب نقاطاً وافتح مكافآت حصرية",
    notifPromotions: "العروض والخصومات", notifPromotionsDesc: "صفقات حصرية وخصومات وعروض خاصة",
    notifNewsletter: "النشرة الإخبارية", notifNewsletterDesc: "تحديثات القائمة الأسبوعية وأخبار المطعم",
    enterPhoneTitle: "أدخل رقم هاتفك", enterNameTitle: "ما اسمك؟",
    phoneSubtitle: "سنستخدم هذا للعثور على حسابك أو إنشاء حساب جديد",
    nameSubtitle: "لنتمكن من تخصيص تجربتك",
    continueBtn: "متابعة", changePhoneNumber: "تغيير رقم الهاتف",
    freshSeafoodTagline: "مأكولات بحرية طازجة، توصيل إلى بابك",
    yourFullName: "اسمك الكامل",
    benefitLoyalty: "اكسب نقاط ولاء مع كل طلب",
    benefitTrackOrders: "تتبع طلباتك في الوقت الفعلي",
    benefitSaveFavorites: "احفظ أطباقك المفضلة",
    termsAgreement: "بالمتابعة، أنت توافق على",
    termsOfServiceLink: "شروط الخدمة", privacyPolicyLink: "سياسة الخصوصية",
    invalidPhoneMsg: "الرجاء إدخال رقم هاتف صحيح.",
    nameRequiredMsg: "الرجاء إدخال اسمك.", signInErrorMsg: "فشل تسجيل الدخول. الرجاء المحاولة مرة أخرى.",
    preparationStyle: "طريقة التحضير", addOnsLabel: "الإضافات",
    ingredientsLabel: "المكونات", allergensLabel: "مسببات الحساسية",
    badgeNew: "جديد", loadingMenu: "جاري تحميل الطعام…",
    spiceNone: "غير حار", spiceMild: "خفيف", spiceMedium: "متوسط",
    spiceHot: "حار", spiceExtraHot: "حار جداً",
    filterVegetarian: "نباتي", filterHealthy: "صحي",
    promo1Title: "خصم 20% على الطلب الأول", promo1Sub: "استخدم كود WELCOME20",
    promo2Title: "توصيل مجاني", promo2Sub: "للطلبات فوق 150 جنيه",
    promo3Title: "عرض وليمة العائلة", promo3Sub: "يكفي 4–6 أشخاص",
    aboutTagline: "أبرز تجربة للمأكولات البحرية في مصر",
    ourStory: "قصتنا", ourValues: "قيمنا",
    awardsRecognition: "الجوائز والتميز", followUs: "تابعنا",
    aboutBodyText1: "تأسس مطعم سي جال عام 1999، ويقدم أفضل المأكولات البحرية في القاهرة منذ أكثر من 25 عاماً. بدأ كمطعم عائلي صغير في الزمالك وأصبح اليوم من أشهر وجهات المأكولات البحرية في مصر.",
    aboutBodyText2: "يحرص طهاتنا على الحصول على أطازج المأكولات البحرية يومياً مباشرة من الصيادين المصريين في البحر المتوسط والبحر الأحمر، لضمان أن كل طبق يعكس النكهات الأصيلة للبحر.",
    valueFreshnessTitle: "الطزاجة أولاً", valueFreshnessDesc: "يتم الحصول على كل مكوّن يومياً من موردين موثوقين وصيادين مصريين.",
    valueSustainTitle: "الاستدامة", valueSustainDesc: "نتشارك مع تعاونيات الصيد المستدام لحماية النظام البيئي البحري في مصر.",
    valueFamilyTitle: "الإرث العائلي", valueFamilyDesc: "ثلاثة أجيال من التراث الطهوي، منقولة بحب ودقة.",
    valueSafetyTitle: "سلامة الغذاء", valueSafetyDesc: "نحافظ على أعلى معايير سلامة الغذاء، معتمدة من الجهات الصحية المصرية.",
    award1Label: "أفضل مطعم مأكولات بحرية 2024", award1Org: "جوائز الطعام المصري",
    award2Label: "تقييم 5 نجوم لسلامة الغذاء", award2Org: "وزارة الصحة",
    award3Label: "المطعم الأكثر شعبية", award3Org: "محبو المطاعم في القاهرة 2023",
    statYears: "عاماً من التميز", statCustomers: "عميل سعيد",
    statBranches: "فروع متميزة", statRating: "متوسط التقييم",
    versionCopyright: "© 2024 مطعم سي جال. جميع الحقوق محفوظة.",
    faqCatOrders: "الطلبات", faqCatPayment: "الدفع",
    faqCatLoyalty: "نقاط الولاء", faqCatAccount: "الحساب",
    faqQ1: "كيف أتتبع طلبي؟", faqA1: "بمجرد تأكيد طلبك وتعيين مندوب، انتقل إلى تبويب الطلبات → اضغط على طلبك → ستجد خريطة مباشرة مع موقع المندوب ووقت الوصول المتوقع.",
    faqQ2: "هل يمكنني إلغاء طلبي؟", faqA2: "يمكنك إلغاء طلبك في غضون دقيقتين من تقديمه، طالما لم يبدأ المطعم في تحضيره. انتقل إلى تفاصيل طلبك واضغط على 'إلغاء الطلب'.",
    faqQ3: "ماذا لو استلمت صنفاً خاطئاً؟", faqA3: "تواصل معنا فوراً عبر صفحة 'اتصل بنا' أو اتصل بنا. سنرسل الصنف الصحيح أو نقوم باسترداد كامل خلال 24 ساعة.",
    faqQ4: "كم يستغرق التوصيل؟", faqA4: "متوسط وقت التوصيل 30–45 دقيقة حسب موقعك وحمل المطبخ. الوقت المتوقع يظهر عند إتمام الطلب.",
    faqQ5: "ما طرق الدفع المتاحة؟", faqA5: "نقبل الدفع نقداً عند الاستلام، فيزا/ماستركارد، بطاقات ميزة، فوري، فودافون كاش، وإنستاباي.",
    faqQ6: "هل بيانات بطاقتي آمنة؟", faqA6: "بالتأكيد. نستخدم تشفير SSL 256-bit. لا يتم تخزين بيانات بطاقتك على خوادمنا — نستخدم معالجات دفع متوافقة مع PCI.",
    faqQ7: "هل يمكنني استرداد المبلغ؟", faqA7: "تُعالج المبالغ المستردة خلال 3–5 أيام عمل لمدفوعات البطاقة. يتولى فريق الدعم لدينا استرداد النقد مباشرة.",
    faqQ8: "كيف أكسب نقاط الولاء؟", faqA8: "تكسب 10 نقاط مقابل كل 100 جنيه تنفقها. تُضاف النقاط تلقائياً بعد تسليم طلبك.",
    faqQ9: "كيف أستبدل النقاط؟", faqA9: "عند إتمام الطلب، ستجد خياراً لاستخدام نقاطك. 100 نقطة = 10 جنيه خصم. الحد الأدنى للاستبدال 50 نقطة.",
    faqQ10: "هل تنتهي صلاحية النقاط؟", faqA10: "النقاط صالحة لمدة 12 شهراً من تاريخ كسبها. ستتلقى تذكيراً قبل انتهاء صلاحيتها.",
    helpTitle: "مركز المساعدة", helpSubtitle: "كيف يمكننا مساعدتك اليوم؟",
    cantFindAnswer: "لم تجد ما تبحث عنه؟",
    stillNeedHelp: "لا تزال بحاجة إلى مساعدة؟",
    supportAvailable: "فريق الدعم لدينا متاح من 10 صباحاً حتى 10 مساءً يومياً",
    faqQ11: "كيف أغير رقم هاتفي؟",
    faqA11: "لأسباب أمنية، يتطلب تغيير رقم الهاتف التحقق من الهوية. يرجى التواصل مع فريق الدعم لبدء هذه العملية.",
    faqQ12: "كيف أحذف حسابي؟",
    faqA12: "يمكنك طلب حذف الحساب من الإعدادات ← حذف الحساب. هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بياناتك ونقاطك نهائياً.",
  },
  fr: {
    home: "Accueil", menu: "Menu", cart: "Panier", orders: "Commandes", profile: "Profil",
    account: "COMPTE", preferences: "PRÉFÉRENCES", support: "SUPPORT",
    personalInformation: "Informations personnelles", savedAddresses: "Adresses enregistrées",
    favorites: "Favoris", orderHistory: "Historique des commandes", paymentMethods: "Modes de paiement",
    promoCodes: "Codes promo", darkMode: "Mode sombre", language: "Langue",
    notifications: "Notifications", helpCenter: "Centre d'aide", contactUs: "Nous contacter",
    aboutSeaGull: "À propos de Sea Gull", signOut: "Déconnexion", signInRegister: "Se connecter / S'inscrire",
    deleteAccount: "Supprimer le compte", loyaltyPoints: "Points de fidélité", worth: "Valeur EGP",
    bestSellers: "Meilleures ventes", allCategories: "Toutes les catégories", viewAll: "Voir tout",
    addToCart: "Ajouter au panier", orderNow: "Commander maintenant", addedToCart: "Ajouté au panier",
    myCart: "Mon panier", emptyCart: "Votre panier est vide", browseMenu: "Parcourir le menu",
    checkout: "Passer commande", subtotal: "Sous-total", deliveryFee: "Frais de livraison",
    total: "Total", placeOrder: "Confirmer la commande",
    myOrders: "Mes commandes", noOrders: "Aucune commande pour l'instant", trackOrder: "Suivre la commande",
    orderDetails: "Détails de la commande", myFavorites: "Mes favoris", noFavorites: "Aucun favori pour l'instant",
    selectLanguage: "Sélectionnez votre langue préférée. Les 4 langues sont maintenant disponibles.",
    languageUpdated: "Langue mise à jour", restartRequired: "Veuillez redémarrer l'application pour appliquer les changements.",
    deleteAccountTitle: "Supprimer le compte", deleteAccountMsg: "Cela supprimera définitivement votre compte et toutes vos données. Cette action est irréversible.",
    deleteAccountConfirm: "Oui, supprimer", cancel: "Annuler", confirm: "Confirmer",
    save: "Enregistrer", back: "Retour", loading: "Chargement...",
    searchMenu: "Rechercher dans le menu", searchPlaceholder: "Rechercher des plats, catégories…",
    today: "Aujourd'hui", thisWeek: "Cette semaine", all: "Tout",
    pending: "En attente", confirmed: "Confirmé", preparing: "En préparation",
    onTheWay: "En route", delivered: "Livré", cancelled: "Annulé",
    address: "Adresse", notes: "Notes", optional: "Optionnel",
    version: "Sea Gull Restaurants v1.0",
    exploreMenu: "Explorez notre menu et ajoutez vos favoris",
    limitedOffer: "OFFRE LIMITÉE", featured: "À la une", clearAll: "Tout effacer",
    orderSummary: "Récapitulatif de commande", serviceFee: "Frais de service", taxLabel: "TVA (14%)",
    proceedToCheckout: "Passer à la caisse", ourMenu: "Notre Menu",
    signInToSeeOrders: "Connectez-vous pour voir vos commandes", signIn: "Se connecter",
    keepTrack: "Suivez vos commandes et vos livraisons",
    applyPromo: "Appliquer un coupon / code promo",
    specialInstructions: "Instructions spéciales (optionnel)...",
    reorder: "Recommander", track: "Suivre", moreItems: "autres articles",
    paymentPending: "Paiement en attente", paymentConfirmed: "Paiement confirmé",
    readyForPickup: "Prêt pour le retrait", deliveryFailed: "Échec de livraison",
    refundPending: "Remboursement en attente", orderPlaced: "Commande passée",
    accepted: "Accepté", packed: "Emballé", waitingRider: "En attente du livreur",
    riderAssigned: "Livreur assigné", pickedUp: "Récupéré",
    nearCustomer: "Presque là", arrived: "Arrivé",
    completed: "Terminé", refunded: "Remboursé",
    // Checkout
    orderType: "Type de commande", delivery: "Livraison", pickup: "Retrait",
    deliveryAddress: "Adresse de livraison",
    enterDeliveryAddressPlaceholder: "Entrez votre adresse de livraison...",
    deliveryNotesPlaceholder: "Notes de livraison (étage, repère...)",
    contactlessDelivery: "Livraison sans contact",
    kitchenRequestsPlaceholder: "Demandes spéciales pour la cuisine...",
    promoCode: "Code Promo", enterPromoCodePlaceholder: "Entrez le code promo...", apply: "Appliquer",
    tipForRider: "Pourboire pour le livreur", noTip: "Sans pourboire", paymentMethod: "Mode de paiement",
    discount: "Remise", tip: "Pourboire",
    // Confirmations
    areYouSureSignOut: "Êtes-vous sûr de vouloir vous déconnecter?",
    cancelOrderConfirm: "Êtes-vous sûr de vouloir annuler cette commande?",
    yesCancelOrder: "Oui, annuler",
    removeCardConfirm: "Supprimer cette carte de paiement?",
    removeCard: "Supprimer la carte",
    deleteAddressConfirm: "Êtes-vous sûr de vouloir supprimer cette adresse?",
    deleteAddress: "Supprimer l'adresse",
    turnOffAllMsg: "Cela désactivera toutes les notifications",
    turnOffAll: "Tout désactiver", turnOff: "Désactiver",
    // Order detail
    yourRider: "Votre livreur", orderProgress: "Progression de la commande", itemsOrdered: "Articles commandés",
    cancelOrder: "Annuler la commande", rate: "Évaluer", noteLabel: "Note:", orderNotFound: "Commande introuvable",
    // Status labels
    statusPaymentPendingLabel: "Paiement en attente",
    statusPaymentPendingDesc: "En attente de confirmation de paiement",
    statusOrderAcceptedLabel: "Commande acceptée",
    statusOrderAcceptedDesc: "Le restaurant a accepté votre commande",
    statusBeingPreparedLabel: "En préparation",
    statusBeingPreparedDesc: "La cuisine prépare votre commande",
    statusReadyForPickupLabel: "Prêt pour le retrait",
    statusReadyForPickupDesc: "Votre commande est prête",
    statusOnTheWayLabel: "En route",
    statusOnTheWayDesc: "Votre livreur est en chemin",
    statusAlmostThereLabel: "Presque là!",
    statusAlmostThereDesc: "Votre livreur est très proche",
    statusDeliveredLabel: "Livré!",
    statusDeliveredDesc: "Votre commande a été livrée. Bon appétit!",
    statusCancelledLabel: "Annulé",
    statusCancelledDesc: "Cette commande a été annulée",
    // Settings
    myAddresses: "Mes adresses", addNewAddress: "Ajouter une adresse", setDefault: "Définir par défaut",
    deleteLabel: "Supprimer", remove: "Retirer", addCard: "Ajouter une carte",
    savedCards: "CARTES ENREGISTRÉES", cardHolder: "Titulaire de la carte", expiryLabel: "Expiration",
    defaultLabel: "Par défaut", homeAddress: "Maison", workAddress: "Travail", otherAddress: "Autre",
    enterPromoCodeLabel: "Entrez un code promo", appliedCodes: "CODES APPLIQUÉS",
    availableOffers: "OFFRES DISPONIBLES", use: "Utiliser", appliedLabel: "Appliqué",
    errorMsg: "Erreur", addressRequired: "Adresse requise",
    enterDeliveryAddressMsg: "Veuillez saisir une adresse de livraison.",
    fullName: "Nom complet", emailAddress: "Adresse e-mail", phoneNumber: "Numéro de téléphone",
    saveChanges: "Enregistrer les modifications", enterYourName: "Entrez votre nom",
    enterYourEmail: "Entrez votre e-mail", profileUpdated: "Profil mis à jour avec succès",
    branch: "Succursale",
    selectTopicError: "Veuillez sélectionner un sujet pour votre message",
    messageTooShort: "Veuillez décrire votre problème en au moins 20 caractères",
    messageSent: "Message envoyé ! Nous répondrons dans 2–4 heures.",
    sendMessage: "Envoyer le message", topicLabel: "Sujet", messageLabel: "Message",
    topicGeneralInquiry: "Demande générale", topicOrderIssue: "Problème de commande",
    topicPaymentProblem: "Problème de paiement", topicFeedback: "Commentaire",
    topicPartnership: "Partenariat", topicOther: "Autre",
    contactCallUs: "Appelez-nous", contactWhatsApp: "WhatsApp", contactEmail: "E-mail",
    ourBranches: "Nos succursales", contactHeaderSub: "Nous répondons généralement en moins de 2 heures",
    supportHoursLabel: "Heures d'assistance : dimanche – jeudi, 10h – 22h",
    welcome: "Bienvenue", cairoEgypt: "Le Caire, Égypte",
    applyingLanguage: "Application de la langue…",
    rtlRestartNote: "La direction du texte arabe (RTL) nécessite un redémarrage de l'application.",
    notifOrderUpdates: "Mises à jour des commandes", notifOrderUpdatesDesc: "Soyez notifié lorsque le statut de votre commande change",
    notifRiderTracking: "Suivi du livreur", notifRiderTrackingDesc: "Mises à jour en temps réel lorsque votre livreur est en route",
    notifLoyaltyRewards: "Récompenses de fidélité", notifLoyaltyRewardsDesc: "Gagnez des points et débloquez des récompenses exclusives",
    notifPromotions: "Promotions et offres", notifPromotionsDesc: "Offres exclusives, remises et promotions spéciales",
    notifNewsletter: "Newsletter", notifNewsletterDesc: "Mises à jour hebdomadaires du menu et actualités du restaurant",
    enterPhoneTitle: "Entrez votre numéro de téléphone", enterNameTitle: "Quel est votre nom ?",
    phoneSubtitle: "Nous l'utiliserons pour trouver ou créer votre compte",
    nameSubtitle: "Pour personnaliser votre expérience",
    continueBtn: "Continuer", changePhoneNumber: "Modifier le numéro de téléphone",
    freshSeafoodTagline: "Fruits de mer frais, livrés chez vous",
    yourFullName: "Votre nom complet",
    benefitLoyalty: "Gagnez des points de fidélité à chaque commande",
    benefitTrackOrders: "Suivez vos commandes en temps réel",
    benefitSaveFavorites: "Sauvegardez vos plats favoris",
    termsAgreement: "En continuant, vous acceptez nos",
    termsOfServiceLink: "Conditions d'utilisation", privacyPolicyLink: "Politique de confidentialité",
    invalidPhoneMsg: "Veuillez entrer un numéro de téléphone valide.",
    nameRequiredMsg: "Veuillez entrer votre nom.", signInErrorMsg: "Échec de la connexion. Veuillez réessayer.",
    preparationStyle: "Style de préparation", addOnsLabel: "Suppléments",
    ingredientsLabel: "Ingrédients", allergensLabel: "Allergènes",
    badgeNew: "NOUVEAU", loadingMenu: "Chargement des plats…",
    spiceNone: "Pas épicé", spiceMild: "Doux", spiceMedium: "Moyen",
    spiceHot: "Épicé", spiceExtraHot: "Très épicé",
    filterVegetarian: "Végétarien", filterHealthy: "Sain",
    promo1Title: "20% de réduction sur la 1ère commande", promo1Sub: "Utilisez le code WELCOME20",
    promo2Title: "Livraison gratuite", promo2Sub: "Commandes supérieures à 150 EGP",
    promo3Title: "Offre festin familial", promo3Sub: "Pour 4 à 6 personnes",
    aboutTagline: "La première expérience de fruits de mer en Égypte",
    ourStory: "Notre histoire", ourValues: "Nos valeurs",
    awardsRecognition: "Prix et distinctions", followUs: "Suivez-nous",
    aboutBodyText1: "Fondé en 1999, Sea Gull Restaurant sert les meilleurs fruits de mer du Caire depuis plus de 25 ans. Ce qui a commencé comme un petit restaurant familial à Zamalek est devenu l'une des destinations de fruits de mer les plus célèbres d'Égypte.",
    aboutBodyText2: "Nos chefs s'approvisionnent en poisson frais directement auprès des pêcheurs égyptiens en Méditerranée et en mer Rouge, pour que chaque plat reflète les saveurs authentiques de la mer.",
    valueFreshnessTitle: "La fraîcheur avant tout", valueFreshnessDesc: "Chaque ingrédient est sourcé quotidiennement auprès de fournisseurs de confiance et de pêcheurs égyptiens.",
    valueSustainTitle: "Durabilité", valueSustainDesc: "Nous collaborons avec des coopératives de pêche durable pour protéger l'écosystème marin d'Égypte.",
    valueFamilyTitle: "Patrimoine familial", valueFamilyDesc: "Trois générations de tradition culinaire, transmises avec amour et précision.",
    valueSafetyTitle: "Sécurité alimentaire", valueSafetyDesc: "Nous maintenons les normes les plus élevées de sécurité alimentaire, certifiées par les autorités sanitaires égyptiennes.",
    award1Label: "Meilleur restaurant de fruits de mer 2024", award1Org: "Egypt Food Awards",
    award2Label: "Note 5 étoiles en sécurité alimentaire", award2Org: "Ministère de la Santé",
    award3Label: "Restaurant le plus apprécié", award3Org: "Cairo Foodies 2023",
    statYears: "Années d'excellence", statCustomers: "Clients satisfaits",
    statBranches: "Succursales premium", statRating: "Note moyenne",
    versionCopyright: "© 2024 Sea Gull Restaurant. Tous droits réservés.",
    faqCatOrders: "Commandes", faqCatPayment: "Paiement",
    faqCatLoyalty: "Points de fidélité", faqCatAccount: "Compte",
    faqQ1: "Comment suivre ma commande ?", faqA1: "Une fois votre commande confirmée et un livreur assigné, allez dans l'onglet Commandes → appuyez sur votre commande → vous verrez une carte en direct.",
    faqQ2: "Puis-je annuler ma commande ?", faqA2: "Vous pouvez annuler dans les 2 minutes suivant la commande, tant que le restaurant n'a pas commencé la préparation.",
    faqQ3: "Que faire si je reçois le mauvais article ?", faqA3: "Contactez-nous immédiatement via 'Nous contacter' ou appelez-nous. Nous enverrons l'article correct ou rembourserons sous 24h.",
    faqQ4: "Combien de temps prend la livraison ?", faqA4: "Le temps moyen est de 30–45 minutes selon votre localisation et la charge de la cuisine.",
    faqQ5: "Quels modes de paiement acceptez-vous ?", faqA5: "Nous acceptons le paiement à la livraison, Visa/Mastercard, Meeza, Fawry, Vodafone Cash et InstaPay.",
    faqQ6: "Mes données bancaires sont-elles sécurisées ?", faqA6: "Absolument. Nous utilisons un chiffrement SSL 256 bits. Vos données ne sont jamais stockées sur nos serveurs.",
    faqQ7: "Puis-je obtenir un remboursement ?", faqA7: "Les remboursements sont traités en 3–5 jours ouvrés pour les paiements par carte.",
    faqQ8: "Comment gagner des points de fidélité ?", faqA8: "Vous gagnez 10 points pour chaque 100 EGP dépensés, crédités automatiquement après livraison.",
    faqQ9: "Comment utiliser mes points ?", faqA9: "À la commande, vous verrez une option pour utiliser vos points. 100 points = 10 EGP de réduction.",
    faqQ10: "Les points expirent-ils ?", faqA10: "Les points sont valides 12 mois à partir de la date d'obtention.",
    helpTitle: "Centre d'aide", helpSubtitle: "Comment pouvons-nous vous aider aujourd'hui ?",
    cantFindAnswer: "Vous ne trouvez pas ce que vous cherchez ?",
    stillNeedHelp: "Encore besoin d'aide ?",
    supportAvailable: "Notre équipe d'assistance est disponible de 10h à 22h tous les jours",
    faqQ11: "Comment changer mon numéro de téléphone ?",
    faqA11: "Pour des raisons de sécurité, le changement de numéro de téléphone nécessite une vérification d'identité. Contactez notre équipe d'assistance.",
    faqQ12: "Comment supprimer mon compte ?",
    faqA12: "Vous pouvez demander la suppression du compte dans Paramètres → Supprimer le compte. Cette action est irréversible et toutes vos données seront supprimées.",
  },
  de: {
    home: "Startseite", menu: "Speisekarte", cart: "Warenkorb", orders: "Bestellungen", profile: "Profil",
    account: "KONTO", preferences: "EINSTELLUNGEN", support: "SUPPORT",
    personalInformation: "Persönliche Daten", savedAddresses: "Gespeicherte Adressen",
    favorites: "Favoriten", orderHistory: "Bestellverlauf", paymentMethods: "Zahlungsmethoden",
    promoCodes: "Aktionscodes", darkMode: "Dunkelmodus", language: "Sprache",
    notifications: "Benachrichtigungen", helpCenter: "Hilfecenter", contactUs: "Kontakt",
    aboutSeaGull: "Über Sea Gull", signOut: "Abmelden", signInRegister: "Anmelden / Registrieren",
    deleteAccount: "Konto löschen", loyaltyPoints: "Treuepunkte", worth: "Wert EGP",
    bestSellers: "Bestseller", allCategories: "Alle Kategorien", viewAll: "Alle anzeigen",
    addToCart: "In den Warenkorb", orderNow: "Jetzt bestellen", addedToCart: "Zum Warenkorb hinzugefügt",
    myCart: "Mein Warenkorb", emptyCart: "Ihr Warenkorb ist leer", browseMenu: "Menü durchsuchen",
    checkout: "Zur Kasse", subtotal: "Zwischensumme", deliveryFee: "Liefergebühr",
    total: "Gesamt", placeOrder: "Bestellung aufgeben",
    myOrders: "Meine Bestellungen", noOrders: "Noch keine Bestellungen", trackOrder: "Bestellung verfolgen",
    orderDetails: "Bestelldetails", myFavorites: "Meine Favoriten", noFavorites: "Noch keine Favoriten",
    selectLanguage: "Wählen Sie Ihre bevorzugte Sprache. Alle 4 Sprachen werden jetzt unterstützt.",
    languageUpdated: "Sprache aktualisiert", restartRequired: "Bitte starten Sie die App neu, um Änderungen anzuwenden.",
    deleteAccountTitle: "Konto löschen", deleteAccountMsg: "Dadurch werden Ihr Konto und alle Ihre Daten dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
    deleteAccountConfirm: "Ja, löschen", cancel: "Abbrechen", confirm: "Bestätigen",
    save: "Speichern", back: "Zurück", loading: "Laden...",
    searchMenu: "Menü durchsuchen", searchPlaceholder: "Gerichte, Kategorien suchen…",
    today: "Heute", thisWeek: "Diese Woche", all: "Alle",
    pending: "Ausstehend", confirmed: "Bestätigt", preparing: "In Vorbereitung",
    onTheWay: "Unterwegs", delivered: "Geliefert", cancelled: "Storniert",
    address: "Adresse", notes: "Notizen", optional: "Optional",
    version: "Sea Gull Restaurants v1.0",
    exploreMenu: "Entdecken Sie unser Meeresfrüchte-Menü",
    limitedOffer: "SONDERANGEBOT", featured: "Empfohlen", clearAll: "Alle löschen",
    orderSummary: "Bestellübersicht", serviceFee: "Servicegebühr", taxLabel: "Steuer (14%)",
    proceedToCheckout: "Zur Kasse", ourMenu: "Unsere Speisekarte",
    signInToSeeOrders: "Melden Sie sich an, um Ihre Bestellungen zu sehen", signIn: "Anmelden",
    keepTrack: "Verfolgen Sie Ihre Bestellungen und Lieferungen",
    applyPromo: "Gutschein / Promo-Code eingeben",
    specialInstructions: "Besondere Anweisungen (optional)...",
    reorder: "Erneut bestellen", track: "Verfolgen", moreItems: "weitere Artikel",
    paymentPending: "Zahlung ausstehend", paymentConfirmed: "Zahlung bestätigt",
    readyForPickup: "Zur Abholung bereit", deliveryFailed: "Lieferung fehlgeschlagen",
    refundPending: "Erstattung ausstehend", orderPlaced: "Bestellung aufgegeben",
    accepted: "Angenommen", packed: "Verpackt", waitingRider: "Wartet auf Fahrer",
    riderAssigned: "Fahrer zugeteilt", pickedUp: "Abgeholt",
    nearCustomer: "Fast da", arrived: "Angekommen",
    completed: "Abgeschlossen", refunded: "Erstattet",
    // Checkout
    orderType: "Bestellart", delivery: "Lieferung", pickup: "Abholung",
    deliveryAddress: "Lieferadresse",
    enterDeliveryAddressPlaceholder: "Lieferadresse eingeben...",
    deliveryNotesPlaceholder: "Lieferhinweise (Etage, Orientierungspunkt...)",
    contactlessDelivery: "Kontaktlose Lieferung",
    kitchenRequestsPlaceholder: "Besondere Wünsche für die Küche...",
    promoCode: "Aktionscode", enterPromoCodePlaceholder: "Aktionscode eingeben...", apply: "Anwenden",
    tipForRider: "Trinkgeld für Fahrer", noTip: "Kein Trinkgeld", paymentMethod: "Zahlungsmethode",
    discount: "Rabatt", tip: "Trinkgeld",
    // Confirmations
    areYouSureSignOut: "Sind Sie sicher, dass Sie sich abmelden möchten?",
    cancelOrderConfirm: "Sind Sie sicher, dass Sie diese Bestellung stornieren möchten?",
    yesCancelOrder: "Ja, stornieren",
    removeCardConfirm: "Diese Zahlungskarte entfernen?",
    removeCard: "Karte entfernen",
    deleteAddressConfirm: "Sind Sie sicher, dass Sie diese Adresse löschen möchten?",
    deleteAddress: "Adresse löschen",
    turnOffAllMsg: "Dies deaktiviert alle Benachrichtigungen",
    turnOffAll: "Alle deaktivieren", turnOff: "Deaktivieren",
    // Order detail
    yourRider: "Ihr Fahrer", orderProgress: "Bestellfortschritt", itemsOrdered: "Bestellte Artikel",
    cancelOrder: "Bestellung stornieren", rate: "Bewerten", noteLabel: "Hinweis:", orderNotFound: "Bestellung nicht gefunden",
    // Status labels
    statusPaymentPendingLabel: "Zahlung ausstehend",
    statusPaymentPendingDesc: "Warte auf Zahlungsbestätigung",
    statusOrderAcceptedLabel: "Bestellung angenommen",
    statusOrderAcceptedDesc: "Restaurant hat Ihre Bestellung angenommen",
    statusBeingPreparedLabel: "Wird zubereitet",
    statusBeingPreparedDesc: "Die Küche arbeitet an Ihrer Bestellung",
    statusReadyForPickupLabel: "Zur Abholung bereit",
    statusReadyForPickupDesc: "Ihre Bestellung ist fertig",
    statusOnTheWayLabel: "Unterwegs",
    statusOnTheWayDesc: "Ihr Fahrer ist auf dem Weg",
    statusAlmostThereLabel: "Fast da!",
    statusAlmostThereDesc: "Ihr Fahrer ist sehr nah",
    statusDeliveredLabel: "Geliefert!",
    statusDeliveredDesc: "Ihre Bestellung wurde geliefert. Guten Appetit!",
    statusCancelledLabel: "Storniert",
    statusCancelledDesc: "Diese Bestellung wurde storniert",
    // Settings
    myAddresses: "Meine Adressen", addNewAddress: "Neue Adresse hinzufügen", setDefault: "Als Standard setzen",
    deleteLabel: "Löschen", remove: "Entfernen", addCard: "Karte hinzufügen",
    savedCards: "GESPEICHERTE KARTEN", cardHolder: "Karteninhaber", expiryLabel: "Ablaufdatum",
    defaultLabel: "Standard", homeAddress: "Zuhause", workAddress: "Arbeit", otherAddress: "Sonstige",
    enterPromoCodeLabel: "Aktionscode eingeben", appliedCodes: "ANGEWENDETE CODES",
    availableOffers: "VERFÜGBARE ANGEBOTE", use: "Verwenden", appliedLabel: "Angewendet",
    errorMsg: "Fehler", addressRequired: "Adresse erforderlich",
    enterDeliveryAddressMsg: "Bitte geben Sie eine Lieferadresse ein.",
    fullName: "Vollständiger Name", emailAddress: "E-Mail-Adresse", phoneNumber: "Telefonnummer",
    saveChanges: "Änderungen speichern", enterYourName: "Ihren Namen eingeben",
    enterYourEmail: "E-Mail eingeben", profileUpdated: "Profil erfolgreich aktualisiert",
    branch: "Filiale",
    selectTopicError: "Bitte wählen Sie ein Thema für Ihre Nachricht",
    messageTooShort: "Bitte beschreiben Sie Ihr Anliegen in mindestens 20 Zeichen",
    messageSent: "Nachricht gesendet! Wir antworten innerhalb von 2–4 Stunden.",
    sendMessage: "Nachricht senden", topicLabel: "Thema", messageLabel: "Nachricht",
    topicGeneralInquiry: "Allgemeine Anfrage", topicOrderIssue: "Bestellproblem",
    topicPaymentProblem: "Zahlungsproblem", topicFeedback: "Feedback",
    topicPartnership: "Partnerschaft", topicOther: "Sonstiges",
    contactCallUs: "Anrufen", contactWhatsApp: "WhatsApp", contactEmail: "E-Mail",
    ourBranches: "Unsere Filialen", contactHeaderSub: "Wir antworten normalerweise innerhalb von 2 Stunden",
    supportHoursLabel: "Support-Zeiten: Sonntag – Donnerstag, 10–22 Uhr",
    welcome: "Willkommen", cairoEgypt: "Kairo, Ägypten",
    applyingLanguage: "Sprache wird angewendet…",
    rtlRestartNote: "Die arabische Textrichtung (RTL) erfordert einen Neustart der App.",
    notifOrderUpdates: "Bestellaktualisierungen", notifOrderUpdatesDesc: "Benachrichtigung bei Änderung des Bestellstatus",
    notifRiderTracking: "Fahrerverfolgung", notifRiderTrackingDesc: "Echtzeit-Updates wenn Ihr Fahrer unterwegs ist",
    notifLoyaltyRewards: "Treuprämien", notifLoyaltyRewardsDesc: "Punkte sammeln und exklusive Prämien freischalten",
    notifPromotions: "Aktionen & Angebote", notifPromotionsDesc: "Exklusive Deals, Rabatte und Sonderangebote",
    notifNewsletter: "Newsletter", notifNewsletterDesc: "Wöchentliche Menüupdates und Restaurantnachrichten",
    enterPhoneTitle: "Geben Sie Ihre Telefonnummer ein", enterNameTitle: "Wie heißen Sie?",
    phoneSubtitle: "Wir nutzen dies, um Ihr Konto zu finden oder zu erstellen",
    nameSubtitle: "Damit wir Ihr Erlebnis personalisieren können",
    continueBtn: "Weiter", changePhoneNumber: "Telefonnummer ändern",
    freshSeafoodTagline: "Frische Meeresfrüchte, zu Ihnen geliefert",
    yourFullName: "Ihr vollständiger Name",
    benefitLoyalty: "Sammeln Sie Treuepunkte mit jeder Bestellung",
    benefitTrackOrders: "Verfolgen Sie Ihre Bestellungen in Echtzeit",
    benefitSaveFavorites: "Speichern Sie Ihre Lieblingsgerichte",
    termsAgreement: "Durch Fortfahren stimmen Sie unseren",
    termsOfServiceLink: "Nutzungsbedingungen", privacyPolicyLink: "Datenschutzrichtlinie",
    invalidPhoneMsg: "Bitte geben Sie eine gültige Telefonnummer ein.",
    nameRequiredMsg: "Bitte geben Sie Ihren Namen ein.", signInErrorMsg: "Anmeldung fehlgeschlagen. Bitte erneut versuchen.",
    preparationStyle: "Zubereitungsart", addOnsLabel: "Extras",
    ingredientsLabel: "Zutaten", allergensLabel: "Allergene",
    badgeNew: "NEU", loadingMenu: "Leckeres Essen wird geladen…",
    spiceNone: "Nicht scharf", spiceMild: "Mild", spiceMedium: "Mittel",
    spiceHot: "Scharf", spiceExtraHot: "Extra scharf",
    filterVegetarian: "Vegetarisch", filterHealthy: "Gesund",
    promo1Title: "20% Rabatt auf die erste Bestellung", promo1Sub: "Code WELCOME20 verwenden",
    promo2Title: "Kostenlose Lieferung", promo2Sub: "Bestellungen über 150 EGP",
    promo3Title: "Familien-Festmahl-Angebot", promo3Sub: "Für 4–6 Personen",
    aboutTagline: "Ägyptens erstklassiges Meeresfrüchte-Erlebnis",
    ourStory: "Unsere Geschichte", ourValues: "Unsere Werte",
    awardsRecognition: "Auszeichnungen", followUs: "Folgen Sie uns",
    aboutBodyText1: "Das 1999 gegründete Sea Gull Restaurant serviert seit über 25 Jahren die besten Meeresfrüchte Kairos. Was als kleines Familienrestaurant in Zamalek begann, ist heute eines der bekanntesten Meeresfrüchte-Restaurants Ägyptens.",
    aboutBodyText2: "Unsere Köche beziehen täglich frischen Fang direkt von ägyptischen Fischern im Mittelmeer und Roten Meer, um sicherzustellen, dass jedes Gericht die authentischen Aromen des Meeres widerspiegelt.",
    valueFreshnessTitle: "Frische zuerst", valueFreshnessDesc: "Jede Zutat wird täglich von vertrauenswürdigen Lieferanten und ägyptischen Fischern bezogen.",
    valueSustainTitle: "Nachhaltigkeit", valueSustainDesc: "Wir arbeiten mit nachhaltigen Fischereigenossenschaften zusammen, um das Meeresökosystem Ägyptens zu schützen.",
    valueFamilyTitle: "Familienerbschaft", valueFamilyDesc: "Drei Generationen kulinarischer Tradition, mit Liebe und Sorgfalt weitergegeben.",
    valueSafetyTitle: "Lebensmittelsicherheit", valueSafetyDesc: "Wir halten die höchsten Lebensmittelsicherheitsstandards ein, zertifiziert von ägyptischen Gesundheitsbehörden.",
    award1Label: "Bestes Meeresfrüchterestaurant 2024", award1Org: "Egypt Food Awards",
    award2Label: "5-Sterne Lebensmittelsicherheit", award2Org: "Gesundheitsministerium",
    award3Label: "Beliebtestes Restaurant", award3Org: "Cairo Foodies 2023",
    statYears: "Jahre Exzellenz", statCustomers: "Zufriedene Kunden",
    statBranches: "Premium-Filialen", statRating: "Durchschnittsbewertung",
    versionCopyright: "© 2024 Sea Gull Restaurant. Alle Rechte vorbehalten.",
    faqCatOrders: "Bestellungen", faqCatPayment: "Zahlung",
    faqCatLoyalty: "Treuepunkte", faqCatAccount: "Konto",
    faqQ1: "Wie verfolge ich meine Bestellung?", faqA1: "Sobald Ihre Bestellung bestätigt und ein Fahrer zugewiesen ist, gehen Sie zur Registerkarte Bestellungen → tippen Sie auf Ihre Bestellung → Sie sehen eine Live-Karte.",
    faqQ2: "Kann ich meine Bestellung stornieren?", faqA2: "Sie können innerhalb von 2 Minuten nach der Bestellung stornieren, solange das Restaurant nicht mit der Zubereitung begonnen hat.",
    faqQ3: "Was tun, wenn ich den falschen Artikel erhalte?", faqA3: "Kontaktieren Sie uns sofort über 'Kontakt' oder rufen Sie uns an. Wir senden den richtigen Artikel oder erstatten innerhalb von 24 Stunden.",
    faqQ4: "Wie lange dauert die Lieferung?", faqA4: "Durchschnittliche Lieferzeit ist 30–45 Minuten, abhängig von Ihrem Standort und der Küchenauslastung.",
    faqQ5: "Welche Zahlungsmethoden werden akzeptiert?", faqA5: "Wir akzeptieren Nachnahme, Visa/Mastercard, Meeza, Fawry, Vodafone Cash und InstaPay.",
    faqQ6: "Sind meine Kartendaten sicher?", faqA6: "Absolut. Wir verwenden 256-Bit-SSL-Verschlüsselung. Ihre Kartendaten werden niemals auf unseren Servern gespeichert.",
    faqQ7: "Kann ich eine Rückerstattung erhalten?", faqA7: "Rückerstattungen werden innerhalb von 3–5 Werktagen für Kartenzahlungen bearbeitet.",
    faqQ8: "Wie verdiene ich Treuepunkte?", faqA8: "Sie verdienen 10 Punkte für je 100 EGP Ausgaben, automatisch nach der Lieferung gutgeschrieben.",
    faqQ9: "Wie löse ich Punkte ein?", faqA9: "Beim Bezahlen sehen Sie eine Option, Ihre Punkte zu verwenden. 100 Punkte = 10 EGP Rabatt.",
    faqQ10: "Verfallen Punkte?", faqA10: "Punkte sind 12 Monate ab dem Verdienst gültig.",
    helpTitle: "Hilfecenter", helpSubtitle: "Wie können wir Ihnen heute helfen?",
    cantFindAnswer: "Können Sie nicht finden, was Sie suchen?",
    stillNeedHelp: "Brauchen Sie noch Hilfe?",
    supportAvailable: "Unser Support-Team ist täglich von 10 bis 22 Uhr erreichbar",
    faqQ11: "Wie ändere ich meine Telefonnummer?",
    faqA11: "Aus Sicherheitsgründen erfordert die Änderung der Telefonnummer eine Identitätsprüfung. Bitte kontaktieren Sie unser Support-Team.",
    faqQ12: "Wie lösche ich mein Konto?",
    faqA12: "Sie können die Kontolöschung unter Einstellungen → Konto löschen beantragen. Diese Aktion ist irreversibel und alle Ihre Daten werden dauerhaft gelöscht.",
  },
};

interface LanguageContextType {
  lang: LangCode;
  t: Translation;
  isRTL: boolean;
  setLanguage: (code: LangCode) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: translations.en,
  isRTL: false,
  setLanguage: async () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<LangCode>("en");

  useEffect(() => {
    AsyncStorage.getItem("app_language").then((saved) => {
      if (saved && translations[saved as LangCode]) {
        const code = saved as LangCode;
        setLang(code);
        const shouldBeRTL = code === "ar";
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.forceRTL(shouldBeRTL);
        }
      }
    });
  }, []);

  const setLanguage = useCallback(async (code: LangCode) => {
    setLang(code);
    await AsyncStorage.setItem("app_language", code);
    const shouldBeRTL = code === "ar";
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], isRTL: lang === "ar", setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
