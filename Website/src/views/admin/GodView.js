import React, { useState, useEffect } from "react";
// Chakra imports
import { Box, Card, useToast } from "@chakra-ui/react";
import { hpost, scrollTop } from "res";

import MapMultiple4Orders from "./components/MapMultiple4Orders";

export default function GodView() {
	const toast = useToast()
	const [LocationData, setLocationData] = useState()

	useEffect(() => {
		scrollTop()
		getData()
	}, [])

	function getData() {
		hpost(`/godView`, {}, true)
			.then(res => {
				// console.log(res);
				setLocationData(res)
			})
			.catch(err => {
				console.log(err);
			})
	}


	return (<Box pt={{ base: "130px", md: "80px", xl: "80px" }} flex={1}>
		{LocationData && <MapMultiple4Orders userLocation={LocationData.users} shops={LocationData.shops} style={{ width: "100vh", height: "75vh" }} hidePoly godView />}
	</Box>
	);
}
