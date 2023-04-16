import AsyncStorage from "@react-native-async-storage/async-storage";


export interface RefreshTokenInterface {
    token: string,
    refresh_token: string
}

export async function refreshToken(callback: Function) {

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

    fetch("http://localhost:6969/api/login/refresh", requestOptions)
        .then(response => response.json())
        .then(result => callback(result))
        .catch(error => console.log('error', error));
}

export function multiStoreData(set: [string, string][]) {
    return AsyncStorage.multiSet(set)
}

export const BEREALAPI = 'https://0a5e-2600-1702-5282-f080-e95a-4140-2e32-1b3a.ngrok-free.app'