import Card from "components/card/Card";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";

import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Flex, Text } from "@chakra-ui/react";


function MapMultiple(props) {
	const { userLocation } = props;
	const [ShowFullMap, setShowFullMap] = useState(false)
	const [MapTile, setMapTile] = useState(true)

	const customIcon = new L.Icon({
		iconUrl: require("assets/img/location.png"),
		iconSize: [32, 32]
	});

	const [region, setRegion] = useState();

	useEffect(() => {
		if (userLocation.length > 0) {
			setRegion(calculateRegion(userLocation));
		} else setRegion()
	}, [userLocation])


	function LocationMarker() {
		if (!userLocation) return null;

		if (userLocation.length >= 0) {
			return userLocation.map((res, index) => <Marker key={index} position={{
				lat: res.latitude,
				lng: res.longitude,
			}} icon={customIcon}>
				<Tooltip direction="top" offset={[0, -25]}>
					<Text fontWeight="700" p="0px" m="0px">
						{`#${index + 1}, ${res.name}`}
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

	return (
		<Card
			boxShadow={"0px 3px 20px rgba(112, 144, 176, 0.12)"}
			p="10px"
			ml="20px"
			borderRadius="2rem"
			style={{ height: ShowFullMap ? 400 : 200, width: "60%", marginTop: 20, zIndex: 0 }}
		>
			<MapContainer
				center={region}
				zoom={12}
				style={{ height: "100%", width: "100%", borderRadius: "2rem" }}
				attributionControl={false}
				key={ShowFullMap ? "full-map" : "half-map"}
			>
				{MapTile ? <TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
					:
					<TileLayer
						url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
					/>}
				<LocationMarker />
			</MapContainer>

			<Flex style={{ position: "absolute", right: 40, bottom: -20, zIndex: 99 }}>
				<Button bg="#E2E8F0" mr="10px" style={{ borderRadius: "8px", fontSize: "12px", paddingTop: "10px" }}
					onClick={() => setMapTile(val => !val)}>
					Map Tile
				</Button>

				<Button bg="#E2E8F0" style={{ borderRadius: "8px", fontSize: "12px", paddingTop: "10px" }}
					onClick={() => setShowFullMap(val => !val)}>
					{ShowFullMap ? "Hide Map" : "Expand Map"}
				</Button>
			</Flex>
		</Card>
	)
}

export default MapMultiple