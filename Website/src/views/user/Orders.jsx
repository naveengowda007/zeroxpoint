import React, { useState, useEffect } from "react";
import { Box, Image, Spinner, VStack, Card, useColorModeValue, Grid } from "@chakra-ui/react";
import OrderCard from "./components/OrderCard";
import queryString from 'query-string';
import { useLocation } from "react-router-dom";
import { scrollTop, upost } from "res";

// Assets
import NoOrderPng from 'assets/img/Intro1.png'
import OrderScreen from "./components/OrderTrack";

export default function OrdersList(props) {
	const shadow = useColorModeValue(
		'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
		'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	);
	const location = useLocation();
	const [IsLoading, setIsLoading] = useState(true)
	const [Orders, setOrders] = useState([])
	const [Order, setOrder] = useState()

	useEffect(() => {
		getOrders()
		const intid = setInterval(getOrders, 5000);

		return () => clearInterval(intid);
	}, [])

	useEffect(() => {
		const parsed = queryString.parse(location.search);
		if (!parsed?.id) {
			setOrder();
			scrollTop();
		}
	}, [location]);

	const getOrders = () => {
		upost("/order/fetch", {}, true)
			.then(res => {
				setIsLoading(false)
				setOrders(res)
			})
			.catch(error => {
				setIsLoading(false)
				console.log("Error loading orders:", error);
			})
	}

	if (Order) {
		return <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			<OrderScreen Order={Order} shadow={shadow} />
		</Box>
	}

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			<Card alignItems="center" justifyContent="center"
				borderRadius="20px"
				direction='column'
				w='100%'
				px='0px'
				overflowX={{ sm: "scroll", lg: "hidden" }}
				style={{ minHeight: 400 }}
				fontFamily="DM Sans"
			>
				{IsLoading ?
					<>
						<Spinner size="xl" color="blue.500" />
						<Box mt="20px">
							Loading Orders
						</Box>
					</>

					:

					Orders?.length === 0 ?

						<VStack spacing={4} align="center">
							<Image src={NoOrderPng} w="220px" objectFit="contain" mt={4} mb={4} alt="No Order" sx={props.NoOrderPngStyle} />
							<Box color="orange.500" mt={4} fontSize="lg" textAlign="center">
								You haven't made any order yet!
							</Box>
						</VStack>

						:

						<Grid templateColumns={{ base: 'repeat(1,  1fr)', sm: 'repeat(1,  1fr)', md: 'repeat(2,  1fr)', lg: 'repeat(2,  1fr)', xl: 'repeat(2,  1fr)', '2xl': 'repeat(3,  1fr)' }} gap={7} p="10px" alignItems="center">
							{Orders.map((order) => (
								<OrderCard Order={order} key={order?.id} shadow={shadow} setOrder={setOrder} />
							))}
						</Grid>
				}
			</Card>
		</Box>
	);
}
