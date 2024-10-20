import Card from "components/card/Card";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


function Map(props) {
	const { userLocation } = props;

	const customIcon = new L.Icon({
		iconUrl: require("assets/img/location.png"),
		iconSize: [32, 32]
	});

	function LocationMarker() {
		if (!userLocation) return null;

		return <Marker position={userLocation} icon={customIcon} />
	}

	return (
		<Card
			boxShadow={"0px 3px 20px rgba(112, 144, 176, 0.12)"}
			p="10px"
			ml="20px"
			borderRadius="2rem"
			style={{ height: 400, width: 400 }}
		>
			{userLocation && <MapContainer
				center={userLocation}
				zoom={12}
				style={{ height: "100%", width: "100%", borderRadius: "2rem" }}
				attributionControl={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<LocationMarker />
			</MapContainer>}
		</Card>
	)
}

export default Map