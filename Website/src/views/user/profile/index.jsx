import React, { useEffect, useState } from "react";
// Chakra imports
import { Box } from "@chakra-ui/react";
import { scrollTop } from "../../../res";

// Custom components
import Banner from "views/user/profile/components/Banner";

// Assets
import banner from "assets/img/auth/banner.png";
import avatar from "assets/img/profile/Project1.png";
import LocationList from "../LocationList";
import LocationAdd from "../components/LocationAdd";
import { useLocation } from "react-router-dom";
import queryString from 'query-string';

export default function Overview() {
	const [ShowAddLoc, setShowAddLoc] = useState(false)
	const [CurrentLoc, setCurrentLoc] = useState()
	const location = useLocation();

	useEffect(() => {
		const parsed = queryString.parse(location.search);
		if (parsed?.addAddress) {
			setShowAddLoc(true)
		}
	}, [location]);

	useEffect(() => {
		scrollTop()
	}, [])

	useEffect(() => {
		if (!ShowAddLoc) {
			setCurrentLoc()
		}
	}, [ShowAddLoc])

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			{/* Main Fields */}
			<Banner
				gridArea='1 / 1 / 2 / 2'
				banner={banner}
				avatar={avatar}
			/>

			<LocationList ShowAddLoc={ShowAddLoc} setShowAddLoc={setShowAddLoc} setCurrentLoc={setCurrentLoc} />

			{ShowAddLoc && <LocationAdd setShowAddLoc={setShowAddLoc} isUpdate={CurrentLoc} item={CurrentLoc} />}
		</Box>
	);
}