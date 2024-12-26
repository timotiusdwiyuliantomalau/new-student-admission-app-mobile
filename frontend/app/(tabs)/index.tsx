// Install package yang dibutuhkan terlebih dahulu:
// npm install react-native-webview

import React, { useState } from "react";
import { View, Button, Alert } from "react-native";
import { WebView } from "react-native-webview";

const MidtransPayment = () => {
  const [showWebView, setShowWebView] = useState(false);
  const [snapTtoken, setSnapToken] = useState(null);

  // Konfigurasi Midtrans
  const midtransConfig = {
    clientKey: "SB-Mid-client-vHklgAFatK0Y56mz",
    baseUrl: "https://app.sandbox.midtrans.com/snap/v2/vtweb/", // URL sandbox, ganti ke production saat live
  };

  // Fungsi untuk memulai pembayaran
  const startPayment = async () => {
    console.log("Starting payment...");
    try {
      // Data transaksi
      const transactionDetails = {
        order_id: `ORDER-${Date.now()}`,
        gross_amount: 500000,
        customer_details: {
          first_name: "John",
          email: "john@example.com",
          phone: "08111222333",
        },
        item_details: [
          {
            id: "item1",
            price: 500000,
            quantity: 1,
            name: "Sepatu",
          },
        ],
      };

      // Request ke backend Anda untuk mendapatkan snap token
      const response = await fetch(
        "http://10.0.2.2:3000/api/create-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionDetails),
        }
      );
      const data = (await response.json()).data.token;
      if (data) {
        setShowWebView(true);
      }
      setSnapToken(data);
    } catch (error) {
      Alert.alert("Error", "Failed to initiate payment");
      console.error(error);
    }
  };

  // Handle response dari Midtrans
  const onNavigationStateChange = (navState: any) => {
    // Check URL untuk mengetahui status pembayaran
    console.log({ data: navState });
    if (
      navState.url.includes("transaction_status=settlement") ||
      navState.url.includes("deeplink/payment")
    ) {
      setShowWebView(false);
      Alert.alert("Success", "Payment completed!");
    } else if (navState.url.includes("payment-failed")) {
      setShowWebView(false);
      Alert.alert("Failed", "Payment failed!");
    }
  };

  if (showWebView) {
    return (
      <WebView
        source={{
          uri: `${midtransConfig.baseUrl}${snapTtoken}`,
        }}
        onNavigationStateChange={onNavigationStateChange}
      />
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Pay Now" onPress={startPayment} />
    </View>
  );
};

export default MidtransPayment;
