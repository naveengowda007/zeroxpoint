import React, { useEffect, useState } from "react";
import {
	Box, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
	Flex, Icon, Text, Button, Slide
} from "@chakra-ui/react";
import Card from "components/card/Card";
import { MapContainer, TileLayer, Marker, Tooltip, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdStore } from "react-icons/md";


function MapMultipleSelect(props) {
	const { userLocation, setCurSelectedLoc, ShopLocations,
		SelectedShop, setSelectedShop, assignShopCall } = props;

	const [region, setRegion] = useState()
	const [ScrollRef, setScrollRef] = useState([])


	useEffect(() => {
		setRegion({
			lat: userLocation.latitude,
			lng: userLocation.longitude
		})
	}, [])

	useEffect(() => {
		if (!ShopLocations) return

		let temp = ShopLocations.reduce((acc, value) => {
			acc[value.id] = React.createRef();
			return acc;
		}, {})
		setScrollRef(temp)
	}, [ShopLocations])


	const LocationMarker = React.useCallback(() => {
		if (!userLocation) return null;

		const customIcon = new L.Icon({
			iconUrl: require("assets/img/location.png"),
			iconSize: [32, 32],

		});

		return <Marker position={region} icon={customIcon}>
			<Tooltip direction="top" offset={[0, -25]}>
				<Text fontWeight="700" p="0px" m="0px">
					User Location
				</Text>
			</Tooltip>
		</Marker>;
	}, [region, userLocation])

	const ShopsLocationMarker = React.useCallback(() => {
		if (!ShopLocations) return null;

		const shopIcon = new L.Icon({
			iconUrl: require("assets/img/store.png"),
			iconSize: [32, 32],
		});

		const shopSelectedIcon = new L.Icon({
			iconUrl: require("assets/img/greenTick.png"),
			iconSize: [32, 32],
		});

		const ReturnRender = []

		ShopLocations.forEach((shop, index) => {
			const isSelected = SelectedShop?.id === shop.id
			const polyLocations = [
				{
					lat: userLocation.latitude,
					lng: userLocation.longitude
				},
				{
					lat: shop.latitude,
					lng: shop.longitude
				}
			]
			ReturnRender.push(<>
				<Marker key={index}
					icon={isSelected ? shopSelectedIcon : shopIcon}
					position={{
						lat: shop.latitude,
						lng: shop.longitude
					}}
					eventHandlers={{
						click() {
							setSelectedShop(shop)
							ScrollRef[index]?.current?.scrollIntoView({
								behavior: 'smooth',
								block: 'start',
							});
						},
					}}>
					<Tooltip direction="top" offset={[0, -25]}>
						<Text fontWeight="700" p="0px" m="0px">
							{`#${shop.id}`}
						</Text>
					</Tooltip>
				</Marker>
				{isSelected && <Polyline key={`${index}-poly`} pathOptions={{ color: 'green' }} positions={polyLocations} />}
			</>)
		});
		return ReturnRender
	}, [ShopLocations, SelectedShop?.id, setSelectedShop, ScrollRef])

	return (
		<Modal isOpen={true} size="6xl" onClose={() => {
			setCurSelectedLoc()
			setSelectedShop()
		}}>
			<ModalOverlay />
			<ModalContent borderRadius="20px" size="full">
				<ModalHeader px="50px" pb="6px" pt="15px">
					Shop Locations
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Flex>
						<Box w="690px" h="572px">
							{region && <MapContainer
								center={region}
								zoom={15}
								style={{ height: "100%", width: "100%", borderRadius: "15px" }}
								attributionControl={false}
							>
								<TileLayer
									url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
								/>
								<LocationMarker />
								<ShopsLocationMarker />
							</MapContainer>}
						</Box>

						<Box flex={1} overflow="auto" overflowX="hidden" h="590px" px="13.5px" mt="-10px">
							<ul>
								{ShopLocations.map((shop, index) => {
									const isSelected = shop.id === SelectedShop?.id
									return <li key={index} ref={ScrollRef[index]} style={{ paddingTop: "10px", marginBottom: "10px" }}>
										<Box>
											<Card onClick={() => setSelectedShop(shop)}
												className="hoverBaby" bg={isSelected ? "aliceblue" : "#fefefef0"}
												boxShadow={"0px 3px 10px rgba(0, 0, 0, 0.2)"} py="20px">
												<Flex flex={1} mb="5px">
													{`#${shop.id}`}
													<Icon as={MdStore} w='20px' h='20px' mr='10px' ml="3px" />
													<Text fontWeight="medium">
														{shop.shop_name}
													</Text>
												</Flex>
												<Text fontSize={"13px"} fontWeight="500">
													{shop.address_text}
												</Text>
											</Card>


											{isSelected &&
												<Slide direction="left" in={true} style={{ position: "relative" }}>
													<Flex justifyContent="flex-end">
														<Button onClick={assignShopCall} colorScheme="green" m={2} my="15px" mr="30px">
															Assign Shop
														</Button>
													</Flex>
												</Slide>
											}

											{index === ShopLocations.length - 1 && <Box h="50px" />}
										</Box>
									</li>
								})}
							</ul>
						</Box>
					</Flex>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}

export default MapMultipleSelect;