// import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { ChatData } from "../types/types";

export default function ChatBubble({text, isUser}: ChatData) {
    let itemStyle: StyleProp<ViewStyle> = {
        backgroundColor: isUser ? "#218aff" : "#aeb9cc",
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        maxWidth: text.length * 100,
        marginRight: isUser ? 0 : 'auto',
        marginLeft: isUser ? 'auto' : 0,
        borderBottomLeftRadius: isUser ? 32 : 0,
        borderBottomRightRadius: isUser ? 0 : 32,
    }

  return (
    <View style={itemStyle}>
        <View style={styles.itemLeft}>
            {/* <View style={isUser ? styles.squareBlue : styles.squareRed} ></View> */}
            <Text style={isUser ? styles.itemTextWhite : styles.itemTextBlack}>{text}</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    squareBlue: {
        width: 24,
        height: 24,
        backgroundColor: '#55bcf6',
        opacity: 0.4,
        borderRadius: 5,
        marginRight: 15,
    },
    squareRed: {
        width: 24,
        height: 24,
        backgroundColor: '#F66D55',
        opacity: 0.4,
        borderRadius: 5,
        marginRight: 15,
    },
    itemTextWhite: {
        maxWidth: '90%',
        fontSize: 14,
        color: '#fff',
    },
    itemTextBlack: {
        maxWidth: '90%',
        fontSize: 14,
        color: '#000',
    }
});
