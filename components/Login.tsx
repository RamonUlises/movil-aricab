import {
  SafeAreaView,
  Text,
  TextInput,
  Pressable,
} from "react-native";
import { useState } from "react";

export const Login = ({
  login,
}: {
  login: (username: string, password: string) => Promise<void>;
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try{
      await login(username, password);
    } catch (error) {
      console.error(error)
    }
  };

  return (
    <SafeAreaView className="w-full h-full flex flex-col justify-center bg-slate-200">
      <Text className="text-center absolute font-bold text-3xl text-green-600 top-12 left-0 right-0">
        Ari-Cab Facturation
      </Text>
      <Text className="text-center font-bold text-2xl mb-16 text-black">
        Inicia sesión
      </Text>
      <TextInput
        placeholder="Usuario"
        onChangeText={setUsername}
        value={username}
        className="my-4 border-b-2 border-black mx-8 text-black"
      />
      <TextInput
        placeholder="Contraseña"
        onChangeText={setPassword}
        secureTextEntry
        value={password}
        onBlur={async () => {
          await handleLogin()
        }}
        className="mt-4 mb-16 border-b-2 border-black mx-8 text-black"
      />

      <Pressable className="w-full" onPress={async () => await handleLogin()}>
        <Text className="text-center text-lg font-semibold text-green-600">
          Login
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};
