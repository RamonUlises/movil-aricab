import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Layout() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          screenOptions={{
            headerShown: false,
            drawerActiveTintColor: "white",
            drawerInactiveTintColor: "black",
            drawerActiveBackgroundColor: "#22c55e",
            drawerStyle: {
              backgroundColor: "#f1f5f9",
            },
            drawerType: "slide",
            drawerStatusBarAnimation: "slide",
            swipeEdgeWidth: 500,
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: "Home",
              drawerIcon: (color) => (
                <AntDesign name="home" size={24} color={color.color} />
              ),
            }}
          />
          <Drawer.Screen
            name="productos"
            options={{
              drawerLabel: "Productos",
              drawerIcon: (color) => (
                <Feather name="shopping-bag" size={24} color={color.color} />
              ),
            }}
          />
          <Drawer.Screen
            name="clientes"
            options={{
              drawerLabel: "Clientes",
              drawerIcon: (color) => (
                <Feather name="users" size={24} color={color.color} />
              ),
            }}
          />
          <Drawer.Screen
            name="facturas"
            options={{
              drawerLabel: "Facturas",
              drawerIcon: (color) => (
                <Ionicons
                  name="documents-outline"
                  size={24}
                  color={color.color}
                />
              ),
              
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
  );
}
