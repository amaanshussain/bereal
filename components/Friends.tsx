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
const requestsicon = require('../assets/requestsicon.png')
const profileicon = require('../assets/profileicon.png')


async function getFriendById(uid: string, callback: Function) {
    const token = await AsyncStorage.getItem("@user_token");

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`${BEREALAPI}/api/profile/${uid}/info`, requestOptions)
        .then(response => response.json())
        .then(result => {
            callback(result)
        })
        .catch(error => console.log('error', error));
}

async function searchEmail(email: string, callback: Function) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "email": email
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(`${BEREALAPI}/api/profile/search`, requestOptions)
        .then(response => response.json())
        .then(result => callback(result))
        .catch(error => callback(error));
}

async function requestFriend(email: string, callback: Function) {
    const token = await AsyncStorage.getItem("@user_token");

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "email": email
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(`${BEREALAPI}/api/friends/request`, requestOptions)
        .then(response => response.json())
        .then(result => callback(result))
        .catch(error => callback(error));
}

async function deleteFriend(fid: string) {
    const token = await AsyncStorage.getItem("@user_token");

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "fid": fid
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    await fetch(`${BEREALAPI}/api/friends/delete`, requestOptions)
        .then(response => response.json())
        .then(result => { })
        .catch(error => { });
}

function UserCell({ fid }) {
    const [email, setEmail] = React.useState("");
    const [name, setName] = React.useState("");
    const [image, setImage] = React.useState("");
    const [shown, setShown] = React.useState(true);

    getFriendById(fid, function (result: any) {
        setEmail(result["email"])
        setName(result["name"])
        setImage(result["image"])
    })

    return (
        <View style={[styles.userCell, { display: shown ? "flex" : "none" }]}>
            <View style={styles.userImageCont}>
                <Image style={styles.userImage} source={image ? { uri: image } : profileicon} />
            </View>
            <View style={styles.userInfoCont}>
                <Text style={styles.userInfoName}>{name ? name : "No Name"}</Text>
                <Text style={styles.userInfoDesc}>{email}</Text>
            </View>
            <View style={styles.userRemoveCont}>
                <TouchableOpacity onPress={() => {
                    Alert.alert(
                        "Remove friend",
                        "Are you sure you want to remove this friend? You will have to send a request to become friends again.",
                        [
                            {
                                text: "Cancel",
                                onPress: () => { },
                            },
                            {
                                text: "Remove",
                                onPress: () => {
                                    deleteFriend(fid).then(() => {
                                        setShown(false);
                                    })
                                }
                            }
                        ]
                    )
                }}>
                    <Text style={styles.userRemove}>X</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

interface FriendsInterface {
    friends: string[],
    incoming: string[],
    outgoing: string[],
    searchedUser: { email: string, image: string, name: string },
    requested: string
}
class Friends extends React.Component<{}, FriendsInterface> {

    constructor(props: FriendsInterface) {
        super(props)
        this.state = {
            friends: [],
            incoming: [],
            outgoing: [],
            searchedUser: { email: "", image: "", name: "" },
            requested: "+"
        }
        this.componentDidMount = this.componentDidMount.bind(this)

    }

    async componentDidMount(): Promise<void> {

        await refreshToken((response: RefreshTokenInterface) => {
            if (response.hasOwnProperty("error")) {
                return;
            }
            const user_token_array: [string, string] = ["@user_token", response["token"]]
            const refresh_token_array: [string, string] = ["@refresh_token", response["refresh_token"]]
            multiStoreData([user_token_array, refresh_token_array]).then(() => { })

        })

        this.getFriends((result: any) => {
            this.setState({ friends: result["friends"] })
        })

        this.props.navigation.addListener(
            'focus',
            () => {
                this.getFriends((result: any) => {
                    this.setState({ friends: result["friends"] })
                })
            }
        );
    }

    async getFriends(callback: Function) {

        const token = await AsyncStorage.getItem("@user_token");

        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`${BEREALAPI}/api/friends/friends`, requestOptions)
            .then(response => response.json())
            .then(result => {
                callback(result)
            })
            .catch(error => console.log('error', error));
    }


    render(): React.ReactNode {

        return (
            <SafeAreaView style={styles.friendsroot}>
                <View style={styles.friendsheader}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.goBack();
                    }}>
                        <Image style={{ height: 20, width: undefined, aspectRatio: 1 }} source={backicon} />
                    </TouchableOpacity>
                    <Text style={styles.friendsheadertitle}>Friends</Text>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate("Requests");
                    }}>
                        <Image style={{ height: 25, width: undefined, aspectRatio: 1 }} source={requestsicon} />
                    </TouchableOpacity>
                </View>

                <TextInput style={styles.friendssearch} placeholderTextColor={"#ababab"} placeholder='Add or search friends' onChangeText={(text) => {
                    console.log(text);

                    text = text.replace(" ", "");

                    if (text == "") {
                        this.setState({ searchedUser: { email: "", image: "", name: "" }, requested: "+" });
                    }

                    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
                    var isEmail = false;
                    if (emailRegex.test(text)) {
                        isEmail = true;
                    } else {
                        isEmail = false;
                    }
                    if (!isEmail) {
                        return;
                    }

                    searchEmail(text, (result: any) => {
                        if (result.hasOwnProperty("error")) {
                            return;
                        }
                        console.log(result);
                        this.setState({ searchedUser: { email: result['email'], image: result['image'], name: result['name'] } })
                    })




                }} />

                <View style={[styles.userCell, { display: this.state.searchedUser.email != "" ? "flex" : "none" }]}>
                    <View style={styles.userImageCont}>
                        <Image style={styles.userImage} source={this.state.searchedUser.image != "" ? { uri: this.state.searchedUser.image } : profileicon} />
                    </View>
                    <View style={styles.userInfoCont}>
                        <Text style={styles.userInfoName}>{this.state.searchedUser.name ? this.state.searchedUser.name : "No Name"}</Text>
                        <Text style={styles.userInfoDesc}>{this.state.searchedUser.email}</Text>
                    </View>
                    <View style={styles.userRemoveCont}>
                        <TouchableOpacity onPress={() => {
                            requestFriend(this.state.searchedUser.email, (response: any) => {
                                console.log(response)
                                this.setState({ requested: "✓" })
                            })
                        }}>
                            <Text style={styles.userRemove}>{this.state.requested}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.friendcount}>{this.state.friends.length} friends</Text>

                <ScrollView>
                    {
                        this.state.friends.map((fid) => {
                            return <UserCell key={fid} fid={fid} />
                        })
                    }
                </ScrollView>
            </SafeAreaView>
        )
    }

}
const styles = StyleSheet.create({
    friendsroot: {
        backgroundColor: "black",
        flex: 1,
        alignItems: "center",
        gap: 20
    },
    friendsheader: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10
    },
    friendsheadertitle: {
        color: "white",
        fontWeight: "bold",
        fontSize: 20
    },
    friendssearch: {
        backgroundColor: "#262626",
        width: "80%",
        padding: 15,
        borderRadius: 10,
        color: "white"
    },
    friendcount: {
        color: "gray",
        width: "90%",
        textAlign: "left"
    },
    userCell: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        gap: 10,
        borderTopWidth: 2,
        borderColor: "#353635"
    },
    userImageCont: {
        width: "10%"
    },
    userImage: {
        width: "100%",
        height: undefined,
        aspectRatio: 1,
        borderRadius: 50
    },
    userInfoCont: {
        width: "75%",
        justifyContent: "center"
    },
    userInfoName: {
        color: "white",
        fontWeight: "bold"
    },
    userInfoDesc: {
        color: "white",
    },
    userRemoveCont: {
        width: "10%",
        justifyContent: "center"
    },
    userRemove: {
        width: "100%",
        color: "white",
        textAlign: "left",
        fontSize: 20
    }
})

export default withNavigation(Friends);