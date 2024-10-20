import React, { useCallback, useState } from 'react';
import {
	Text, Box, VStack, HStack, IconButton, useToast, Image, Button,
	AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';

// Assests
import CallSvg from 'assets/img/icons/Call.svg';
import GPSSvg from 'assets/img/icons/GPS.svg';
import MenuSvg from 'assets/img/svg/Menu.svg';
import { upost } from 'res';
import { handleUserData } from 'Utils/auth';
import { setUserLocation } from 'redux/UserLocation';

export default function LocationCard(props) {
	const toast = useToast()
	const dispatch = useDispatch();
	const UserData = useSelector((state) => state.UserData);

	// constants
	const item = props.location
	const [ShowDeleteModal, setShowDeleteModal] = useState(false)

	const checkDefaultLocation = useCallback(() => item.id === UserData.default_location_id, [item.id, UserData.default_location_id])

	function handleSetDefault(isDelete = false) {
		let data = { default_location_id: item.id, type: "phone" }
		if (isDelete) {
			data.isDelete = "location";
			data.id = item.id
		}

		upost('/profile/update', data, true)
			.then(res => {
				if (isDelete) {
					handleDeleteRes(res, null)
					return
				}

				handleUserData(res, dispatch)
				toast({
					title: 'Default delivery location set!',
					status: 'success',
					duration: 3000,
					isClosable: true,
				})
			})
			.catch(err => {
				console.log(err);
				if (isDelete) {
					handleDeleteRes(null, true)
					return
				}
				toast({
					title: 'Could not set default delivery location',
					status: 'error',
					duration: 3000,
					isClosable: true,
				})
			})
	}

	function handleDeleteRes(res, err) {
		if (res) {
			dispatch(setUserLocation(res.data))
			toast({
				title: res.message,
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		return toast({
			title: res.message,
			status: 'error',
			duration: 3000,
			isClosable: true,
		})
	}

	function handleMainClick() {
		props?.onClick && props?.onClick()
	}


	return (
		<Box onClick={handleMainClick} boxShadow="lg" borderRadius="lg" maxW="600px" minW="450px" bg="#FFF" w="100%" overflow="hidden" p={4} mb={4} fontFamily="DM Sans" _hover={{ cursor: "pointer" }}>
			{checkDefaultLocation() && (
				<Box bg="green.100" justifyContent="center" p={1} m="-10px" mb="0px" borderRadius="5px">
					<Text color="green.700" fontWeight="bold" ml={2}>Default Location</Text>
				</Box>
			)}
			<VStack spacing={4} alignItems="stretch">
				<HStack justifyContent="space-between" alignItems="center">
					<Text fontWeight="semibold" color="blue.700" fontSize="lg">{item.name}</Text>
					<HStack spacing={4}>
						<Image src={CallSvg} w="25px" h="25px" />
						<Text fontSize="sm" color="gray.700">{item.phone}</Text>
						<Menu>
							<MenuButton
								as={IconButton}
								icon={<Image src={MenuSvg} w="25px" h="25px" />}
								variant="ghost"
								onClick={(event) => {
									event.stopPropagation();
								}}
							/>

							<MenuList>
								{props.showFirstLocation ? (
									<MenuItem color="red" onClick={(event) => {
										event.stopPropagation();
										props?.removeLoc();
									}}>Remove</MenuItem>
								) : (
									<>
										<MenuItem onClick={(event) => {
											event.stopPropagation();
											handleSetDefault();
										}} isDisabled={checkDefaultLocation()}>
											{checkDefaultLocation() ? 'Default set' : 'Set as default'}
										</MenuItem>
										<MenuItem color="red" onClick={(event) => {
											event.stopPropagation();
											setShowDeleteModal(true);
										}}>Delete</MenuItem>
									</>
								)}
							</MenuList>

						</Menu>
					</HStack>
				</HStack>
				<HStack alignItems="center" spacing={4}>
					<Image src={GPSSvg} w="20px" h="20px" />
					<Text fontSize="md" color="gray.700">{item.address_text}</Text>
				</HStack>
			</VStack>

			{/* Delete Popup */}
			<AlertDialog isOpen={ShowDeleteModal} onClose={() => {
				setShowDeleteModal(false)
			}}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize='lg' fontWeight='bold'>
							Delete Location?
						</AlertDialogHeader>

						<AlertDialogBody>
							<span style={{ "white-space": "pre-line", fontWeight: "500" }}>
								Are you sure you want to delete this location?
							</span>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button onClick={() => {
								setShowDeleteModal(false)
							}}>
								Cancel
							</Button>
							<Button colorScheme={'red'} onClick={() => handleSetDefault(true)} ml={3}>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Box>
	);
}
