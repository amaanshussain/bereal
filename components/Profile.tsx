import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    Alert,
    AlertButton,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { withNavigation } from "@react-navigation/compat"
import { BEREALAPI, RefreshTokenInterface, multiStoreData, refreshToken } from './helper';

const backicon = require('../assets/backicon.png')
const signouticon = require('../assets/signouticon.png')
const profileicon = require('../assets/profileicon.png')

interface ProfileInterface {
    profilePic: string,
    profileName: string,
    profileEmail: string
}

class Profile extends React.Component<{}, ProfileInterface> {

    constructor(props: ProfileInterface) {
        super(props)
        this.state = {
            profilePic: "",
            profileName: "",
            profileEmail: ""
        }
    }

    async componentDidMount(): Promise<void> {

        const user_token = await AsyncStorage.getItem("@user_token");

        await refreshToken((response: RefreshTokenInterface) => {
            console.log(response)
            if (response.hasOwnProperty("error")) {
                return;
            }
            const user_token_array: [string, string] = ["@user_token", response["token"]]
            const refresh_token_array: [string, string] = ["@refresh_token", response["refresh_token"]]
            multiStoreData([user_token_array, refresh_token_array]).then(() => {})

        })

        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${user_token}`);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`${BEREALAPI}/api/profile/me`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                const email = result.email;
                const image = result.image;
                const name = result.name;

                if (image) {
                    this.setState({ profilePic: image })
                }
                if (name) {
                    this.setState({profileName: name})
                }
                if (email) {
                    this.setState({profileEmail: email})
                }
            })
            .catch(error => console.log('error', error));
    }

    render() {
        return (
            <SafeAreaView style={styles.profileroot}>
                <View style={styles.profileheader}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.goBack();
                    }}>
                        <Image style={{ height: 20, width: undefined, aspectRatio: 1 }} source={backicon} />
                    </TouchableOpacity>
                    <Text style={styles.profiletext}>Profile</Text>
                    <TouchableOpacity onPress={() => {
                        Alert.alert("Sign out", "Are you sure you want to sign out?", [
                            {
                                text: 'Cancel',
                                onPress: () => { },
                            },
                            {
                                text: 'Sign out',
                                onPress: () => {
                                    const user_token: [string, string] = ["@user_token", ""]
                                    const refresh_token: [string, string] = ["@refresh_token", ""]

                                    multiStoreData([user_token, refresh_token]).then(() => {
                                        this.props.navigation.popToTop()
                                    })
                                },
                            },
                        ])
                    }}>
                        <Image style={{ height: 20, width: undefined, aspectRatio: 1 }} source={signouticon} />
                    </TouchableOpacity>
                </View>
                <View style={styles.profileoverview}>
                    <Image style={styles.profileimage} source={this.state.profilePic != "" ? { uri: this.state.profilePic } : profileicon} />
                    <Text style={styles.profileprimarytext}>{this.state.profileName != "" ? this.state.profileName : "No Name"}</Text>
                    <Text style={styles.profilesecondarytext}>{this.state.profileEmail}</Text>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    profileroot: {
        backgroundColor: "black",
        flex: 1,
        gap: 20
    },
    profileheader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20
    },
    profiletext: {
        color: "white",
        fontWeight: "bold",
        fontSize: 17
    },
    profileoverview: {
        alignItems: "center"
    },
    profileimage: {
        height: 140,
        width: undefined,
        aspectRatio: 1,
        borderRadius: 140 / 2
    },
    profileprimarytext: {
        color: "white",
        fontWeight: "bold",
        fontSize: 30
    },
    profilesecondarytext: {
        color: "white",
        fontWeight: "bold"
    }
})

export default withNavigation(Profile)