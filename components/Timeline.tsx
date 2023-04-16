import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
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


const commenticon = require('../assets/commenticon.png')
const emojiicon = require('../assets/emojiicon.png')
const friendsicon = require('../assets/friendsicon.png')
const hiddenicon = require('../assets/hiddenicon.png')
const profileicon = require('../assets/profileicon.png')

interface BeRealInterface {
    profile: string,
    displayname: string,
    pic1url: string,
    pic2url: string,
    shown: boolean,
    navigation: any
}

const BeReal = ({ profile, displayname, pic1url, pic2url, shown, navigation }: BeRealInterface) => {

    const [sequence, setSequence] = useState([pic1url, pic2url])
    const [hidden, setHidden] = useState(false);

    return (
        <View style={berealStyles.berealroot}>
            <View style={berealStyles.berealheader}>
                <Image style={berealStyles.berealprofile} source={profile ? { uri: profile } : profileicon} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "90%" }}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>{displayname}</Text>
                    <TouchableOpacity>
                        <Text style={{ color: "gray", fontWeight: "bold" }}>∙∙∙</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View>

                <TouchableOpacity activeOpacity={1} onLongPress={() => {
                    setHidden(true);
                }} onPressOut={() => setHidden(false)}>
                    <Image style={berealStyles.berealactive} source={{ uri: sequence[0] }} blurRadius={shown ? 0 : 50} />
                </TouchableOpacity>

                <TouchableOpacity style={[berealStyles.berealsecondary, { display: hidden ? 'none' : 'flex' }]} activeOpacity={1} onPress={() => {
                    if (sequence[0] == pic1url) {
                        setSequence([pic2url, pic1url])
                    } else {
                        setSequence([pic1url, pic2url])
                    }
                }}>
                    <Image style={[berealStyles.berealinactive, { display: shown ? "flex" : "none" }]} source={{ uri: sequence[1] }} blurRadius={0} />
                </TouchableOpacity>

                <View style={[berealStyles.lateBerealCont, { display: !shown ? "flex" : "none" }]}>
                    <Image style={berealStyles.lateBerealIcon} source={hiddenicon} />
                    <Text style={berealStyles.lateBerealMain}>Post to view</Text>
                    <Text style={berealStyles.lateBerealSecond}>To view your friends' BeReal, share yours with them.</Text>
                    <TouchableOpacity style={berealStyles.lateBerealButton} onPress={() => {
                        navigation.navigate("BeRealCamera")
                    }}>
                        <Text style={berealStyles.lateBerealText}>Post a late BeReal.</Text>
                    </TouchableOpacity>
                </View>

                <View style={[berealStyles.berealactions, { display: shown ? "flex" : "none" }]}>
                    <TouchableOpacity>
                        <Image style={berealStyles.berealactionicon} source={commenticon} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image style={berealStyles.berealactionicon} source={emojiicon} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[berealStyles.captionblock, { display: shown ? "flex" : "none" }]}>
                <Text style={berealStyles.berealcaption}>Caption</Text>
                <TouchableOpacity>
                    <Text style={berealStyles.addcomment}>Add a comment...</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}
const berealStyles = StyleSheet.create({
    berealroot: {
        backgroundColor: 'none',
    },
    berealheader: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        padding: 5
    },
    berealprofile: {
        height: 30,
        width: undefined,
        aspectRatio: 1,
        borderRadius: 30 / 2
    },
    berealactive: {
        width: "100%",
        height: undefined,
        aspectRatio: 3.5 / 4.25,
        borderRadius: 20
    },
    berealsecondary: {
        width: "33%",
        position: "absolute",
    },
    berealinactive: {
        width: "100%",
        height: undefined,
        aspectRatio: 3.5 / 4.25,
        borderRadius: 20,
        position: "absolute",
        top: 10,
        left: 10,
        borderColor: "black",
        borderWidth: 2
    },
    lateBerealCont: {
        position: "absolute",
        top: "35%",
        left: "5%",
        width: "90%",
        alignItems: "center",
        gap: 10
    },
    lateBerealIcon: {
        height: 50,
        width: undefined,
        aspectRatio: 1
    },
    lateBerealMain: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15
    },
    lateBerealSecond: {
        color: "white",
        fontSize: 13
    },
    lateBerealButton: {
        width: "45%",
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10,
    },
    lateBerealText: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 13
    },
    berealactions: {
        position: "absolute",
        bottom: 20,
        right: 20,
        gap: 20
    },
    berealactionicon: {
        width: 30,
        height: undefined,
        aspectRatio: 1
    },
    captionblock: {
        padding: 5,
        gap: 5
    },
    berealcaption: {
        color: "white",
        fontWeight: "bold"
    },
    addcomment: {
        color: "gray"
    }
})

interface TimelineInterface {
    incomingRequests: boolean,
    profilePic: string,
    todaysBereal: [string, string],
    timeline: BeRealInterface[]
}

class Timeline extends React.Component<{}, TimelineInterface> {

    constructor(props: TimelineInterface) {
        super(props)
        this.state = {
            incomingRequests: true,
            profilePic: '',
            todaysBereal: ["", ""],
            timeline: []
        }
    }


