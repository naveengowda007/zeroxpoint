import React, { useEffect, useState } from "react";
// Chakra imports
import {
	Box,
	Flex,
	Text,
	Grid,
	Icon,
} from "@chakra-ui/react";
import { useLocation, useHistory } from "react-router-dom";
import queryString from 'query-string';

// Custom components
import { formatDate, hpost, scrollTop } from "res";
import UserMenu from "./UserMenu";
import Card from "components/card/Card";
import Map from "./Map";

// Assets
import { MdCancel } from "react-icons/md";
import PriceHandler from "views/vendor/PriceHandler";

export default function UserScreen() {
	const location = useLocation();
	const history = useHistory()

	// states
	const [Userid, setUserid] = useState("")
	const [userLocation, setUserLocation] = useState();
	const [VendorData, setVendorData] = useState([])
	const [PaymentInfo, setPaymentInfo] = useState({})

	useEffect(() => {
		scrollTop()

		const parsed = queryString.parse(location.search);
		if (parsed?.id) {
			getVendorData(parsed?.id)
			setUserid(parsed?.id)
		}
	}, []);


	function getVendorData(uid = Userid) {
		hpost(`/getVendor/${uid}`, {}, true)
			.then(res => {
				// console.log(res);
				setVendorData(res)
				setUserLocation({
					lat: res.latitude,
					lng: res.longitude,
				})

				// Payment info
				res.paymentInfo.payment_data.payment_type = res.paymentInfo.payment_type
				setPaymentInfo(res.paymentInfo.payment_data)
			})
			.catch(err => {
				console.log(err);
				history.push(`/admin/vendors`)
			})
	}

	return (<>
		<Card
			direction='column'
			w='100%'
			px='0px'
			mb="-40px"
			overflowX={{ sm: "scroll", lg: "hidden" }}
			style={{ minHeight: 400 }}
		>
			{/* Title */}
			<Flex px='25px' justify='space-between' my='10px' mx="15px" alignItems='center'>
				<Text ml="10px"
					color={"secondaryGray.900"}
					fontSize='22px'
					fontWeight='700'
					lineHeight='100%'
				>
					{VendorData.shop_name}, {VendorData.phone}
				</Text>

				{VendorData.is_deleted ?
					<Flex alignItems="center">
						<Icon
							w='24px'
							h='24px'
							ms='10px'
							color={"orange.500"}
							as={MdCancel}
						/>
						<Text color={"secondaryGray.900"}
							fontSize='22px'
							fontWeight='700'
						>Deleted</Text>
					</Flex>
					: null}

				<Flex align="center">
					<Text fontSize='16px' fontWeight='600' mr="20px">
						Created On:
						<span style={{ marginLeft: "20px", fontWeight: "normal" }}>
							{formatDate(VendorData.created_at)}
						</span>
					</Text>

					{/* Menu */}
					<UserMenu type="shops" is_deleted={VendorData.is_deleted} userid={Userid} getDataCallBack={getVendorData} />
				</Flex>
			</Flex>

			{/* Vednor data */}
			<Flex mt="10px">
				{/* MAP component */}
				<Map userLocation={userLocation} />

				{/* Vendor Data */}
				<Grid templateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={8} px='25px' w="60%" ml="40px" mt="20px">
					<Box>
						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Owner Name:
						</Text>
						<Text fontSize='16px' mb='10px'>
							{VendorData.name}
						</Text>

						<Text fontSize='16px' fontWeight='600' mb='5px' mt="40px">
							Address:
						</Text>
						<Text fontSize='16px'>
							{VendorData.address_text}
						</Text>
					</Box>

					<Box>
						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Phone:
						</Text>
						<Text fontSize='16px' mb='10px'>
							{VendorData.phone}
						</Text>

						<Text fontSize='16px' fontWeight='600' mb='5px' mt="40px">
							Email:
						</Text>
						<Text fontSize='16px'>
							{VendorData.email}
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

		{VendorData.price_table && <PriceHandler price_table={VendorData.price_table} />}
	</>
	);
}
