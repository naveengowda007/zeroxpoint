import { Box, Text, useColorModeValue, chakra } from '@chakra-ui/react';

export default function AddAddress(props) {
	function handleClick() {
		props?.setOpenLocationModal && props.setOpenLocationModal(true);
	}

	const bgColor = useColorModeValue("white", "gray.800");
	const textColor = useColorModeValue("gray.800", "white");

	return (
		<chakra.button
			onClick={handleClick}
			borderRadius="lg"
			bg={bgColor}
			overflow="hidden"
			boxShadow="md"
			transition="all  0.15s"
			_hover={{ transform: "scale(1.02)" }}
			fontFamily='DM Sans'
			h="fit-content"
			maxW="600px"
		>
			<Box
				px={10}
				py={5}
				m={2}
				borderRadius="lg"
				bgGradient="linear(to-l, #96e6a1, #d4fc79, #96e6a1, #96e6a1)"
			>
				<Text color={textColor} fontSize="xl" fontWeight="bold">
					{props.height ? "Add New Delivery Location" : "Add Delivery Locations!"}
				</Text>
				<Text fontSize="md" mt={2}>
					Click here to add a location.
				</Text>
				{!props.height && (
					<Text fontSize="md" mt={1}>
						For hassle-free deliveries
					</Text>
				)}
			</Box>
		</chakra.button>
	);
}
