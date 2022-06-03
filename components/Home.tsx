import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, Alert, ScrollView, ActivityIndicator } from 'react-native';
import 'react-native-url-polyfill/auto';
import Icon from "@expo/vector-icons/FontAwesome";
import { useState } from 'react';
import ChatBubble from "./ChatBubble";

import { ChatData } from "../types/types";
import { useNavigation } from '@react-navigation/native';

import { Configuration, OpenAIApi } from "openai";
import { defaultPrompt } from "../defaults";
import { useMMKV } from 'react-native-mmkv'


export default function App() {
  const storage = useMMKV({id: "global-app-storage"});
  const [message, setMessage] = useState("");
  const [chatItems, setChatItems] = useState<ChatData[]>([]);
  const [chatName, setChatName] = useState("OpenAI");
  const [isLoading, setIsLoading] = useState(false);


  const navigation = useNavigation();
  // use ref to control the scrollview
  const scrollViewRef = useRef<ScrollView>(null);


  const updateChat = () => {
    if (storage.contains("chatItems")) {
      setChatItems([]);
      setChatItems(JSON.parse(storage.getString("chatItems") ?? "[]"));
    } else {
      setChatItems([]);

    }
    scrollViewRef.current?.scrollToEnd({animated: true});
    if (storage.contains("chatName")){
      setChatName( storage.getString("chatName") ?? "OpenAI");
    } else {
        storage.set("chatName", "OpenAI")
    }
    console.log(storage.getNumber("temperature"))

    return;
  }

  useEffect(() => {
    updateChat();

  }, [])

  navigation.addListener("focus", () => {
    updateChat();
    
  })
  

  useEffect(() => {
    if (chatItems.length > 0) {    
      return storage.set("chatItems", JSON.stringify(chatItems));
    }
  }, [chatItems]);

  console.log(storage.getString("chatItems"))
  
  const handleAddChat = async () => {
    if (message.length > 0) {
      let context = storage.getString("botContext");
      context += message.endsWith("\n") ? message : message + "\n";
      context += "AI: ";
      setChatItems(oldItems => [...oldItems, {text: message, isUser: true}]);
      setMessage("");
      Keyboard.dismiss();
      scrollViewRef.current?.scrollToEnd({animated: true});

      const configuration = new Configuration({
        apiKey: storage.getString("apiKey") ?? "",
      });

      const openai = new OpenAIApi(configuration);

      setIsLoading(true);
      try {

        const response = await openai.createCompletion("text-davinci-002", {
          prompt: context ?? defaultPrompt,
          temperature: storage.getNumber("temperature") ?? 0.9,
          max_tokens: storage.getNumber("maxTokens") ?? 150,
          top_p: storage.getNumber("topP") ?? 1,
          frequency_penalty: storage.getNumber("frequency_penalty") ?? 0,
          presence_penalty: storage.getNumber("presence_penalty") ?? .6,
          stop: storage.getString("stopAt")?.split(",") ?? [" Human: ", " AI: "],
        });

        const resp = response.data.choices;

        if (resp) {
          let msg = (resp[0].text ?? "ERROR: failed to get message").trim()
          // setChatItems([...chatItems, ]);

          setChatItems(oldItems => [...oldItems, {text: msg, isUser: false}]);
          context += msg.endsWith("\n") ? msg : msg + "\n";
          storage.set("botContext", context ?? defaultPrompt);
          // scroll to end
          scrollViewRef.current?.scrollToEnd({animated: true});
          setIsLoading(false);
          
        } else {
          Alert.alert("Error", "Failed to get response from server");
          setIsLoading(false);
        }

      } catch (error: any) {
        setIsLoading(false);
        if (error.response) {
          Alert.alert(
            "Error",
            (`Status: ${error.response.status} - ${error.response.data}`),
            [
              {
                text: "OK",
                onPress: () => {
                  // navigation.navigate("Settings");
                }
              }
            ]
          );
            
        } else {
          Alert.alert(
            "Error",
            (`Second ${error}`),
            [
              {
                text: "OK",
                onPress: () => {
                  // navigation.navigate("Settings");
                }
              }
            ]
          );
        }
        
      }
    }
  };


 
  return (
    <View style={styles.container}>
    
      <View style={styles.itemWrapper}>
        
        {/* Home Header */}
        <View style={styles.header}>
            <View style={styles.headerView}>
              <Text style={styles.sectionTile}>{chatName}</Text>
              {isLoading ? 
                <ActivityIndicator style={styles.indicator} size="small" color="#6ECF6E" />
                :
                <View style={styles.indicatorGreen}></View>
              }
            </View>
            {/* @ts-ignore */}
           <TouchableOpacity activeOpacity={20} onPress={()=> navigation.navigate("Settings")}>
            <Icon name="cog" size={25}></Icon>
           </TouchableOpacity>
        </View>
      
        {/* Home items */}
        <View style={styles.items}>

          <ScrollView ref={scrollViewRef}>
            {chatItems.map((item, index) => (
              <ChatBubble key={index} text={item.text} isUser={item.isUser}></ChatBubble>
            ))}

          </ScrollView>
        </View>
      </View>


      <View style={styles.writeTaskWrapper}>
      <TextInput multiline={true}  style={styles.input} placeholder={"Write a message"} value={message} onChangeText={(text) => setMessage(text)} />
        <TouchableOpacity activeOpacity={1} onPress={async () => await handleAddChat()}>
          <View style={styles.addWrapper}>
            <Icon name="send" size={20}></Icon>    
          </View>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" animated={true} />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow :1,
    backgroundColor: '#e8eaed',
  },
  itemWrapper: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  sectionTile: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  items: {
    marginTop: 20,
    // height: "85%",
    marginBottom: 130,
  },
  writeTaskWrapper: {
    position: "absolute",
    bottom: 17,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",

  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderColor: "#c0c0c0",
    borderWidth: 1,
    width: 260,
    maxHeight: 120,

  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#c0c0c0",
    borderWidth: 1,

  },
  addText: {
    fontSize: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    
  },
  headerView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  indicator: {
    marginLeft: 10,
    fontSize: 25,
    fontWeight: "bold",
  },
  indicatorGreen: {
    width: 18,
    height: 18,
    // backgroundColor: "#6ECF6E",
    borderColor: "#6ECF6E",
    borderWidth: 5,
    borderRadius: 18/2,
    marginLeft: 10,
    
  }
});
