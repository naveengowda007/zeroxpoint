import React, { useState } from "react";

// Chakra imports
import {
	Icon,
	Flex,
	Text,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	useDisclosure,
	useColorModeValue,
	Button,
	useToast,
} from "@chakra-ui/react";
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
} from '@chakra-ui/react'
import { hpost } from "res";

// Assets
import {
	MdOutlineMoreHoriz,
	MdClose,
	MdCheck
} from "react-icons/md";

export default function UserMenu(props) {
	const { userid, type, is_deleted, getDataCallBack } = props;
	const toast = useToast()

	const textColor = useColorModeValue("secondaryGray.500", "white");
	const textHover = useColorModeValue(
		{ color: "secondaryGray.900", bg: "unset" },
		{ color: "secondaryGray.500", bg: "unset" }
	);
	const iconColor = useColorModeValue("brand.500", "white");
	const bgList = useColorModeValue("white", "whiteAlpha.100");
	const bgShadow = useColorModeValue(
		"14px 17px 40px 4px rgba(112, 144, 176, 0.08)",
		"unset"
	);
	const bgButton = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
	const bgHover = useColorModeValue(
		{ bg: "secondaryGray.400" },
		{ bg: "whiteAlpha.50" }
	);
	const bgFocus = useColorModeValue(
		{ bg: "secondaryGray.300" },
		{ bg: "whiteAlpha.100" }
	);

	// Ellipsis modals
	const {
		isOpen: isOpen1,
		onOpen: onOpen1,
		onClose: onClose1,
	} = useDisclosure();


	// States
	const [Delete, setDelete] = useState(false)


	// Functions
	function handleDelete() {
		setDelete(false)
		const data = {
			deleteId: userid,
			is_deleted: is_deleted ? 0 : 1,
			type
		}

		hpost("/deactivateUser", data, true)
			.then(res => {
				toast({
					title: is_deleted ? 'Account Activated!' : 'Account Deactivated!',
					status: 'success',
					duration: 3000,
					isClosable: true,
				})
				getDataCallBack()
			}).catch(err => {
				toast({
					title: is_deleted ? 'Could Not Activate Account!' : 'Could Not Deactivate Account!',
					status: 'warning',
					duration: 3000,
					isClosable: true,
				})
			})
	}

	return (
		<Menu isOpen={isOpen1} onClose={onClose1}>
			<MenuButton
				onClick={onOpen1}
				w='37px'
				h='37px'
				bg={bgButton}
				_hover={bgHover}
				_focus={bgFocus}
				_active={bgFocus}
				borderRadius='10px'
			>
				<Icon as={MdOutlineMoreHoriz} color={iconColor} w='24px' h='24px' mt="5px" />
			</MenuButton>

			<MenuList
				w='160px'
				minW='unset'
				maxW='160px !important'
				// backdropFilter='blur(63px)'
				bg={bgList}
				boxShadow={bgShadow}
				borderRadius='20px'
				px='15px' pt='-5px' pb='10px'
			>

				{/* Ordes button */}
				{/* <MenuItem
					transition='0.2s linear'
					p='0px'
					mt='15px'
					borderRadius='8px'
					color={textColor}
					_hover={textHover}
					_active={{
						bg: "transparent",
					}}
					_focus={{
						bg: "transparent",
					}}
				>
					<Flex align='center'>
						<Icon as={MdOutlineCardTravel} h='16px' w='16px' me='8px' />
						<Text fontSize='sm' fontWeight='400'>
							Orders
						</Text>
					</Flex>
				</MenuItem> */}

				{/* Delete Profile */}
				<MenuItem
					onClick={() => setDelete(true)}
					transition='0.2s linear'
					color={textColor}
					_hover={textHover}
					p='0px'
					mt='15px'
					borderRadius='8px'
					_active={{
						bg: "transparent",
					}}
					_focus={{
						bg: "transparent",
					}}
					mb='2px'>
					<Flex align='center'>
						<Icon as={is_deleted ? MdCheck : MdClose} h='16px' w='16px' me='8px' />
						<Text fontSize='sm' fontWeight='400'>
							{is_deleted ? "Reactivate" : "Deactivate"}
						</Text>
					</Flex>
				</MenuItem>

			</MenuList>

			{/* Alert for activate deactivate */}
			<AlertDialog isOpen={Delete} onClose={() => setDelete(false)}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize='lg' fontWeight='bold'>
							{is_deleted ? "Activate Account" : "Deactivate Account"}
						</AlertDialogHeader>

						<AlertDialogBody>
							<span style={{ "white-space": "pre-line", fontWeight: "500" }}>
								{is_deleted ? "Are you sure to activate account?" : "Are you sure to deactivate account?"}
							</span>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button onClick={() => setDelete(false)}>
								Cancel
							</Button>
							<Button colorScheme={is_deleted ? 'green' : 'red'} onClick={handleDelete} ml={3}>
								{is_deleted ? "Activate" : "Deactivate"}
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Menu>
	);
}