import React from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { withNavigation } from "@react-navigation/compat"

import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginInterface {
    email: string,
    password: string,
    failedLogin: boolean,
}
interface RefreshTokenInterface {
    token: string,
    refresh_token: string
}

class CreateUser extends React.Component<{}, LoginInterface> {

    constructor(props: LoginInterface) {
        super(props)
        this.state = {
            email: "",
            password: "",
            failedLogin: false,
        }
    }

    multiStoreData(set: [string, string][]) {
        return AsyncStorage.multiSet(set)
    }


    render(): React.ReactNode {

        return (
            <SafeAreaView style={styles.loginroot}>

                <Text style={styles.logintitle}>Welcome to BeReal.</Text>

                <View style={styles.loginform}>
                    {/* email input */}
                    <Text style={styles.loginlabel}>E-mail</Text>
                    <TextInput
                        style={[styles.logininput, { borderColor: "red", borderWidth: this.state.failedLogin ? 1 : 0 }]}
                        onChangeText={(text) => this.setState({ email: text })}
                    />

                    {/* password input */}
                    <Text style={styles.loginlabel}>Password</Text>
                    <TextInput
                        style={[styles.logininput, { borderColor: "red", borderWidth: this.state.failedLogin ? 1 : 0 }]}
                        onChangeText={(text) => this.setState({ password: text })}
                        secureTextEntry
                    />

                    <Text style={{ color: "red", display: this.state.failedLogin ? "flex" : "none" }}>Email already in use or weak password, please try again.</Text>
                    <TouchableOpacity style={styles.loginbutton} onPress={() => {}}>
                        <Text style={styles.loginbuttontext}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.loginbutton, { backgroundColor: "red" }]} onPress={this.props.navigation.goBack()}>
                        <Text style={[styles.loginbuttontext, { color: "white" }]}>Cancel</Text>
                    </TouchableOpacity>



                </View>

            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    loginroot: {
        backgroundColor: "#000000",
        flex: 1,
        alignItems: "center"
    },
    logintitle: {
        color: "white",
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 50
    },
    loginform: {
        padding: 10,
        width: "60%",
        gap: 10
    },
    loginlabel: {
        color: "gray",
        fontSize: 15,
        fontWeight: "bold"
    },
    logininput: {
        color: "white",
        backgroundColor: "#303030",
        padding: 5,
    },
    loginbutton: {
        backgroundColor: "white",
        padding: 10,
        alignItems: "center"
    },
    loginbuttontext: {
        fontWeight: "bold",

    },
    failedlogin: {
        borderColor: "red",
        borderWidth: 2
    }
}
)


export default withNavigation(CreateUser);
