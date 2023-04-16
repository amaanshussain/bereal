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
import { BEREALAPI } from './helper';

interface LoginInterface {
    email: string,
    password: string,
    failedLogin: boolean,
}
interface RefreshTokenInterface {
    token: string,
    refresh_token: string
}

class Login extends React.Component<{}, LoginInterface> {

    constructor(props: LoginInterface) {
        super(props)
        this.state = {
            email: "",
            password: "",
            failedLogin: false,
        }
        this.submitLogin = this.submitLogin.bind(this)
    }

    async componentDidMount(): Promise<void> {
        const values = await AsyncStorage.multiGet(["@user_token", "@refresh_token"]);
        const user_token = values[0][1];
        const refresh_token = values[1][1];
        if (user_token == "" || refresh_token == "" || user_token == null || refresh_token == null) {
            return;
        }


        this.refreshToken((result: RefreshTokenInterface) => {

            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                "token": result["token"]
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            fetch(`${BEREALAPI}/api/login/token`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    if (result.hasOwnProperty("error")) {
                        Alert.alert("Sign in error", "Couldn't authenticate user, please sign in again.")
                        return;
                    } else {
                        // move to page here
                        const user_token_array: [string, string] = ["@user_token", result["token"]]
                        const refresh_token_array: [string, string] = ["@refresh_token", refresh_token]
                        this.multiStoreData([user_token_array, refresh_token_array]).then(() => this.props.navigation.navigate("Timeline"))
                    }
                })
                .catch(error => console.log('error', error));
        })


    }

    async refreshToken(callback: Function) {

        const refresh_token = await AsyncStorage.getItem("@refresh_token");

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "refreshtoken": refresh_token
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${BEREALAPI}/api/login/refresh`, requestOptions)
            .then(response => response.json())
            .then(result => callback(result))
            .catch(error => console.log('error', error));
    }


    multiStoreData(set: [string, string][]) {
        return AsyncStorage.multiSet(set)
    }


    submitLogin() {
        fetch(`${BEREALAPI}/api/login`, {
            method: 'POST',
            headers: {
                'Accept': "application/json",
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                email: this.state.email,
                password: this.state.password
            })
        }).then((response) => response.json()).then((data) => {
            if (data["code"] == "auth/wrong-password" || data["code"] == "auth/invalid-email") {
                this.setState({ failedLogin: true })
                return;
            } else {
                this.setState({ failedLogin: false })
            }
            if (data["code"] == 200) {
                const user_token: [string, string] = ["@user_token", data["token"]]
                const refresh_token: [string, string] = ["@refresh_token", data["refresh_token"]]
                this.multiStoreData([user_token, refresh_token]).then(() => this.props.navigation.navigate("Timeline"))

                // move to page here

            }
        })
    }


    render(): React.ReactNode {

        const navigation = this.props;


        return (
            <SafeAreaView style={styles.loginroot}>

                <Text style={styles.logintitle}>BeReal.</Text>

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

                    <Text style={{ color: "red", display: this.state.failedLogin ? "flex" : "none" }}>Invalid email or password.</Text>
                    <TouchableOpacity style={styles.loginbutton} onPress={this.submitLogin}>
                        <Text style={styles.loginbuttontext}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.loginbutton} onPress={() => {
                        // add create user function here
                        this.props.navigation.navigate("CreateUser")
                    }}>
                        <Text style={styles.loginbuttontext}>Create User</Text>
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


export default withNavigation(Login);
