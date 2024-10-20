import React, { useEffect, useState } from "react";
import {
	Flex,
	Text,
	Grid,
	Icon,
	Box,
} from "@chakra-ui/react";
import { formatDate, scrollTop } from "res";

// Custom components
import Card from "components/card/Card";
import MapMultiple4Orders from "views/admin/components/MapMultiple4Orders";

// Assets
import { MdCheckCircle, MdCancel } from "react-icons/md";
import OrderCard from "./OrderCard";

export default function OrderScreen({ Order, shadow }) {
	// states
	const OrderData = Order;
	const [Cart, setCart] = useState({})
	const [Delivered, setDelivered] = useState(false)
	const [Cancelled, setCancelled] = useState(false)

	useEffect(() => {
		const cart = JSON.parse(JSON.stringify(Order.cart.order_details))
		setCart(cart)
	}, []);

	useEffect(() => {
	}, []);

	useEffect(() => {
		scrollTop()
		if (!OrderData) return

		if (OrderData.status.length > 0 && OrderData.status.every(item => item === 'delivered')) {
			setDelivered(true)
			setCancelled(false)
		} else if (OrderData.order_details?.isCancelled) {
			setDelivered(false)
			setCancelled(true)
		}

		setCart(OrderData.cart)
	}, [])

	return (
		<Card
			direction='column'
			w='100%'
			px='0px'
			overflowX={{ sm: "scroll", lg: "hidden" }}
			style={{ minHeight: 400 }}
		>
			{/* Title */}
			<Flex px='25px' justify='space-between' my='10px' mx="15px" alignItems='center'>
				<Flex>
					<Text ml="10px"
						color={"secondaryGray.900"}
						fontSize='22px'
						fontWeight='700'
						lineHeight='100%'
					>
						Order ID:
					</Text>
					<Text ml="10px"
						color={"secondaryGray.900"}
						fontSize='22px'
						lineHeight='100%'
					>
						#ZP0{OrderData?.id}
					</Text>
				</Flex>

				{(Delivered || Cancelled) && <Flex alignItems="center">
					<Icon
						w='24px'
						h='24px'
						ml='10px'
						color={Delivered ? "green.500" : "orange.500"}
						as={Delivered ? MdCheckCircle : Cancelled ? MdCancel : null}
					/>
					<Text color={"secondaryGray.900"}
						fontSize='22px'
						fontWeight='700'
					>{Delivered ? "Delivered" : Cancelled ? "Cancelled" : ""}</Text>
				</Flex>}

				<Flex align="center">
					<Text fontSize='16px' fontWeight='600' mr="20px">
						Created On:
						<span style={{ marginLeft: "20px", fontWeight: "normal" }}>
							{formatDate(OrderData.created_at)}
						</span>
					</Text>
				</Flex>
			</Flex>

			{/* MAP component */}
			<MapMultiple4Orders userLocation={OrderData?.delivery_location} shops={OrderData?.shops} disableClick />

			{/* Order data */}
			<Card px='25px' w="75%" ml="20px" mt="20px">
				<OrderCard Order={Order} shadow={shadow} />

				{OrderData.filesCount > 0 && <Card my="15px" mt="60px" w="400px"
					boxShadow={"0px 3px 20px rgba(112, 144, 176, 0.2)"}
					p="10px"
					alignSelf="center"
					borderRadius="10px"
				>
					<Flex justifyContent="space-between" alignItems="center" ml="45px">
						<Flex alignItems="center" mt="1px">
							<Text
								color={"secondaryGray.900"}
								fontSize='16px'
								fontWeight='700'
							>Files:
							</Text>

							<Text ml="15px"
								color={"secondaryGray.900"}
								fontSize='16px'
								fontWeight='500'
							>
								{OrderData.filesCount}
							</Text>
						</Flex>
					</Flex>
				</Card>}


				<Flex justifyContent="center" my="10px" mt="60px">
					<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 15 }}>
						Order Created: {new Date(OrderData.created_at).toLocaleDateString() + "  " + new Date(OrderData.created_at).toLocaleTimeString()}
					</Text>

					<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 15, marginLeft: "30px" }}>
						({Cart?.order_details?.cart?.length} Items)
					</Text>
					<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 15, marginLeft: "15px" }}>
						₹ {Cart?.order_details?.totalCost}
					</Text>
				</Flex>

				{Cart?.order_details?.PrintingInstructions !== "" && <Card maxWidth="500px" p="10px" m="10px" borderRadius="7px"
					boxShadow={"0px 3px 20px rgba(0, 0, 0, 0.11)"} alignSelf="center"
				>
					<Text style={{ color: "rgba(32, 76, 158, 1)", fontWeight: "700", fontSize: 14 }} mb="5px">
						Printing Instructions :
					</Text>
					<Text style={{ fontWeight: "700", fontSize: 15 }} my="2px">
						{Cart?.order_details?.PrintingInstructions}
					</Text>
				</Card>}

				<Grid templateColumns={{ base: 'repeat(2, 1fr)' }} gap="50px">
					{Cart?.order_details?.cart.map((item, index) => {
						let fileExtension = item.uri.split('/').pop();

						return <Card key={index} flex={1} maxWidth="400px"
							bg="#fff"
							boxShadow={"0px 3px 10px rgba(0, 0, 0, 0.15)"}
							p="10px"
							my="15px"
							borderRadius="15px"
						>
							<Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 13 }} mb="10px">
								{fileExtension.toUpperCase()}
							</Text>

							<Flex justifyContent="space-around" alignItems="center">
								<Box textAlign="center">
									<span style={{ "white-space": "pre-line", fontSize: 13, fontWeight: "500" }}>
										{`${item.size.name}\n${item.sides}\n${item.paper.name}\n${index > 1 ? "Binding is my bitch" : item.binding.name}`}
									</span>
								</Box>
								<Box textAlign="center">
									<span style={{ "white-space": "pre-line", fontSize: 13, fontWeight: "500" }}>
										{`${item.color}\nCopies: ${item.copies}\nPages: ${item.pages}`}
									</span>
								</Box>
							</Flex>
						</Card>
					})}
				</Grid>
			</Card>
		</Card>
	);
}
