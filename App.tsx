import React from 'react';
import type { PropsWithChildren } from 'react';

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './components/Login';
import Timeline from './components/Timeline';
import Profile from './components/Profile';
import Friends from './components/Friends';
import Requests from './components/Requests';
import CreateUser from './components/CreateUser';
import BeRealCamera from './components/BeRealCamera';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Login'
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Timeline'
          component={Timeline}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Profile'
          component={Profile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Friends'
          component={Friends}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Requests'
          component={Requests}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='CreateUser'
          component={CreateUser}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='BeRealCamera'
          component={BeRealCamera}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;
