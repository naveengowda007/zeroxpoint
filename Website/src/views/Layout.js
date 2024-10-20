import React, { useEffect, useMemo, useRef, useState } from "react";
import { Portal, Box, useDisclosure } from "@chakra-ui/react";
import Footer from "components/footer/FooterAdmin.js";

// Layout components
import Navbar from "components/navbar/NavbarAdmin.js";
import Sidebar from "components/sidebar/Sidebar.js";
import { SidebarContext } from "contexts/SidebarContext";
import { Redirect, Route, Switch } from "react-router-dom";
import { adminRoutes, level1AdminRoutes, vendorRoutes } from "routes.js";
import { toast } from 'react-toastify';

// Redux
import { hpost } from "res";
import { useDispatch, useSelector } from "react-redux";
import { setOderFetchInt, setLatestOrder } from "redux/Config";

// Assets
import NotificationSound from "assets/notification-sound.mp3";


export default function Dashboard(props) {
	const { user } = props;

	const routes = useMemo(() => {
		if (user?.type === "vendor") {
			return vendorRoutes
		}
		if (user?.level === 0) {
			return adminRoutes
		}
		else return level1AdminRoutes
	}, [user?.level, user?.type])

	// states and functions
	const [fixed] = useState(false);
	const [toggleSidebar, setToggleSidebar] = useState(false);
	const dispatch = useDispatch()

	const { OderFetchInt, LatestOrder } = useSelector((state) => state.Config);
	const audioPlayer = useRef(null);

	useEffect(() => {
		!LatestOrder && getInitData()
		if (OderFetchInt) clearInterval(OderFetchInt)

		let intervalId = setInterval(getInitData, 10000);
		dispatch(setOderFetchInt(intervalId))
	}, [LatestOrder])

	function playAudio() {
		audioPlayer.current?.play()
	}

	const getInitData = () => {
		const url = user?.type === "vendor" ? `/getOrders4Vendor` : `/getOrders`
		hpost(url, {}, true)
			.then(res => {
				const tempLatest = res.orders[0]
				if (!tempLatest) return
				if (LatestOrder && LatestOrder[0]?.id !== tempLatest.id) {
					dispatch(setLatestOrder(res.orders))
					if (LatestOrder) {
						playAudio()
						toast.info("New Order!", {
							position: "bottom-left",
							autoClose: 3000,
							hideProgressBar: true,
							closeOnClick: true,
							draggable: true,
							progress: undefined,
							theme: "dark",
						});
					}
				}

				dispatch(setLatestOrder(res.orders))
			})
			.catch(err => console.log(err))
	}

	const getActiveRoute = (routes) => {
		let activeRoute = "Dashboard";
		for (let i = 0; i < routes.length; i++) {
			if (routes[i].collapse) {
				let collapseActiveRoute = getActiveRoute(routes[i].items);
				if (collapseActiveRoute !== activeRoute) {
					return collapseActiveRoute;
				}
			} else if (routes[i].category) {
				let categoryActiveRoute = getActiveRoute(routes[i].items);
				if (categoryActiveRoute !== activeRoute) {
					return categoryActiveRoute;
				}
			} else {
				if (
					window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
				) {
					return routes[i].name;
				}
			}
		}
		return activeRoute;
	};

	const getActiveNavbar = (routes) => {
		let activeNavbar = false;
		for (let i = 0; i < routes.length; i++) {
			if (routes[i].collapse) {
				let collapseActiveNavbar = getActiveNavbar(routes[i].items);
				if (collapseActiveNavbar !== activeNavbar) {
					return collapseActiveNavbar;
				}
			} else if (routes[i].category) {
				let categoryActiveNavbar = getActiveNavbar(routes[i].items);
				if (categoryActiveNavbar !== activeNavbar) {
					return categoryActiveNavbar;
				}
			} else {
				if (
					window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
				) {
					return routes[i].secondary;
				}
			}
		}
		return activeNavbar;
	};

	const getActiveNavbarText = (routes) => {
		let activeNavbar = false;
		for (let i = 0; i < routes.length; i++) {
			if (routes[i].collapse) {
				let collapseActiveNavbar = getActiveNavbarText(routes[i].items);
				if (collapseActiveNavbar !== activeNavbar) {
					return collapseActiveNavbar;
				}
			} else if (routes[i].category) {
				let categoryActiveNavbar = getActiveNavbarText(routes[i].items);
				if (categoryActiveNavbar !== activeNavbar) {
					return categoryActiveNavbar;
				}
			} else {
				if (
					window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
				) {
					return routes[i].messageNavbar;
				}
			}
		}
		return activeNavbar;
	};

	const getRoutes = (routes) => {
		return routes.map((prop, key) => {
			if (prop.layout === "/admin") {
				return (
					<Route
						path={prop.layout + prop.path}
						component={prop.component}
						key={key}
					/>
				);
			}
			if (prop.collapse) {
				return getRoutes(prop.items);
			}
			if (prop.category) {
				return getRoutes(prop.items);
			} else {
				return null;
			}
		});
	};

	document.documentElement.dir = "ltr";
	const { onOpen } = useDisclosure();

	return (
		<Box>
			<SidebarContext.Provider
				value={{
					toggleSidebar,
					setToggleSidebar,
				}}>
				<Sidebar routes={routes} display='none' />
				<Box
					float='right'
					minHeight='100vh'
					height='100%'
					overflow='auto'
					position='relative'
					maxHeight='100%'
					w={{ base: "100%", xl: "calc( 100% - 260px )" }}
					maxWidth={{ base: "100%", xl: "calc( 100% - 260px )" }}
					transition='all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)'
					transitionDuration='.2s, .2s, .35s'
					transitionProperty='top, bottom, width'
					transitionTimingFunction='linear, linear, ease'>
					<Portal>
						<Box>
							<Navbar
								routes={routes}
								onOpen={onOpen}
								logoText={"ZeroxPoint"}
								brandText={getActiveRoute(routes)}
								secondary={getActiveNavbar(routes)}
								message={getActiveNavbarText(routes)}
								fixed={fixed}
							/>
						</Box>
					</Portal>

					<Box
						mx='auto'
						p={{ base: "20px", md: "30px" }}
						pe='20px'
						minH='100vh'
						pt='50px'>
						<Switch>
							{getRoutes(routes)}
							<Redirect from='/' to='/admin/dashboard' />
						</Switch>
					</Box>
					<Box>
						<Footer />
					</Box>
				</Box>
			</SidebarContext.Provider>

			<audio ref={audioPlayer} src={NotificationSound} />
		</Box>
	);
}
