import { Text, View, StyleSheet, TouchableOpacity, TextInput, ToastAndroid, Alert } from 'react-native'
import { useEffect, useState } from 'react'
import Icon from "@expo/vector-icons/FontAwesome";
import { useNavigation } from '@react-navigation/native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
// import { storage } from '../storage';
import { ScrollView } from 'react-native';
import {defaultPrompt} from "../defaults";

import { useMMKV } from 'react-native-mmkv'

const Settings = () => {
    const storage = useMMKV({id: "global-app-storage"});
    const navigation = useNavigation();

    const [apiKey, setApiKey] = useState("");
    const [botContext, setBotContext] = useState("");

    const [temperature, setTemperature] = useState(0.9);
    const [maxTokens, setMaxTokens] = useState(150);
    const [topP, setTopP] = useState(1);
    const [frequencyPenalty, setFrequencyPenalty] = useState(0);
    const [presencePenalty, setPresencePenalty] = useState(0.6);
    const [stopAt, setStopAt] = useState(" Human: , AI: ");
    const [chatName, setChatName] = useState("OpenAI");


    function checkSettings() {
        if (storage.contains("botContext")){
            setBotContext(storage.getString("botContext") ?? "");
        } else {
            storage.set("botContext", defaultPrompt)
            console.log("dont contain")
        }
        if (storage.contains("apiKey")){
            setApiKey( storage.getString("apiKey") ?? "");
        } else {
            storage.set("apiKey", "")
        }
        if (storage.contains("temperature")){
            setTemperature( storage.getNumber("temperature") ?? 0.9);
        } else {
            storage.set("temperature", 0.9)
        }
        if (storage.contains("maxTokens")){
            setMaxTokens( storage.getNumber("maxTokens") ?? 150);
        } else {
            storage.set("maxTokens", 150)
        }
        if (storage.contains("topP")){
            setTopP( storage.getNumber("topP") ?? 1);
        } else {
            storage.set("topP", 1)
        }
        if (storage.contains("frequencyPenalty")){
            setFrequencyPenalty( storage.getNumber("frequencyPenalty") ?? 0);
        } else {
            storage.set("frequencyPenalty", 0)
        }
        if (storage.contains("presencePenalty")){
            setPresencePenalty( storage.getNumber("presencePenalty") ?? 0.6);
        } else {
            storage.set("presencePenalty", 0.6)
        }
        if (storage.contains("stopAt")){
            setStopAt( storage.getString("stopAt") ?? " Human: , AI: ");
        } else {
            storage.set("stopAt", " Human: , AI: ")
        }
        if (storage.contains("chatName")){
            setChatName( storage.getString("chatName") ?? "OpenAI");
        } else {
            storage.set("chatName", "OpenAI")
        }

    }

    useEffect( () => {
       return checkSettings();
        

    }, [])
    const saveSettings = async () => {
        // first check if any of the fields are empty
        // storage.delete("apiKey")
        if (apiKey.length === 0 || botContext.length === 0) {
            ToastAndroid.show("One or more fields are empty", ToastAndroid.SHORT);
            return;
        }

        storage.set("apiKey", apiKey);
        storage.set("botContext", botContext);
        storage.set("temperature", temperature);
        storage.set("maxTokens", maxTokens);
        storage.set("topP", topP);
        storage.set("frequency_penalty", frequencyPenalty);
        storage.set("presence_penalty", presencePenalty);
        storage.set("stopAt", stopAt);
        storage.set("chatName", chatName);

        {/* @ts-ignore */}
        navigation.navigate("Home");

        // android stuff
        ToastAndroid.showWithGravity(
            "Settings saved",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );

    }

    navigation.addListener("focus", () => {
        return checkSettings();
        
    })


    const handleDeleteChat = () => {
        Alert.alert(
            "Delete chat",
            "Are you sure you want to delete all the chat?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => {
                    storage.set("botContext", defaultPrompt);
                    if (storage.contains("chatItems")) {
                        storage.delete("chatItems");
                        console.log("delted and it contains")
                    }else {
                        console.log("dont contain")
                    }

                    setBotContext(defaultPrompt);
                    ToastAndroid.showWithGravity(
                        "Chat deleted",
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
                }
            ],
            { cancelable: false }
        );


    } 

    const handleResetSettings = () => {
        Alert.alert(
            "Reset settings",
            "Are you sure you want to reset all the settings?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", onPress: () => {
                        storage.delete("temperature");
                        storage.delete("maxTokens");
                        storage.delete("topP");
                        storage.delete("frequencyPenalty");
                        storage.delete("presencePenalty");
                        storage.delete("stopAt");
                        storage.delete("chatName");
                        setTemperature(0.9);
                        setMaxTokens(150);
                        setTopP(1);
                        setFrequencyPenalty(0);
                        setPresencePenalty(0.6);
                        setStopAt(" Human: , AI: ");
                        setChatName("OpenAI");
                        checkSettings();
                        ToastAndroid.showWithGravity(
                            "Settings reset to default",
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER
                        );

                    }
                }
            ], 
            { cancelable: false }
        );
    
    }

    return (
        <View style={styles.settingsContainer}>
            <View style={styles.settingsHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={25}></Icon>                    
                </TouchableOpacity>
                <Text style={styles.headerText}>Settings</Text>
            </View>
            <View style={styles.settingsBody}>
                <ScrollView>
                <Text style={styles.poinText}>Chat Name</Text>
                <TextInput style={styles.input} placeholder={"Chat Name"} value={chatName} onChangeText={(text) => setChatName(text)}></TextInput>
                <Text style={styles.poinText}>API Key</Text>
                <TextInput style={styles.input} placeholder={"Your API Key"} value={apiKey} onChangeText={(text) => setApiKey(text)}></TextInput>
                <Text style={styles.poinText}>Context</Text>
                <TextInput multiline={true} style={styles.inputContext}  placeholder='Context' value={botContext} onChangeText={(text) => setBotContext(text)} />
                <Text style={styles.poinText}>Temperature: {temperature}</Text>
                <View style={styles.settingsSlider}>
                    <MultiSlider
                        onValuesChange={(values) => {
                            let val = values[0] / 100
                            setTemperature(val)
                            
                        }}
                        max={100}
                        min={0}
                        values={[temperature*100]}
                        />
                </View>
                <Text style={styles.poinText}>Max Tokens: {maxTokens}</Text>
                <View style={styles.settingsSlider}>
                    <MultiSlider
                        onValuesChange={(values) => setMaxTokens(values[0])}
                        min={1}
                        max={4000}
                        values={[maxTokens]}
                        />
                </View>
                <Text style={styles.poinText}>Top P: {topP}</Text>
                <View style={styles.settingsSlider}>
                    <MultiSlider
                    //should be devided by 100
                        onValuesChange={(values) => setTopP(values[0]/100)}
                        min={0}
                        max={100}
                        values={[topP]}
                        />
                </View>
                <Text style={styles.poinText}>Presence Penalty: {presencePenalty}</Text>
                <View style={styles.settingsSlider}>
                    <MultiSlider
                        onValuesChange={(values) => setPresencePenalty(values[0]/100)}
                        min={0}
                        max={200}
                        values={[presencePenalty*100]}
                        />
                </View>
                <Text style={styles.poinText}>Frequency Penalty: {frequencyPenalty}</Text>
                <View style={styles.settingsSlider}>
                    <MultiSlider
                        onValuesChange={(values) => setFrequencyPenalty(values[0]/200)}
                        min={0}
                        max={200}
                        values={[frequencyPenalty*100]}
                        />
                </View>
                <Text style={styles.poinText}>Stop At (Comma separated)</Text>
                <TextInput
                    style={styles.input} 
                    placeholder='Stop words comma separated (e.g. "Human:, AI:")' 
                    value={stopAt} 
                    onChangeText={(text) => setStopAt(text)} 
                />


                <View style={styles.optionsWrapper}>
                    <TouchableOpacity onPress={handleDeleteChat}>
                        <View style={styles.optionMenu}>
                            <Text style={styles.poinText}>Delete All Chat History</Text>
                            <Icon name="trash" size={22}> </Icon>
                        </View>
                    </TouchableOpacity>
                    

                    <View style={styles.seperator}></View>

                   <TouchableOpacity onPress={handleResetSettings}>
                    <View style={styles.optionMenu}>
                        <Text style={styles.poinText}>Reset Settings</Text>
                        <Icon name="refresh" size={22}> </Icon>
                    </View>
                   </TouchableOpacity>
                    <View style={styles.seperator}></View>
                </View>
               

                <TouchableOpacity onPress={() => saveSettings()}
                    style={styles.saveBtn}
                    activeOpacity={0.8}
                    >   
                        <Text style={styles.saveText}>Save</Text>

                </TouchableOpacity>
                </ScrollView>

            </View>
        </View>
    )
}