    async componentDidMount(): Promise<void> {

        const user_token = await AsyncStorage.getItem("@user_token");

        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${user_token}`);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        await refreshToken((response: RefreshTokenInterface) => {
            if (response.hasOwnProperty("error")) {
                return;
            }
            const user_token_array: [string, string] = ["@user_token", response["token"]]
            const refresh_token_array: [string, string] = ["@refresh_token", response["refresh_token"]]
            multiStoreData([user_token_array, refresh_token_array]).then(() => { })

        })

        this.listeners = [
            this.props.navigation.addListener(
                'focus',
                () => {
                    console.log('just got to timeline')
                    fetch(`${BEREALAPI}/api/friends/timeline`, requestOptions)
                        .then(response => response.json())
                        .then(result => {
                            this.setState({ timeline: result['bereals'] })
                        })
                        .catch(error => console.log('timelineerror2', error));
                }
            ),
            this.props.navigation.addListener(
                'focus',
                () => {
                    console.log('getting my bereal')
                    fetch(`${BEREALAPI}/api/profile/bereal`, requestOptions)
                        .then(response => response.json())
                        .then(result => {
                            console.log(result)
                            if (result.hasOwnProperty("error")) {
                                this.setState({todaysBereal: ["", ""]})
                                return;
                            }
                            this.setState({ todaysBereal: [result.bereal.pics[0], result.bereal.pics[1]] })
                        })
                        .catch(error => console.log('berealerror', error));

                }
            )
        ]
        this.getTimeline()
        this.getMyBeReal()

        fetch(`${BEREALAPI}/api/profile/me`, requestOptions)
            .then(response => response.json())
            .then(result => {
                const email = result.email;
                const image = result.image;
                const name = result.name;

                if (image) {
                    this.setState({ profilePic: image })
                }
            })
            .catch(error => console.log('profileerror', error));

    }

    async getTimeline() {
        console.log('getting timeline')
        const user_token = await AsyncStorage.getItem("@user_token");

        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${user_token}`);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`${BEREALAPI}/api/friends/timeline`, requestOptions)
            .then(response => response.json())
            .then(result => {
                this.setState({ timeline: result['bereals'] })
            })
            .catch(error => console.log('timelineerror1', error));

    }

    async getMyBeReal() {
        console.log('getting timeline')
        const user_token = await AsyncStorage.getItem("@user_token");

        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${user_token}`);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        fetch(`${BEREALAPI}/api/profile/bereal`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                if (result.hasOwnProperty("error")) {
                    this.setState({todaysBereal: ["", ""]})
                    return;
                }
                this.setState({ todaysBereal: [result.bereal.pics[0], result.bereal.pics[1]] })
            })
            .catch(error => console.log('berealerror', error));

    }




    render(): React.ReactNode {

        const shown = this.state.todaysBereal[0] != "" && this.state.todaysBereal[1] != "";

        return (
            <SafeAreaView style={styles.timelineroot}>

                <View style={styles.timelineheader}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate("Friends")
                    }}>
                        <Image style={{ height: 30, width: undefined, aspectRatio: 1 }} source={friendsicon} />
                    </TouchableOpacity>
                    <Text style={styles.timelinetitle}>BeReal.</Text>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate("Profile")
                    }}>
                        <Image style={{ height: 30, width: undefined, aspectRatio: 1, borderRadius: this.state.profilePic != '' ? 30 / 2 : 0 }} source={this.state.profilePic != '' ? { uri: this.state.profilePic } : profileicon} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.timelinebereals}>
                    {/* add personal bereal here */}

                    <View style={[styles.myberealcontainer, { display: this.state.todaysBereal[0] == "" ? "none" : "flex" }]}>
                        <View style={styles.mybereal}>
                            <Image style={styles.myberealmain} source={{ uri: this.state.todaysBereal[0] }} blurRadius={0} />

                            <Image style={styles.myberealminor} source={{ uri: this.state.todaysBereal[1] }} blurRadius={0} />

                        </View>
                        <View style={berealStyles.captionblock}>
                            <TouchableOpacity>
                                <Text style={berealStyles.berealcaption}>Add a caption...</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    {/* dynamically add bereals from friends here */}

                    {
                        this.state.timeline.map((bereal, index) => {
                            if (!bereal) {
                                return;
                            }
                            return (
                                <BeReal
                                    key={index}
                                    profile={bereal.profile}
                                    displayname={bereal.displayname ? bereal.displayname : "No Name"}
                                    pic1url={bereal.pic1url}
                                    pic2url={bereal.pic2url}
                                    shown={shown}
                                    navigation={this.props.navigation}
                                />
                            )
                        })
                    }
                    {
                        this.state.timeline.length == 0 ?
                            <View style={[berealStyles.lateBerealCont, { display: !shown ? "flex" : "none", marginTop: "40%" }]}>
                                <Text style={berealStyles.lateBerealMain}>Uh oh, it's empty!</Text>
                                <Text style={[berealStyles.lateBerealSecond, { textAlign: "center" }]}>Looks like none of your friends have uploaded a BeReal. Post a BeReal to get them started!</Text>
                                <TouchableOpacity style={berealStyles.lateBerealButton}  onPress={() => this.props.navigation.navigate("BeRealCamera")}>
                                    <Text style={berealStyles.lateBerealText}>Post a BeReal.</Text>
                                </TouchableOpacity>
                            </View>
                            : <View></View>
                    }

                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    timelineroot: {
        backgroundColor: "black",
        flex: 1
    },
    timelineheader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10
    },
    timelinetitle: {
        color: "white",
        fontSize: 25,
        fontWeight: "bold",
    },
    timelinebereals: {

    },
    myberealcontainer: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 10,
    },
    mybereal: {
        width: "30%"
    },
    myberealmain: {
        width: "100%",
        height: undefined,
        aspectRatio: 3.5 / 4.25,
        borderRadius: 10
    },
    myberealminor: {
        width: "30%",
        height: undefined,
        aspectRatio: 3.5 / 4.25,
        borderRadius: 10,
        position: "absolute",
        top: 5,
        left: 5,
        borderWidth: 1,
        borderColor: "black"
    }
}
)


export default withNavigation(Timeline);
