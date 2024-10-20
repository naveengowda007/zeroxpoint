// Chakra imports
import { Avatar, Box, Flex, Grid, Text, useColorModeValue } from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { hpost } from "res";

// Components
import Map from "views/admin/components/Map";

export default function Banner(props) {
	const { banner, avatar } = props;
	const { name } = useSelector((state) => state.UserData);

	const [UserData, setUserData] = useState({})
	const [userLocation, setUserLocation] = useState();
	const [PaymentInfo, setPaymentInfo] = useState({})

	// Chakra Color Mode
	const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
	const borderColor = useColorModeValue(
		"white !important",
		"#111C44 !important"
	);

	useEffect(() => {
		hpost("/getMyVendor", null, true)
			.then(res => {
				setUserData(res)
				setUserLocation({
					lat: res.latitude,
					lng: res.longitude,
				})

				// Payment info
				res.paymentInfo.payment_data.payment_type = res.paymentInfo.payment_type
				setPaymentInfo(res.paymentInfo.payment_data)
			})
	}, [])

	return (<>
		<Card mb={{ base: "0px", lg: "20px" }} align='center'>
			<Box
				bg={`url(${banner})`}
				bgSize='cover'
				borderRadius='16px'
				h='131px'
				w='100%'
			/>
			<Avatar
				mx='auto'
				src={avatar}
				h='87px'
				w='87px'
				mt='-43px'
				border='4px solid'
				borderColor={borderColor}
			/>

			<Text color={textColorPrimary} fontWeight='bold' fontSize='xl' mt='10px'>
				{name}
			</Text>
		</Card>

		<Card mb='40px'
			direction='column'
			px='0px'
			overflowX={{ sm: "scroll", lg: "hidden" }}
		>
			{/* User data */}
			<Flex>
				{/* MAP component */}
				<Map userLocation={userLocation} />

				{/* DataData */}
				<Grid templateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={8} px='25px' w="60%" ml="40px" mt="20px">
					<Box>
						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Shop Name:
						</Text>
						<Text fontSize='16px' mb='10px'>
							{UserData.shop_name}
						</Text>

						<Text fontSize='16px' fontWeight='600' mb='5px' mt="40px">
							Address:
						</Text>
						<Text fontSize='16px'>
							{UserData.address_text}
						</Text>
					</Box>

					<Box>
						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Phone:
						</Text>
						<Text fontSize='16px' mb='10px'>
							{UserData.phone}
						</Text>

						<Text fontSize='16px' fontWeight='600' mb='5px' mt="40px">
							Email:
						</Text>
						<Text fontSize='16px'>
							{UserData.email}
						</Text>
					</Box>

					<Box>
						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Payment Info:
						</Text>

						{PaymentInfo.payment_type === "account" ? <>
							<Flex>
								<Text fontSize='16px' fontWeight="500" width="180px">
									Account Holder Name:
								</Text>
								{PaymentInfo.accountHolderName}
							</Flex>

							<Flex>
								<Text fontSize='16px' fontWeight="500" width="180px">
									Account Number:
								</Text>
								{PaymentInfo.accountNumber}
							</Flex>

							<Flex>
								<Text fontSize='16px' fontWeight="500" width="180px">
									IFSC Code:
								</Text>
								{PaymentInfo.ifscCode}
							</Flex>
						</>
							:
							<Text fontSize='16px'>
								UPI ID: {PaymentInfo.upiId}
							</Text>}
					</Box>
				</Grid>
			</Flex>
		</Card>
	</>);
}
