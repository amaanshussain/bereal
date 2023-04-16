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
import { RefreshTokenInterface, multiStoreData, refreshToken } from './helper';

const backicon = require('../assets/backicon.png')
const refreshicon = require('../assets/refreshicon.png')
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

    fetch(`http://localhost:6969/api/profile/${uid}/info`, requestOptions)
        .then(response => response.json())
        .then(result => {
            callback(result)
        })
        .catch(error => console.log('error', error));
}

async function getOutgoingRequests(callback: Function) {
    const token = await AsyncStorage.getItem("@user_token");

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("http://localhost:6969/api/friends/outgoing", requestOptions)
        .then(response => response.json())
        .then(result => callback(result))
        .catch(error => callback(error));
}

async function getIncomingRequests(callback: Function) {
    const token = await AsyncStorage.getItem("@user_token");

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("http://localhost:6969/api/friends/incoming", requestOptions)
        .then(response => response.json())
        .then(result => callback(result))
        .catch(error => callback(error));
}

async function deleteRequest(fid: string) {
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

    await fetch("http://localhost:6969/api/friends/deleterequest", requestOptions)
        .then(response => response.json())
        .then(result => { })
        .catch(error => { });
}

async function acceptRequest(fid: string) {
    const token = await AsyncStorage.getItem("@user_token");

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "uid": fid
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("http://localhost:6969/api/friends/accept", requestOptions)
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

async function rejectRequest(fid: string) {
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

    fetch("http://localhost:6969/api/friends/reject", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}


function UserCell({ fid, type }) {
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

                <View style={{ flexDirection: "row", gap: 3, display: type == "Incoming" ? "flex" : "none" }}>
                    <TouchableOpacity style={{ padding: 5, backgroundColor: "red" }} onPress={() => {
                        rejectRequest(fid);
                        setShown(false);
                    }}>
                        <Text style={[styles.userInfoName, { color: "white" }]}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ padding: 5, backgroundColor: "white" }} onPress={() => {
                        acceptRequest(fid);
                        setShown(false);
                    }}>
                        <Text style={[styles.userInfoName, { color: "black" }]}>Accept</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={{ display: type == "Outgoing" ? "flex" : "none", width: "100%" }} onPress={() => {
                    Alert.alert(
                        "Remove friend",
                        "Are you sure you want to remove this request? You will have to send a request.",
                        [
                            {
                                text: "Cancel",
                                onPress: () => { },
                            },
                            {
                                text: "Remove",
                                onPress: () => {
                                    deleteRequest(fid).then(() => {
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

interface RequestsInterface {
    incoming: string[],
    outgoing: string[],
    active: string
}
class Requests extends React.Component<{}, RequestsInterface> {

    constructor(props: RequestsInterface) {
        super(props)
        this.state = {
            incoming: [],
            outgoing: [],
            active: "Outgoing"
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

        await getOutgoingRequests((result: any) => {
            const outgoingRequests = result['outgoing']
            if (!outgoingRequests) {
                return;
            }
            this.setState({ outgoing: outgoingRequests })
        })

        await getIncomingRequests((result: any) => {
            const incomingRequests = result['incoming']
            if (!incomingRequests) {
                return;
            }
            this.setState({ incoming: incomingRequests })
        })



    }

    render(): React.ReactNode {

        const activeRequests = this.state.active == "Outgoing" ? this.state.outgoing : this.state.incoming;
        console.log(activeRequests)
        return (
            <SafeAreaView style={styles.requestsroot}>
                <View style={styles.requestsheader}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.goBack();
                    }}>
                        <Image style={{ height: 20, width: undefined, aspectRatio: 1 }} source={backicon} />
                    </TouchableOpacity>
                    <Text style={styles.requestsheadertitle}>Requests</Text>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.goBack();
                    }}>
                        <Image style={{ height: 20, width: undefined, aspectRatio: 1 }} source={refreshicon} />
                    </TouchableOpacity>
                </View>
                <View style={styles.requeststypecont}>
                    <TouchableOpacity style={[styles.requeststypebutton, { borderColor: "white", borderBottomWidth: this.state.active == "Outgoing" ? 2 : 0 }]} onPress={() => {
                        this.setState({ active: "Outgoing" })
                    }}>
                        <Text style={styles.requeststypetext}>Outgoing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.requeststypebutton, { borderColor: "white", borderBottomWidth: this.state.active == "Incoming" ? 2 : 0 }]} onPress={() => {
                        this.setState({ active: "Incoming" })
                    }}>
                        <Text style={styles.requeststypetext}>Incoming</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView>
                    {
                        activeRequests.map((fid) => {
                            return <UserCell key={fid} fid={fid} type={this.state.active} />
                        })
                    }
                </ScrollView>

            </SafeAreaView>
        )
    }

}
const styles = StyleSheet.create({
    requestsroot: {
        backgroundColor: "black",
        flex: 1
    },
    requestsheader: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10
    },
    requestsheadertitle: {
        color: "white",
        fontWeight: "bold",
        fontSize: 20
    },
    requeststypecont: {
        flexDirection: "row"
    },
    requeststypebutton: {
        width: "50%",
        padding: 10,
        alignItems: "center"
    },
    requeststypetext: {
        color: "white",
        fontWeight: "bold"
    },
    userCell: {
        width: "100%",
        flexDirection: "row",
        padding: 5,
        gap: 3,
        borderTopWidth: 2,
        borderColor: "#353635"
    },
    userImageCont: {
        width: "10%",
    },
    userImage: {
        width: "100%",
        height: undefined,
        aspectRatio: 1,
        borderRadius: 50
    },
    userInfoCont: {
        width: "60%",
        maxWidth: "60%",
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
        width: "20%",
        justifyContent: "center"
    },
    userRemove: {
        width: "100%",
        color: "white",
        textAlign: "right",
        fontSize: 20
    }
})

export default withNavigation(Requests);