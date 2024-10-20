import React, { useState, useEffect } from 'react';
import { VStack, Text, Spinner, Grid } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { upost } from 'res';
import { setUserLocation } from 'redux/UserLocation';
import LocationCard from './components/LocationCard';
import AddAddress from './components/AddAddress';

export default function LocationList(props) {
	const dispatch = useDispatch();
	const UserData = useSelector((state) => state.UserData);

	const UserLocation = useSelector((state) => {
		let UserLocation = [...state.UserLocation];

		const defaultLocationIndex = UserLocation.findIndex(loc => loc.id === UserData.default_location_id);

		if (defaultLocationIndex !== -1) {
			const defaultLocation = UserLocation.splice(defaultLocationIndex, 1)[0];
			UserLocation.unshift(defaultLocation);
		}

		return UserLocation;
	});

	const [IsLoading, setIsLoading] = useState(true);

	useEffect(() => {
		getLocationData();
	}, [props?.ShowAddLoc]);

	const getLocationData = () => {
		let data = { justFetch: true };
		upost('/location/add', data, true)
			.then(res => {
				// console.log(res);
				dispatch(setUserLocation(res));
				setIsLoading(false);
			})
			.catch(error => {
				setIsLoading(false);
				console.error('Error loading location:', error);
			});
	}

	const locationCardClick = (curClickedItem) => {
		props?.setShowAddLoc && props?.setShowAddLoc(true)
		props?.setCurrentLoc(curClickedItem)
	}

	if (UserLocation.length === 0 && IsLoading) {
		return (
			<VStack spacing={3} align="center" justify="center" mt={6}>
				<Spinner size="xl" color="blue.500" />
				<Text textAlign="center" fontFamily="InterSB" fontSize="sm" mt={2}>
					Loading Locations
				</Text>
			</VStack>
		);
	}


	return (
		<Grid templateColumns={{
			sm: 'repeat(1, 1fr)',
			md: 'repeat(2, 1fr)',
			"2xl": 'repeat(3, 1fr)',
		}} gap="20px">
			<AddAddress setOpenLocationModal={props?.setShowAddLoc} />
			{UserLocation.map((location) => (
				<LocationCard key={location.id} location={location} onClick={() => locationCardClick(location)} />
			))}
		</Grid>
	);
}
