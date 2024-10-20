import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Text, VStack, HStack, Image, Spinner, Grid } from '@chakra-ui/react';
import { upost } from 'res';
import { setUserLocation } from 'redux/UserLocation';
import { PlusSquareIcon } from '@chakra-ui/icons';

import AddAddress from './AddAddress';
import LocationCard from './LocationCard';
import LocationAdd from './LocationAdd';

// Assests
import PickUp from "assets/img/PickUp.png";

export default function DeliveryLocationCard(props) {
	const dispatch = useDispatch();
	const UserData = useSelector((state) => state.UserData);
	const [isLoading, setIsLoading] = useState(true);
	const [openLocationModal, setOpenLocationModal] = useState(false);
	const [deliveryLocation, setDeliveryLocation] = useState([]);
	const [ShowAddLoc, setShowAddLoc] = useState(false)
	const curOpenedLocIndex = useRef(null);

	const UserLocation = useSelector((state) => {
		let UserLocation = [...state.UserLocation];
		const defaultLocationIndex = UserLocation.findIndex(loc => loc.id === UserData.default_location_id);
		if (defaultLocationIndex !== -1) {
			const defaultLocation = UserLocation.splice(defaultLocationIndex, 1)[0];
			UserLocation.unshift(defaultLocation);
		}
		return UserLocation;
	});

	useEffect(() => {
		if (ShowAddLoc)
			return

		let data = { justFetch: true };
		upost("/location/add", data, true)
			.then(res => {
				dispatch(setUserLocation(res));
				setIsLoading(false);
			})
			.catch(error => {
				setIsLoading(false);
				console.error("Error loading location:", error);
			});
	}, [ShowAddLoc]);

	useEffect(() => {
		if (deliveryLocation?.length === 0 && UserLocation.length > 0) {
			try {
				setDeliveryLocation([UserLocation[0]]);
			} catch (error) {
				setDeliveryLocation([]);
			}
		}
	}, [UserLocation]);

	useEffect(() => {
		props?.setDeliveryLocation(deliveryLocation);
	}, [deliveryLocation, props]);

	function openDelocModal(index = null) {
		curOpenedLocIndex.current = index !== null ? index : null;
		setOpenLocationModal(true);
	}

	function removeLoc(index) {
		setDeliveryLocation(val => {
			val.splice(index, 1);
			return [...val];
		});
	}

	if (isLoading) {
		return (
			<>
				<Spinner size="xl" color="blue.500" />
				<Box mt="20px">
					Loading Locations
				</Box>
			</>
		);
	}

	return (
		<>
			{deliveryLocation?.length > 0 && (
				<VStack spacing={4} minW="200px">
					{deliveryLocation.map((item, index) => (
						<LocationCard location={item} key={item.id} showFirstLocation onClick={() => openDelocModal(index)} removeLoc={() => removeLoc(index)} />
					))}

					<Button colorScheme="linkedin" onClick={() => openDelocModal(null)} borderRadius="20px" borderColor="#cdc" borderWidth={1} justifyContent="center" alignItems="center">
						<PlusSquareIcon width={5} height={5} />
						<Text ml={2}>Add more locations</Text>
					</Button>
				</VStack>
			)}

			<Modal isOpen={openLocationModal} onClose={() => setOpenLocationModal(false)} size={{ base: "md", md: "4xl", xl: "6xl" }}>
				<ModalOverlay />
				<ModalContent>
					<ModalCloseButton />
					<ModalBody alignItems="center">
						<HStack spacing={4} mb="10px" mx="10px">
							<Image src={PickUp} w="111px" />
							<Text fontSize="xl" fontWeight="500">
								Select Delivery Location
							</Text>
						</HStack>
						<Grid templateColumns={{
							sm: 'repeat(1, 1fr)',
							md: 'repeat(2, 1fr)',
							"2xl": 'repeat(2, 1fr)',
						}} gap="20px" alignItems="center">

							<AddAddress height setOpenLocationModal={setShowAddLoc} />

							{UserLocation.map((item) => (
								<LocationCard location={item} key={item.id} onClick={() => {
									let index = deliveryLocation.findIndex(val => val.id === item.id);
									if (curOpenedLocIndex.current !== null) {
										if (index >= 0) {
											if (deliveryLocation[curOpenedLocIndex.current].id !== deliveryLocation[index].id)
												removeLoc(curOpenedLocIndex.current);
										} else setDeliveryLocation(val => {
											val[curOpenedLocIndex.current] = item;
											return [...val];
										});
									} else if (index === -1) {
										setDeliveryLocation(val => [...val, item]);
									}
									setOpenLocationModal(false);
								}} />
							))}
						</Grid>
					</ModalBody>
				</ModalContent>
			</Modal>

			{ShowAddLoc && <LocationAdd setShowAddLoc={setShowAddLoc} />}

		</>
	);
}
