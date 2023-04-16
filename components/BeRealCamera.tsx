import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
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
import { Camera, PhotoFile, useCameraDevices } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { File } from 'buffer';

const flashofficon = require('../assets/flashofficon.png')
const flashonicon = require('../assets/flashonicon.png')
const switchcameraicon = require('../assets/switchcameraicon.png')


function CameraBlock({ callback }) {
    const devices = useCameraDevices();
    const backCamera = devices.back;
    const frontCamera = devices.front;

    const [activeCamera, setActiveCamera] = React.useState(true); // true -> back, false -> front
    const [flash, setFlash] = React.useState(false);
    const [zoom, setZoom] = React.useState(1);

    const camera = useRef<Camera>(null)

    const isFocused = useIsFocused();

    if (backCamera == null) return <View></View>

    return (
        <View style={{ width: "100%", alignItems: "center", flex: 1, gap: 20 }}>
            <Camera
                style={{ width: "100%", height: undefined, aspectRatio: 3.5 / 4.25, borderRadius: 20, justifyContent: "flex-end", alignItems: "center" }}
                ref={camera}
                device={activeCamera ? backCamera : frontCamera}
                isActive={isFocused}
                photo={true}
                zoom={zoom}
            >
                <TouchableOpacity style={{ borderColor: "white", borderWidth: 1, padding: 3, borderRadius: 35 / 2, width: 35, height: 35, alignItems: "center", justifyContent: "center", marginBottom: 15 }} onPress={() => {
                    if (zoom == 1) {
                        setZoom(2)
                    }
                    if (zoom == 2) {
                        setZoom(1)
                    }
                }}>
                    <Text style={{ color: "white" }}>{zoom}x</Text>
                </TouchableOpacity>
            </Camera>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 30 }}>
                <TouchableOpacity onPress={() => {
                    setFlash(!flash);
                }}>
                    <Image style={{ height: 40, width: 40 }} source={flash ? flashonicon : flashofficon} />
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 75, height: 75, borderRadius: 75 / 2, borderColor: "white", borderWidth: 5 }} onPress={() => {
                    console.log("captured image");
                    function takePicture(referenceCamera: React.RefObject<Camera>) {
                        referenceCamera.current?.takePhoto({
                            flash: flash ? 'on' : 'off'
                        }).then((picture) => {
                            callback(picture)
                        })
                    }

                    camera.current.takePhoto({
                        flash: flash ? 'on' : 'off'
                    }).then((picture) => {
                        callback(picture)
                    }).then(() => {
                        setActiveCamera(!activeCamera);
                        setTimeout(() => {
                            takePicture(camera)
                        }, 1000)

                    })
                }} />
                <TouchableOpacity onPress={() => {
                    setActiveCamera(!activeCamera)
                }}>
                    <Image style={{ height: 40, width: 40 }} source={switchcameraicon} />
                </TouchableOpacity>


            </View>

        </View>
    )
}

function CapturedBeReal({ pic1url, pic2url, callback }: any) {

    const [sequence, setSequence] = useState([pic1url, pic2url])
    const [hidden, setHidden] = useState(false);

    return (
        <View style={berealStyles.berealroot}>
            <View>
                <TouchableOpacity activeOpacity={1} onLongPress={() => {
                    setHidden(true);
                }} onPressOut={() => setHidden(false)}>
                    <Image style={berealStyles.berealactive} source={{ uri: 'file://' + sequence[0] }} />
                </TouchableOpacity>

                <TouchableOpacity style={[berealStyles.berealsecondary, { display: hidden ? 'none' : 'flex' }]} activeOpacity={1} onPress={() => {
                    if (sequence[0] == pic1url) {
                        setSequence([pic2url, pic1url])
                    } else {
                        setSequence([pic1url, pic2url])
                    }
                }}>
                    <Image style={berealStyles.berealinactive} source={{ uri: 'file://' + sequence[1] }} />
                </TouchableOpacity>
                <TouchableOpacity style={{ position: "absolute", top: 10, right: 10 }} onPress={() => {
                    callback()
                }}>
                    <Text style={{ transform: [{ rotate: "45deg" }], color: "white", fontSize: 20, fontWeight: "bold", padding: 5 }}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const berealStyles = StyleSheet.create({
    berealroot: {
        backgroundColor: 'none',
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
})

interface BeRealCameraInterface {
    photos: PhotoFile[]
}
class BeRealCamera extends React.Component<{}, BeRealCameraInterface> {

    constructor(props: BeRealCameraInterface) {
        super(props)
        this.state = {
            photos: []
        }
        this.setPhoto = this.setPhoto.bind(this);
    }

    async componentDidMount(): void {
        const cameraPermission = await Camera.getCameraPermissionStatus()
        if (cameraPermission != "authorized") {
            const newCameraPermission = await Camera.requestCameraPermission()
        }
        console.log(cameraPermission)
    }
    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<BeRealCameraInterface>, snapshot?: any): void {
        for (let i = 0; i < this.state.photos.length; i++) {
            const photo = this.state.photos[i];
            console.log(photo.path)
        }
    }

    setPhoto(photo: PhotoFile) {
        var photoList = this.state.photos;
        if (photoList.length > 2) {
            photoList = []
        }
        photoList.push(photo)
        this.setState({ photos: photoList })
    }

    async uploadBereal() {
        const token = await AsyncStorage.getItem("@user_token");

        const images: any = []
        this.state.photos.map((photo) => {
            images.push({
                uri: photo.path,
                name: 'image.jpg',
                type: 'image/jpeg',
            })
        })
        console.log(images)

        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        var formdata = new FormData();
        images.map((file: any) => {
            formdata.append("file", file)
        })

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        fetch(`${BEREALAPI}/api/bereal/new`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result.hasOwnProperty("error")) {
                    console.log(result["error"])
                    return;
                }

                console.log("uploaded bereal");
                this.props.navigation.goBack()

            })
            .catch(error => console.log('error', error));
    }


    render(): React.ReactNode {
        return (
            <SafeAreaView style={styles.cameraroot}>
                <Text style={{ color: "white", fontSize: 30, fontWeight: "bold" }}>BeReal.</Text>
                <TouchableOpacity style={{ padding: 5 }} onPress={() => {
                    this.props.navigation.goBack();
                }}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
                </TouchableOpacity>

                {this.state.photos.length < 2 ?
                    <CameraBlock callback={this.setPhoto} />
                    :
                    <View style={{ alignItems: "center", height: "80%" }}>
                        <CapturedBeReal pic1url={this.state.photos[0].path} pic2url={this.state.photos[1].path} callback={() => {
                            this.setState({ photos: [] })
                        }} />
                        <TouchableOpacity style={{ position: "absolute", bottom: 30 }} onPress={() => {
                            this.uploadBereal();
                        }}>
                            <Text style={{ color: "white", "fontSize": 50, fontWeight: "900" }}>SEND ►</Text>
                        </TouchableOpacity>
                    </View>
                }

            </SafeAreaView>
        )
    }

}

const styles = StyleSheet.create({
    cameraroot: {
        backgroundColor: "black",
        flex: 1,
        alignItems: "center",
        width: "100%"
    }
})

export default withNavigation(BeRealCamera);