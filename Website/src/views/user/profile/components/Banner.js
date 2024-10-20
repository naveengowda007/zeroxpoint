import React, { useEffect, useState } from "react";
// Chakra imports
import {
	Avatar, Box, SimpleGrid, Text, useColorModeValue,
	Button, FormControl, FormLabel, Input, useToast, IconButton, Flex
} from "@chakra-ui/react";
import { handleUserData, logout } from "Utils/auth";
import Card from "components/card/Card.js";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { upost } from "res";
import Information from "views/admin/profile/components/Information";
import { EditIcon } from "@chakra-ui/icons";


export default function Banner(props) {
	// Chakra Color Mode
	const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
	const borderColor = useColorModeValue(
		"white !important",
		"#111C44 !important"
	);
	const cardShadow = useColorModeValue(
		"0px 7px 40px rgba(112, 144, 176, 0.12)",
		"unset"
	);


	const { banner, avatar } = props;
	const history = useHistory()
	const dispatch = useDispatch()
	const UserData = useSelector((state) => state.UserData);
	const toast = useToast();


	// States
	const [IsEdit, setIsEdit] = useState(false)
	const [isLoading, setIsLoading] = useState(false);

	const [name, setName] = useState(UserData.name || '');
	const [phone, setPhone] = useState(UserData.phone || '');
	const [email, setEmail] = useState(UserData.email || '');

	useEffect(() => {
		let tempUserData = { justFetch: true }
		upost('/profile/update', tempUserData, true)
			.then(user => {
				if (user.is_deleted) {
					logout(history)
					return
				}
				handleUserData(user, dispatch)
			})
			.catch(err => {
				console.log(err);
				if (err.status === 401) {
					logout(history)
				}
			})
	}, [])

	const handleUpdate = () => {
		setIsLoading(true);
		const nameStatus = validateName(name);
		const phoneStatus = validatePhone(phone);
		const emailStatus = validateEmail(email);

		if (!nameStatus.status || !phoneStatus.status || !emailStatus.status) {
			setIsLoading(false);
			toast({
				title: 'Error',
				description: 'Please fill all fields correctly.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		let tempUserData = { name, email: email.toLowerCase(), type: 'phone' };

		upost('/profile/update', tempUserData, true)
			.then(res => {
				handleUserData(res, dispatch);
				toast({
					title: 'Success',
					description: 'Profile updated successfully!',
					status: 'success',
					duration: 3000,
					isClosable: true,
				});
				handleEditCancel()
			})
			.catch(err => {
				console.log(err);
				toast({
					title: 'Error',
					description: 'Could not update profile.',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
				setIsLoading(false);
			});
	};

	const handleEditCancel = () => {
		setIsLoading(false)
		setIsEdit(false)
		setName(UserData.name || '');
		setPhone(UserData.phone || '');
		setEmail(UserData.email || '');
	}

	return (
		<Card mb="20px" align='center'>
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

			{!IsEdit && (<Flex w="100%" align="center" justifyContent='center'>
				<Text color={textColorPrimary} fontWeight='bold' fontSize='xl' m='10px'>
					{UserData?.name}
				</Text>
				<IconButton title="Edit Profile" text
					icon={<EditIcon />}
					onClick={() => setIsEdit(true)}
				/>
			</Flex>
			)}

			{/* User data */}
			{(IsEdit || !UserData?.name) ?
				<Card flex={1} alignItems="center" mt={5} w={420} justifyItems="center" p="25px"
					alignSelf="center" boxShadow={cardShadow}
				>
					<Box flex={1} width="100%" borderRadius="3xl">
						<FormControl isRequired mb={5}>
							<FormLabel>Name</FormLabel>
							<Input placeholder="What do we call you?" value={name} onChange={
								(e) => {
									e.preventDefault()
									setName(e.target.value)
								}
							} />

						</FormControl>

						<FormControl isRequired mb={5}>
							<FormLabel>Phone</FormLabel>
							<Input placeholder="Enter phone number" value={phone} onChange={
								(e) => {
									e.preventDefault()
									setPhone(e.target.value)
								}}
								isDisabled={UserData.phone ? true : false} />
						</FormControl>

						<FormControl isRequired mb={5}>
							<FormLabel>Email</FormLabel>
							<Input placeholder="Where do we reach you?" value={email} onChange={
								(e) => {
									e.preventDefault()
									setEmail(e.target.value)
								}} autoCapitalize="none" />
						</FormControl>

						<Flex alignItems="center" mt={7} justifyContent="center">
							<Button bgColor='orange' color='white' borderRadius="50px" px="15px" ml="-40px"
								_hover={{ transform: 'scale(1.05)' }}
								isLoading={isLoading}
								isDisabled={isLoading}
								onClick={handleEditCancel}
							>
								X
							</Button>
							<Button bgColor='#59BA41' color='white' borderRadius="5px" px="25px" mx="25px"
								_hover={{ transform: 'scale(1.05)' }}
								isLoading={isLoading}
								isDisabled={isLoading}
								onClick={handleUpdate}
							>
								Update
							</Button>
						</Flex>
					</Box>
				</Card>

				:

				<SimpleGrid columns='2' gap='20px'>
					<Information
						boxShadow={cardShadow}
						title='Phone:'
						value={UserData.phone}
					/>
					<Information
						boxShadow={cardShadow}
						title='Email:'
						value={UserData.email}
					/>
				</SimpleGrid>}
		</Card>
	)
}


function validateName(name) {
	const nameRegex = /^[a-zA-Z ]{2,30}$/;
	return {
		status: nameRegex.test(name),
		message: "Enter a valid name",
	};
}

function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return {
		status: emailRegex.test(email),
		message: "Enter a valid email address",
	};
}

function validatePhone(phone) {
	const phoneRegex = /^[0-9]{10}$/;
	return {
		status: phoneRegex.test(phone),
		message: "Enter a valid email address",
	};
}