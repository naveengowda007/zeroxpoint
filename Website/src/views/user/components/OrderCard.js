import React, { useState, useMemo } from "react";
import { Box, Text, Flex, HStack, Card, Image } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

// Assets
import StartPointSvg from 'assets/img/icons/StartPoint.svg';
import GPSSvg from 'assets/img/icons/GPS.svg';

export default function OrderCard({ Order, shadow, setOrder }) {
	const [IsDelivered, setIsDelivered] = useState();
	const history = useHistory()

	// Convert Order.status to title case
	const statusTitleCase = useMemo(() => {
		if (Order.status.length === Order.delivery_location.length && Order.status.every(item => item === 'delivered')) {
			setIsDelivered(true)
			return ""
		}

		if (Order.order_details?.isCancelled) {
			if (Order.order_details?.isRefunded) {
				return "Refunded"
			}
			return "Cancelled"
		}

		if (Order.delivery_location.length === 1) {
			return generateStatuesText(Order.status[0])
		} else if (Order.status.length === 0) {
			return "Processing"
		}

		return "In Progress"
	}, [])

	function generateStatuesText(text) {
		if (!text) return "Processing"

		switch (text) {
			case 'printing':
				text = "Printing"
				break;
			case 'waiting':
				text = "Picking Up Order"
				break;
			case 'out':
				text = "Out For Delivery"
				break;
			default: text = "Processing"
		}

		return text
	}

	function RenderEachLocStatus({ index }) {
		return Order?.delivery_location?.length > 1 && !statusTitleCase.startsWith("Cancel") && !statusTitleCase.startsWith("Refund") && <Box style={{ backgroundColor: "#FEF7EC", justifyContent: "center", padding: 5, borderRadius: 7 }}>
			{generateStatuesText(Order.status[index])}
		</Box>
	}
	return (
		<Card onClick={() => {
			history.push("?id=" + Order?.id)
			setOrder && setOrder(Order)
		}} p="10px" borderRadius="11px" shadow={shadow} _hover={setOrder && { cursor: "pointer" }} minW="350px" maxW="550px">
			<HStack justifyContent="space-between" alignItems="center">
				<HStack>
					<Text fontSize="md">
						Order ID:
					</Text>
					<Text fontSize="md" fontWeight="semibold">
						ZP0{Order.id}
					</Text>
				</HStack>
				<HStack alignItems="center">
					{IsDelivered === null ? null : IsDelivered ? (
						<Box bg="#F0F9F1" p={2} rounded="full">
							<Text color="#4CAF50">Delivered</Text>
						</Box>
					) : (
						<Box bg="#FEF7EC" p={2} rounded="sm">
							<Text>{statusTitleCase}</Text>
						</Box>
					)}
				</HStack>
			</HStack>

			{Order?.delivery_location?.map((userLoc, index) => (
				<Box key={index} bg="#F0F9F1" p={3} my={index ? 4 : 2} rounded="lg">
					<Flex direction="row" justify="space-between">
						<Text>{userLoc.name}</Text>
						<Text>{userLoc.phone}</Text>
					</Flex>
					<Flex direction="row" my={4}>
						<Image src={StartPointSvg} w="24px" h="24px" />
						<Text ml="10px">{userLoc.address_text}</Text>
					</Flex>
					<Flex direction="row" my={4}>
						<Image src={GPSSvg} w="24px" h="24px" />

						<Text flex="1" ml="10px">ZEROXPOINT</Text>
						<Box position="relative" right="0">
							{Order.status[index] === "delivered" ? (
								<Box bg="#F0F9F1" p={2} rounded="full">
									<Text color="#4CAF50">Delivered</Text>
								</Box>
							) : (
								<RenderEachLocStatus index={index} />
							)}
						</Box>
					</Flex>
				</Box>
			))}
		</Card>
	);
}
