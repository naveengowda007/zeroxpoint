// Chakra imports
import React, { useEffect, useState } from "react";
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
import Card from "components/card/Card";
import MapMultiple from "./MapMultiple";
import { formatDate, hpost, scrollTop } from "res";
import { MdCancel, MdOutlineAddHome } from "react-icons/md";
import UserMenu from "./UserMenu";

// Assets

export default function UserScreen() {
	const location = useLocation();
	const history = useHistory()

	// states
	const [Userid, setUserid] = useState("")
	const [userLocation, setUserLocation] = useState([]);
	const [UserData, setUserData] = useState([])


	useEffect(() => {
		scrollTop()

		const parsed = queryString.parse(location.search);
		if (parsed?.id) {
			getUserData(parsed?.id)
			setUserid(parsed?.id)
		}
	}, []);


	function getUserData(uid = Userid) {
		hpost(`/getUser/${uid}`, {}, true)
			.then(res => {
				// console.log(res);
				setUserData(res)
				setUserLocation(res.userLocations)
			})
			.catch(err => {
				console.log(err);
				history.push(`/admin/users`)
			})
	}

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
				<Text ml="10px"
					color={"secondaryGray.900"}
					fontSize='22px'
					fontWeight='700'
					lineHeight='100%'
				>
					{UserData.name}, {UserData.phone}
				</Text>

				{UserData.is_deleted ?
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
							{formatDate(UserData.created_at)}
						</span>
					</Text>

					{/* Menu */}
					<UserMenu type="users" is_deleted={UserData.is_deleted} userid={Userid} getDataCallBack={getUserData} />
				</Flex>
			</Flex>

			{/* MAP component */}
			<MapMultiple userLocation={userLocation} />

			{/* DataData */}
			<Card px='25px' w="70%" ml="40px" mt="40px">
				<Grid templateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={8}>
					<Box>
						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Name:
						</Text>
						<Text fontSize='16px' mb='10px'>
							{UserData.name}
						</Text>

						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Phone:
						</Text>
						<Text fontSize='16px' mb='10px'>
							{UserData.phone}
						</Text>
					</Box>

					<Box>
						<Text fontSize='16px' fontWeight='600' mb='5px'>
							Email:
						</Text>
						<Text fontSize='16px' mb='10px'>
							{UserData.email}
						</Text>
					</Box>
				</Grid>

				<Text fontSize='16px' fontWeight='600' mt='10px'>
					Locations:
				</Text>

				{userLocation.map((item, index) => <Card flex={1} maxWidth="450px"
					bg={"#fff"}
					boxShadow={"0px 3px 10px rgba(0, 0, 0, 0.2)"}
					p="15px"
					my="15px"
					borderRadius="10px"
				>
					<Flex flex={1} mb="5px">
						{`#${index + 1}`}
						<Icon as={MdOutlineAddHome} w='20px' h='20px' mr='10px' ml="3px" />
						<Text fontWeight="medium">
							{item.name}, {item.phone}
						</Text>
					</Flex>
					<Text fontSize={"13.5px"} fontWeight="500">
						{item.address_text}
					</Text>
				</Card>)}
			</Card>
		</Card>
	);
}
