import React, { useEffect, useState } from "react";
import {
	Box, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
	Flex, Text, Button, FormControl, Input, VStack, HStack, useToast, Image, Textarea
} from "@chakra-ui/react";

import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSelector } from 'react-redux';
import { upost, validateName } from "res";
import { tileLayers } from "config";

// Assests
import StartPointSvg from 'assets/img/icons/StartPoint.svg';
import GPSSvg from 'assets/img/icons/GPS.svg';
import CallSvg from 'assets/img/icons/Call.svg';
import ProfileSvg from 'assets/img/icons/Profile.svg';

function LocationAdd(props) {
	const Props = props;
	const UserData = useSelector((state) => state.UserData);
	const [IsLoading, setIsLoading] = useState(false);
	const [region, setRegion] = useState(Props?.isUpdate ? null : {
		lat: 12.975698,
		lng: 77.586772,
		latitudeDelta: 0.0008,
		longitudeDelta: 0.0008,
	});
	const [address, setAddress] = useState('');
	const [name, setName] = useState(Props?.isUpdate ? UserData.name || "" : "");
	const [phone, setPhone] = useState(Props?.isUpdate ? UserData.phone || "" : "");
	const [zipCode, setZipCode] = useState('');
	const [Dummy, setDummy] = useState(0)
	const [tileIndex, setTileIndex] = useState(0);
	const toast = useToast();

	useEffect(() => {
		if (Props?.isUpdate) {
			handleInitUpdate();
			return;
		}
	}, []);


	function setLocations(data) {
		setRegion(data);
	}

	function handleInitUpdate() {
		const item = Props.item;
		let data = {
			lat: item.latitude,
			lng: item.longitude
		}
		setLocations(data);

		const addressText = item.address_text;
		const splitIndex = addressText.lastIndexOf(' ');
		const extractedAddress = addressText.substring(0, splitIndex);
		const extractedZipCode = addressText.substring(splitIndex + 1);
		setAddress(extractedAddress);
		setZipCode(extractedZipCode);
		setName(item.name);
		setPhone(item.phone);
	}

	async function handleGetGPS() {
		if (!navigator.geolocation) {
			console.log('Geolocation is not supported by your browser');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				let data = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
					latitudeDelta: 0.0008,
					longitudeDelta: 0.0008,
				};
				setLocations(data);
				setDummy(val => val + 1)
			},
			(error) => {
				console.log('Error occurred:', error);
			},
			{
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			}
		);
	}

	const handleMapTile = () => {
		setTileIndex((tileIndex + 1) % tileLayers.length);
	};


	function handleSaveLocation() {
		if (!validateName(name) || phone.length !== 10 || address?.trim() == "" || zipCode.length != 6 || !/^\d{6,}$/.test(zipCode) || !/^\d{10,}$/.test(phone)) {
			setIsLoading(false);
			toast({
				title: "Error",
				description: "Please fill all required information",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		let data = {
			name,
			phone,
			address_text: address?.trim() + " " + zipCode,
			latitude: region.lat,
			longitude: region.lng
		};

		let url = "/location/add";

		if (Props?.isUpdate) {
			data.isUpdate = true;
			url = "/location/update";

			const item = Props.item;
			data.id = item.id;
		}

		upost(url, data, true)
			.then(res => {
				toast({
					title: Props?.isUpdate ? "Location Updated!" : "Location Added!",
					status: "success",
					duration: 5000,
					isClosable: true,
				});

				setIsLoading(false);
				closeModal()
			})
			.catch(error => {
				setIsLoading(false);
				console.error("Error updating location:", error);
				toast({
					title: Props?.isUpdate ? "Could not update location!" : "Could not add location!",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			});
	}


	const LocationMarker = () => {
		const customIcon = new L.Icon({
			iconUrl: require("assets/img/location.png"),
			iconSize: [32, 32],

		});

		const map = useMapEvents({
			move() {
				setLocations(map.getCenter());
			},
		})

		return <Marker position={region} icon={customIcon}>
			<Tooltip direction="top" offset={[0, -25]}>
				<Text fontWeight="700" p="0px" m="0px">
					Drop pin here!
				</Text>
			</Tooltip>
		</Marker>;
	}


	const closeModal = () => {
		Props?.setShowAddLoc && Props?.setShowAddLoc(false)
	}

	return (
		<Modal isOpen={true} size="6xl" onClose={closeModal}>
			<ModalOverlay />
			<ModalContent borderRadius="20px" size="full">
				<ModalHeader px="40px" pb="5px" pt="15px">
					Pin thy Location
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Flex>
						<Box w="690px" h="572px">
							{region && <MapContainer key={Dummy}
								center={region}
								zoom={15}
								style={{ height: "100%", width: "100%", borderRadius: "15px" }}
								attributionControl={false}
							>
								<TileLayer
									url={tileLayers[tileIndex]}
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
								/>
								<LocationMarker />
							</MapContainer>}

							<Box position="absolute" zIndex={999} bottom={50} left={30}>
								<Button bgColor='#59BA41' color='white' borderRadius="50px" px="15px"
									_hover={{ transform: 'scale(1.05)' }}
									isLoading={IsLoading}
									isDisabled={IsLoading}
									onClick={handleGetGPS}
								>
									Locate Me
								</Button>

								<Button bgColor='#59BA41' color='white' borderRadius="50px" px="15px" ml="20px"
									_hover={{ transform: 'scale(1.05)' }}
									isLoading={IsLoading}
									isDisabled={IsLoading}
									onClick={handleMapTile}
								>
									Change Map
								</Button>
							</Box>
						</Box>

						<Box flex={1} overflow="auto" overflowX="hidden" h="590px" px="13.5px" mt="20px">
							<Box maxWidth={550} alignSelf="center">
								<VStack spacing={4}>
									<FormControl>
										<HStack>
											<Image src={ProfileSvg} w="25px" h="25px" />
											<Input placeholder="Name" value={name} onChange={(val) => setName(val.target.value)} />
										</HStack>
									</FormControl>

									<FormControl>
										<HStack>
											<Image src={CallSvg} w="25px" h="25px" />
											<Input placeholder="Phone" value={phone} keyboardType="number-pad"
												onChange={(val) => {
													val = val.target.value
													!isNaN(val) && setPhone(val.slice(0, 10).trim())
												}} />
										</HStack>
									</FormControl>

									<FormControl>
										<HStack>
											<Image src={GPSSvg} w="25px" h="25px" />
											<Textarea
												placeholder="Address"
												value={address}
												onChange={(val) => setAddress(val.target.value)}
												minH={"120px"}
												maxH={"180px"}
												maxLength={255}
											/>
										</HStack>
									</FormControl>

									<FormControl>
										<HStack>
											<Image src={StartPointSvg} w="25px" h="25px" />
											<Input placeholder="Zip Code" value={zipCode} keyboardType="number-pad"
												onChange={(val) => {
													val = val.target.value
													!isNaN(val) && setZipCode(val.slice(0, 6).trim())
												}} />
										</HStack>
										<Text fontWeight="500" mt="10px" ml="35px">Bengaluru, Karnata</Text>
									</FormControl>
								</VStack>
							</Box>

							<Box align="center" mt="50px">
								<Button bgColor='#59BA41' color='white' borderRadius="10px" px="40px"
									_hover={{ transform: 'scale(1.05)' }}
									isLoading={IsLoading}
									isDisabled={IsLoading}
									loadingText={Props?.isUpdate ? "Updating..." : "Saving..."}
									onClick={() => {
										setIsLoading(true);
										handleSaveLocation();
									}}
									isLoadingText={Props?.isUpdate ? "Updating..." : "Saving..."}
								>
									{Props?.isUpdate ? "Update Location" : "Save Location"}
								</Button>
							</Box>
						</Box>
					</Flex>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}

export default LocationAdd;