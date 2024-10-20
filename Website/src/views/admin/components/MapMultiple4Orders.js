import Card from "components/card/Card";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";

import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { tileLayers } from "config";


function MapMultiple4Orders(props) {
	const history = useHistory()
	const { userLocation, shops, hidePoly, godView, disableClick } = props;
	const [ShowFullMap, setShowFullMap] = useState(false)

	const customIcon = new L.Icon({
		iconUrl: require("assets/img/location.png"),
		iconSize: [32, 32]
	});

	const [region, setRegion] = useState();
	const [tileIndex, setTileIndex] = useState(0);

	useEffect(() => {
		if (userLocation?.length > 0) {
			setRegion(calculateRegion(userLocation));
		} else setRegion()
	}, [userLocation])


	const handleButtonClick = () => {
		setTileIndex((tileIndex + 1) % tileLayers.length);
	};

	const onIconPress = (item) => {
		if (disableClick) {
			return
		}

		const isShop = item?.shop_name && item?.userid

		if (godView) {
			if (isShop) {
				window.open(`#/admin/vendors?id=${item?.userid}`, '_blank');
			} else if (item?.userid) {
				window.open(`#/admin/users?id=${item?.userid}`, '_blank');
			}
			return
		}

		if (isShop) {
			history.push(`/admin/vendors?id=${item?.userid}`)
		} else if (item?.userid) {
			history.push(`/admin/users?id=${item?.userid}`)
		}
	}

	const ShopsLocationMarker = React.useCallback(() => {
		if (!shops) return null;

		const shopIcon = new L.Icon({
			iconUrl: require("assets/img/store.png"),
			iconSize: [32, 32],
		});

		const ReturnRender = []
		shops.forEach((shop, index) => {
			const userLoc = userLocation[index]

			if (!shop || !userLoc) {
				return
			}

			const polyLocations = [{
				lat: userLoc?.latitude,
				lng: userLoc?.longitude
			}, {
				lat: shop?.latitude,
				lng: shop?.longitude
			}]

			ReturnRender.push(<>
				<Marker key={index}
					position={{
						lat: shop.latitude,
						lng: shop.longitude
					}}
					icon={shopIcon}
					eventHandlers={{
						click() {
							onIconPress(shop)
						},
					}}>
					<Tooltip direction="top" offset={[0, -25]}>
						<Text fontWeight="700" p="0px" m="0px">
							{!godView ? `#${shop.id}, ${shop.shop_name}` : shop.shop_name}
						</Text>
					</Tooltip>
				</Marker>
				{!hidePoly && <Polyline key={`${index}-poly`} pathOptions={{ color: 'green' }} positions={polyLocations} />}
			</>)
		})

		return ReturnRender
	}, [hidePoly, shops, userLocation, godView])


	function LocationMarker() {
		if (!userLocation) return null;

		if (userLocation?.length >= 0) {
			return userLocation.map((res, index) => <Marker key={index} position={{
				lat: res.latitude,
				lng: res.longitude,
			}} icon={customIcon}
				eventHandlers={{
					click() {
						onIconPress(res)
					},
				}}>
				<Tooltip direction="top" offset={[0, -25]}>
					<Text fontWeight="700" p="0px" m="0px">
						{!godView ? `#${index + 1}, ${res.name}` : res.name}
					</Text>
				</Tooltip>
			</Marker>)
		}

		return null;
	}

	const calculateRegion = (points) => {
		let minLat, maxLat, minLng, maxLng;

		// Initialize variables with the first point
		minLat = points[0].latitude;
		maxLat = points[0].latitude;
		minLng = points[0].longitude;
		maxLng = points[0].longitude;

		// Calculate minimum and maximum latitude and longitude
		points.forEach((point) => {
			minLat = Math.min(minLat, point.latitude);
			maxLat = Math.max(maxLat, point.latitude);
			minLng = Math.min(minLng, point.longitude);
			maxLng = Math.max(maxLng, point.longitude);
		});

		// Calculate midpoint latitude and longitude
		const midLat = (minLat + maxLat) / 2;
		const midLng = (minLng + maxLng) / 2;

		// Return the region object
		return {
			lat: midLat,
			lng: midLng,
		};
	};

	if (!region) {
		return null;
	}

	return <Card
		boxShadow={"0px 3px 20px rgba(112, 144, 176, 0.12)"}
		p="10px"
		ml="20px"
		borderRadius="2rem"
		style={{ height: ShowFullMap ? 400 : 200, width: "60%", marginTop: 20, zIndex: 0, ...props?.style }}
	>
		<MapContainer
			center={region}
			zoom={godView ? 9 : 12}
			style={{ height: "100%", width: "100%", borderRadius: "2rem" }}
			attributionControl={false}
			key={ShowFullMap ? "full-map" : "half-map"}
		>
			<TileLayer
				url={tileLayers[tileIndex]}
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			/>

			<ShopsLocationMarker />
			<LocationMarker />
		</MapContainer>

		<Flex style={{ position: "absolute", right: 40, bottom: -20, zIndex: 99 }}>
			<Button bg="#E2E8F0" mr="10px" style={{ borderRadius: "8px", fontSize: "12px", paddingTop: "10px" }}
				onClick={handleButtonClick}>
				Map Tile
			</Button>

			<Button bg="#E2E8F0" style={{ borderRadius: "8px", fontSize: "12px", paddingTop: "10px" }}
				onClick={() => setShowFullMap(val => !val)}>
				{godView ? "Reset" : ShowFullMap ? "Hide Map" : "Expand Map"}
			</Button>
		</Flex>
	</Card>
}

export default MapMultiple4Orders