import React from "react";

import { Icon } from "@chakra-ui/react";
import {
	MdHome,
	MdOutlineShoppingCart,
	MdStore,
	MdPersonAdd,
	MdSettings,
	MdAttachMoney,
	MdCalculate,
	MdMyLocation
} from "react-icons/md";

// Admin Imports
import MainDashboard from "views/admin";
import Orders from "views/admin/orders";
import Users from "views/admin/users";
import Vendors from "views/admin/vendors";
import Profile from "views/admin/profile";
import PriceHandler from "views/admin/PriceHandler";
import PriceCalculator from "views/admin/PriceCalculator"
import GodView from "views/admin/GodView";

// Vendor Imports
import VendorMainDashboard from "views/vendor";
import VendorOrders from "views/vendor/orders";
import VendorPriceHandler from "views/vendor/PriceHandler";
import VendorPriceCalculator from "views/vendor/PriceCalculator";
import VendorProfile from "views/vendor/profile"

// User Imports
import OrdersList from "views/user/Orders";
import CartScreen from "views/user/CartScreen";
import UserProfile from "views/user/profile"
import UserCalculator from "views/user/PriceCalculator"


export const adminRoutes = [
	{
		name: "Dashboard",
		layout: "/admin",
		path: "/dashboard",
		icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' mt='5px' />,
		component: MainDashboard,
	},
	{
		name: "Orders",
		layout: "/admin",
		path: "/orders",
		icon: <Icon as={MdOutlineShoppingCart} width='20px' height='20px' color='inherit' mt='5px' />,
		component: Orders,
	},
	{
		name: "Users",
		layout: "/admin",
		path: "/users",
		icon: <Icon as={MdPersonAdd} width='20px' height='20px' color='inherit' mt='5px' />,
		component: Users,
	},
	{
		name: "Vendors",
		layout: "/admin",
		path: "/vendors",
		icon: <Icon as={MdStore} width='20px' height='20px' color='inherit' mt='5px' />,
		component: Vendors,
	},
	{
		name: "Price Handler",
		layout: "/admin",
		path: "/price",
		icon: <Icon as={MdAttachMoney} width='20px' height='20px' color='inherit' mt='5px' />,
		component: PriceHandler,
	},
	{
		name: "Price Calculator",
		layout: "/admin",
		path: "/calculate",
		icon: <Icon as={MdCalculate} width='20px' height='20px' color='inherit' mt='5px' />,
		component: PriceCalculator,
	},
	{
		name: "Settings",
		layout: "/admin",
		path: "/profile",
		icon: <Icon as={MdSettings} width='20px' height='20px' color='inherit' mt='5px' />,
		component: Profile,
	},
	{
		name: "God View",
		layout: "/admin",
		path: "/godView",
		icon: <Icon as={MdMyLocation} width='20px' height='20px' color='inherit' mt='5px' />,
		component: GodView,
	},
];


export const level1AdminRoutes = [
	{
		name: "Dashboard",
		layout: "/admin",
		path: "/dashboard",
		icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' mt='5px' />,
		component: MainDashboard,
	},
	{
		name: "Orders",
		layout: "/admin",
		path: "/orders",
		icon: <Icon as={MdOutlineShoppingCart} width='20px' height='20px' color='inherit' mt='5px' />,
		component: Orders,
	},
	{
		name: "Vendors",
		layout: "/admin",
		path: "/vendors",
		icon: <Icon as={MdStore} width='20px' height='20px' color='inherit' mt='5px' />,
		component: Vendors,
	},
	{
		name: "Settings",
		layout: "/admin",
		path: "/profile",
		icon: <Icon as={MdSettings} width='20px' height='20px' color='inherit' mt='5px' />,
		component: Profile,
	},
];


export const vendorRoutes = [
	{
		name: "Dashboard",
		layout: "/admin",
		path: "/dashboard",
		icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' mt='5px' />,
		component: VendorMainDashboard,
	},
	{
		name: "Orders",
		layout: "/admin",
		path: "/orders",
		icon: <Icon as={MdOutlineShoppingCart} width='20px' height='20px' color='inherit' mt='5px' />,
		component: VendorOrders,
	},
	{
		name: "Price Calculator",
		layout: "/admin",
		path: "/calculate",
		icon: <Icon as={MdCalculate} width='20px' height='20px' color='inherit' mt='5px' />,
		component: VendorPriceCalculator,
	},
	{
		name: "Settings",
		layout: "/admin",
		path: "/profile",
		icon: <Icon as={MdSettings} width='20px' height='20px' color='inherit' mt='5px' />,
		component: VendorProfile,
	},
	{
		name: "Price Handler",
		layout: "/admin",
		path: "/price",
		icon: <Icon as={MdAttachMoney} width='20px' height='20px' color='green' mt='5px' />,
		component: VendorPriceHandler,
	},
];

export const userRoutes = [
	{
		name: "Cart",
		layout: "/user",
		path: "/cart",
		icon: <Icon as={MdOutlineShoppingCart} width='20px' height='20px' color='inherit' mt='5px' />,
		component: CartScreen,
	},
	{
		name: "Orders",
		layout: "/user",
		path: "/orders",
		icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' mt='5px' />,
		component: OrdersList,
	},
	{
		name: "Price Calculator",
		layout: "/user",
		path: "/calculate",
		icon: <Icon as={MdCalculate} width='20px' height='20px' color='inherit' mt='5px' />,
		component: UserCalculator,
	},
	{
		name: "Profile",
		layout: "/user",
		path: "/profile",
		icon: <Icon as={MdSettings} width='20px' height='20px' color='inherit' mt='5px' />,
		component: UserProfile,
	},
];
