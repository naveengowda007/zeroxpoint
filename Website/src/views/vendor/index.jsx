// Chakra imports
import {
	Box,
	Icon,
	SimpleGrid,
	useColorModeValue,
} from "@chakra-ui/react";

// Custom components
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import React, { useEffect, useState } from "react";
import { MdAddTask, MdFileCopy } from "react-icons/md";
import { hpost, scrollTop } from "res";
import { useSelector } from "react-redux";

// Order List components
import OrderTable from "views/vendor/components/OrderTable";
import { VendorOrderColumnsData } from "views/vendor/ColumnsData";

// Assets

export default function AdminMain() {
	// Chakra Color Mode
	const brandColor = useColorModeValue("brand.500", "white");
	const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

	// states
	const { LatestOrder } = useSelector((state) => state.Config);

	const [Dashboard, setDashboard] = useState({})

	useEffect(() => {
		scrollTop()
		getDashboard()

		let intId = setInterval(getDashboard, 20000);
		return () => clearInterval(intId);
	}, [])

	function getDashboard() {
		hpost('/getDashboard', null, true)
			.then(res => {
				setDashboard(res)
			}).catch(err => console.log(err))
	}

	return (
		<Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
			<SimpleGrid
				columns={{ base: 1, md: 2, lg: 3, "2xl": 4 }}
				gap='20px'
				mb='20px'>

				{/* New orders */}
				<MiniStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
							icon={<Icon w='28px' h='28px' as={MdAddTask} color='white' />}
						/>
					}
					name="Today's Orders"
					value={Dashboard.newOrderCount}
				/>


				{/* Total Orders */}
				<MiniStatistics
					startContent={
						<IconBox
							w='56px'
							h='56px'
							bg={boxBg}
							icon={
								<Icon w='32px' h='32px' as={MdFileCopy} color={brandColor} />
							}
						/>
					}
					name='Total Orders'
					value={Dashboard.orderCount}
				/>
			</SimpleGrid>

			{/* Orders Table */}
			<OrderTable
				columnsData={VendorOrderColumnsData}
				tableData={LatestOrder || []}
			/>
		</Box>
	);
}