const styles = StyleSheet.create({
    settingsContainer: {
        flex: 1,
        backgroundColor: '#e8eaed',
        alignItems: 'flex-start',
        paddingTop: 70,
        paddingHorizontal: 20,
    },
    settingsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: '#000',
        marginLeft: 20,
    },
    settingsBody: {
        flex: 1,
        paddingTop: 30,
        paddingHorizontal: 10,
        width: "100%",
    },
    inputContext: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
        maxHeight: 160,
        height: 160,
        width: "100%",
        textAlignVertical: "top",
        textAlign: "left",
        borderColor: "#c0c0c0",
        borderWidth: 1,
    },
    poinText: {
        fontSize: 16,
        paddingHorizontal: 10,
        fontWeight: "bold",
        color: '#000',
        marginVertical: 10
    },
    settingsSlider: {
        width: "100%",
        paddingHorizontal: 15,
        marginTop: -10,

    }, 
    input: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
        maxHeight: 40,
        height: 40,
        width: "100%",
        borderColor: "#c0c0c0",
        borderWidth: 1,
    },
    saveBtn: {
        marginTop: 20,
        width: "100%",
        height: 40,
        backgroundColor: "blue",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30
    },
    saveText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    optionMenu: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
    },
    seperator: {
        borderBottomColor: "#c0c0c0",
        borderBottomWidth: 1,
        marginTop: 5,
        marginBottom: 5,
    },
    optionsWrapper: {
        marginTop: 20,
        marginBottom: 20,
    }



});
  

export default Settings;

