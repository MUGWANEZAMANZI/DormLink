import React, { useRef, useEffect} from 'react';
import { Text, StyleSheet, 
  View, Animated, Dimensions, 
  TouchableWithoutFeedback  } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'react-native-web';


const screenWidth = Dimensions.get('window').width;


export default function HomeScreen({ navigation }) {

  const leftWidth = useRef(new Animated.Value(screenWidth / 2)).current;
  const rightWidth = useRef(new Animated.Value(screenWidth / 2)).current;


  useEffect(() => {
    resetWidths();
  }, []);



  const resetWidths = () => {
    Animated.parallel([
      Animated.timing(leftWidth, {
        toValue: screenWidth /2,
        duration: 300,
        useNativeDriver: false,
      }),

      Animated.timing(rightWidth, {
        toValue: screenWidth/2,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const expandLeft = () => {
    console.log("Expand Left tapped");
     Animated.parallel([
      Animated.timing(leftWidth, {
        toValue: screenWidth * 0.75,
        duration: 300,
        useNativeDriver: false,
      }),

      Animated.timing(rightWidth, {
        toValue: screenWidth * 0.25,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
    navigation.navigate('FindDorm');
  };


  const expandRight = () => {
     Animated.parallel([
      Animated.timing(leftWidth, {
        toValue: screenWidth * 0.25,
        duration: 300,
        useNativeDriver: false,
      }),

      Animated.timing(rightWidth, {
        toValue: screenWidth * 0.75,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
    navigation.navigate('AddDorm');
  };

  return (
    <View style={styles.container}>
        <TouchableWithoutFeedback onPress={expandLeft}>
          <Animated.View style={[styles.leftView, {width: leftWidth}]} >
            <Text styles={styles.text}>Find Dorm</Text>
            </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={expandRight}>
          <Animated.View style={[styles.rightView, {width: rightWidth}]} >
            <Text styles={styles.text}>Rent Dorm</Text>
            </Animated.View>
        </TouchableWithoutFeedback>        
        
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  },
  leftView:{
    backgroundColor: '#365474ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightView:{
    backgroundColor:"cyan",
    justifyContent: 'center',
    backgroundColor: '#2f693cff',
     
  },
  text:{
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
